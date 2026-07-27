#!/bin/bash
# Production yedeği. VPS'te, docker-compose.prod.yml'in aynı sunucuda olduğu varsayımıyla
# çalışır. Desen tezgahimdan.com projesinin backup-db.sh'inden alındı (aynı VPS, kanıtlanmış):
# public_html DIŞINDA bir klasöre yazar (git pull/clean asla dokunmasın, web'den asla servis
# edilmesin diye) - yedekler gerçek kullanıcı verisi içerdiği için dosya izinleri kasıtlı
# olarak kısıtlı tutulur.
#
# tezgahimdan'dan FARKI: Postgres değil MySQL (mysqldump); ayrıca tezgahimdan MinIO/yerel-disk
# dosya deposu kullanmadığı için o script'te hiç olmayan İKİ EK adım var (MinIO verisi +
# ürün/medya görselleri - bkz. apps/api/src/modules/upload/upload.routes.ts, MinIO'ya değil
# yerel diske yazıyor).
#
# KULLANIM
#   ./scripts/backup.sh            → tam yedek (DB + MinIO + görseller). Günlük cron bunu çağırır.
#   ./scripts/backup.sh --sadece-db → yalnızca MySQL dump. deploy.sh bunu çağırır.
#
# NEDEN İKİ MOD: deploy'un bozabileceği tek şey VERİTABANIDIR (migration çalışır). Görseller
# ve MinIO nesneleri deploy'dan etkilenmez, dolayısıyla her deploy öncesi 1,3 GB'lık arşivi
# yeniden üretmek hem 2 dakika kaybettiriyor hem diski dolduruyordu — 2026-07-27'de tam
# olarak bu oldu (bkz. SAKLAMA_ADEDI yorumu). Tam yedek günde bir cron ile alınır; deploy
# öncesinde 400 KB'lık DB dump'ı geri dönüş için yeterli güvenlik ağıdır.
set -euo pipefail

umask 077

SADECE_DB=0
if [ "${1:-}" = "--sadece-db" ]; then
  SADECE_DB=1
fi

cd "$(dirname "$0")/.."

# MYSQL_ROOT_PASSWORD / MYSQL_DATABASE .env.production'dan (repo kökünde, git'e girmez).
set -a
source .env.production
set +a

PROJE_ADI="presserdiado"
DB_CONTAINER="${PROJE_ADI}-mysql-1"
YEDEK_DIZINI="/home/serdiado.com.tr/backups"
SAKLAMA_GUNU=14
# Gün bazlı kural TEK BAŞINA YETMEZ — sayı limiti ZORUNLU.
# GERÇEK OLAY (2026-07-27): tek günde 8+ deploy yapıldı, her deploy ~1,3 GB yedek bıraktı
# (MinIO 539 MB + görseller 790 MB). Hepsi "bugünden" olduğu için -mtime +14 hiçbirini
# silmedi; 57 dosya / 20 GB birikti ve 45 GB'lık disk %100 doldu. Sonuç: yedeğin kendisi
# başarısız oldu (No space left on device) VE üretim bozuldu — Ghostscript/Puppeteer geçici
# dosya yazamadığı için sipariş PDF'i üretimi ile dışa aktarma takıldı.
# Bu yüzden: her türden en fazla SAKLAMA_ADEDI kadar dosya tutulur, tarihi ne olursa olsun.
SAKLAMA_ADEDI=5
# Yedek almadan önce en az bu kadar boş alan olmalı. Doldurmaya başlamaktansa hiç başlamamak
# yeğdir: yarım yazılmış bir arşiv hem işe yaramaz hem de diskte yer kaplar.
ASGARI_BOS_MB=3000

if ! docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
  echo "HATA: $DB_CONTAINER container'i çalışmıyor, yedek alınamadı." >&2
  exit 1
fi

mkdir -p "$YEDEK_DIZINI"
chmod 700 "$YEDEK_DIZINI"

