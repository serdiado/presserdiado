#!/bin/bash
# Standart production deploy adımı. VPS'te repo kökünde çalıştırılır. Her adım bir
# öncekinin başarılı olmasına bağlı (set -e) - migration hata verirse app yeniden
# başlatılmaz, eski container çalışmaya devam eder (kesinti yaşanmaz).
#
# Desen tezgahimdan.com projesinin deploy.sh'inden alındı (aynı VPS, kanıtlanmış — o
# script'in kendi yorumunda belgelenen GERÇEK bir kesinti: --profile tools OLMADAN
# `build` çalıştırılırsa migrate servisi hiç görülmediği için diskteki ESKİ migrate
# imajı kullanılır; git pull ile gelen yeni migration'lar imaja hiç girmeden "no
# pending migrations" der, app ise yeni koda göre kalkıp DB hatasıyla çöker. Bu satırı
# profilsiz hale GERİ DÖNDÜRME.)
set -euo pipefail

PROJE_ADI="presserdiado"
COMPOSE="docker compose -f docker-compose.prod.yml -p $PROJE_ADI --env-file .env.production"

cd "$(dirname "$0")/.."

echo "=== 1/5: Yedek alınıyor (yalnızca DB) ==="
# Deploy'un bozabileceği tek şey veritabanıdır (migration çalışır); görseller ve MinIO
# nesneleri deploy'dan etkilenmez. Tam yedek günlük cron ile alınıyor. Eskiden burada TAM
# yedek alınıyordu: yoğun bir deploy gününde 8+ kez 1,3 GB yazıldı, 45 GB'lık disk doldu ve
# üretim bozuldu (Ghostscript/Puppeteer geçici dosya yazamadı). Bkz. backup.sh SAKLAMA_ADEDI.
./scripts/backup.sh --sadece-db

echo "=== 2/5: Kod güncelleniyor (git pull) ==="
git pull

echo "=== 3/5: İmaj build ediliyor (api + web + migrate) ==="
$COMPOSE --profile tools build

echo "=== 4/5: Migration uygulanıyor ==="
$COMPOSE --profile tools run --rm migrate

echo "=== 5/5: Uygulama yeniden başlatılıyor ==="
$COMPOSE up -d api web

echo "=== Tamamlandı ==="
