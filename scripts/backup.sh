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
set -euo pipefail

umask 077

cd "$(dirname "$0")/.."

# MYSQL_ROOT_PASSWORD / MYSQL_DATABASE .env.production'dan (repo kökünde, git'e girmez).
set -a
source .env.production
set +a

PROJE_ADI="presserdiado"
DB_CONTAINER="${PROJE_ADI}-mysql-1"
YEDEK_DIZINI="/home/serdiado.com.tr/backups"
SAKLAMA_GUNU=14

if ! docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
  echo "HATA: $DB_CONTAINER container'i çalışmıyor, yedek alınamadı." >&2
  exit 1
fi

mkdir -p "$YEDEK_DIZINI"
chmod 700 "$YEDEK_DIZINI"

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

# Eski yedekleri temizle — diskin sınırsız dolmasını önler, SAKLAMA_GUNU kadar geriye
# dönük kurtarma imkanı bırakır.
SILINEN=$(find "$YEDEK_DIZINI" -name "presserdiado_*.gz" -mtime +"$SAKLAMA_GUNU" -print -delete | wc -l)
if [ "$SILINEN" -gt 0 ]; then
  echo "$SAKLAMA_GUNU günden eski $SILINEN yedek silindi."
fi