# Fazlalıkları ÖNCE temizle — yeni yedek için yer açar. Eskiden temizlik en sondaydı, yani
# disk zaten doluysa yedek alma denemesi başarısız olup temizliğe hiç sıra gelmiyordu.
eski_yedekleri_buda() {
  local silinen_toplam=0
  for tur in db minio uploads; do
    local fazla
    fazla=$(ls -t "$YEDEK_DIZINI"/presserdiado_${tur}_*.gz 2>/dev/null | tail -n +$((SAKLAMA_ADEDI + 1)) || true)
    if [ -n "$fazla" ]; then
      echo "$fazla" | xargs -r rm -f
      silinen_toplam=$((silinen_toplam + $(echo "$fazla" | wc -l)))
    fi
  done
  # Gün bazlı kural: sayı limitinin altında kalsa bile çok eski olanı tutma.
  local eski_silinen
  eski_silinen=$(find "$YEDEK_DIZINI" -name "presserdiado_*.gz" -mtime +"$SAKLAMA_GUNU" -print -delete 2>/dev/null | wc -l)
  silinen_toplam=$((silinen_toplam + eski_silinen))
  [ "$silinen_toplam" -gt 0 ] && echo "Eski yedek temizliği: $silinen_toplam dosya silindi."
  return 0
}

eski_yedekleri_buda

BOS_MB=$(df -Pm "$YEDEK_DIZINI" | awk 'NR==2 {print $4}')
if [ "$BOS_MB" -lt "$ASGARI_BOS_MB" ]; then
  echo "HATA: yedek dizininde yalnızca ${BOS_MB} MB boş alan var (asgari ${ASGARI_BOS_MB} MB)." >&2
  echo "      Temizlikten sonra da yer açılmadı — diski elle kontrol edin (df -h, du -sh)." >&2
  exit 1
fi

ZAMAN_DAMGASI=$(date +%Y%m%d_%H%M%S)

# --- 1) MySQL dump ---
DB_DOSYA="$YEDEK_DIZINI/presserdiado_db_${ZAMAN_DAMGASI}.sql.gz"
trap 'rm -f "$DB_DOSYA"' ERR
docker exec "$DB_CONTAINER" mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" \
  --single-transaction --routines --triggers "${MYSQL_DATABASE}" \
  | gzip > "$DB_DOSYA"
chmod 600 "$DB_DOSYA"
trap - ERR
echo "DB yedeği alındı: $DB_DOSYA ($(du -h "$DB_DOSYA" | cut -f1))"

if [ "$SADECE_DB" -eq 1 ]; then
  eski_yedekleri_buda
  echo "Yalnızca DB yedeği alındı (--sadece-db). Tam yedek günlük cron ile alınıyor."
  echo "Kalan yedek alanı: $(du -sh "$YEDEK_DIZINI" | cut -f1) · diskte boş: $(df -Ph "$YEDEK_DIZINI" | awk 'NR==2 {print $4}')"
  exit 0
fi

# --- 2) MinIO verisi (sipariş üretim PDF'leri) ---
MINIO_DOSYA="$YEDEK_DIZINI/presserdiado_minio_${ZAMAN_DAMGASI}.tar.gz"
trap 'rm -f "$MINIO_DOSYA"' ERR
docker run --rm -v "${PROJE_ADI}_miniodata:/source:ro" -v "$YEDEK_DIZINI:/backup" \
  alpine tar czf "/backup/$(basename "$MINIO_DOSYA")" -C /source .
chmod 600 "$MINIO_DOSYA"
trap - ERR
echo "MinIO yedeği alındı: $MINIO_DOSYA ($(du -h "$MINIO_DOSYA" | cut -f1))"

# --- 3) Ürün/medya görselleri (yerel disk — bkz. yukarıdaki not) ---
UPLOADS_DOSYA="$YEDEK_DIZINI/presserdiado_uploads_${ZAMAN_DAMGASI}.tar.gz"
trap 'rm -f "$UPLOADS_DOSYA"' ERR
docker run --rm -v "${PROJE_ADI}_api_uploads:/source:ro" -v "$YEDEK_DIZINI:/backup" \
  alpine tar czf "/backup/$(basename "$UPLOADS_DOSYA")" -C /source .
chmod 600 "$UPLOADS_DOSYA"
trap - ERR
echo "Görsel yedeği alındı: $UPLOADS_DOSYA ($(du -h "$UPLOADS_DOSYA" | cut -f1))"

# Yedekler alındıktan SONRA bir kez daha buda: bu çalışmanın kendi dosyaları da sayıma
# dahil olsun (yukarıdaki ilk budama yer açmak içindi).
eski_yedekleri_buda

echo "Kalan yedek alanı: $(du -sh "$YEDEK_DIZINI" | cut -f1) · diskte boş: $(df -Ph "$YEDEK_DIZINI" | awk 'NR==2 {print $4}')"
