# Presserdiado — Oracle VPS Deploy Rehberi

Bu rehber, Presserdiado'yu aynı VPS'te çalışan **tezgahimdan.com'a hiç dokunmadan** canlıya
almak için gereken adımları anlatır. Sunucu: Oracle VPS, `161.118.172.246`, CyberPanel kurulu.

## 1. DNS (Hostinger)

Hostinger'daki domain yönetim panelinden `serdiado.com.tr` için şu A kayıtlarını ekleyin:

| Tip | Ad (Host)  | Değer            |
|-----|------------|------------------|
| A   | @          | 161.118.172.246  |
| A   | www        | 161.118.172.246  |
| A   | api        | 161.118.172.246  |

DNS yayılımı birkaç dakika–birkaç saat sürebilir (`nslookup serdiado.com.tr` ile kontrol
edilebilir).

## 2. CyberPanel'de site oluşturma

CyberPanel'e girin (`https://161.118.172.246:8090`) → **Websites → Create Website**:

- **serdiado.com.tr** için bir kez, **api.serdiado.com.tr** için bir kez (toplam 2 site).
- Package: mevcut herhangi bir paket (PHP sürümü önemli değil, sadece proxy kullanılacak).
- SSL: "Issue SSL" seçeneğini oluşturma sırasında veya sonrasında (DNS yayıldıktan sonra)
  işaretleyin — CyberPanel Let's Encrypt sertifikasını otomatik alır (acme.sh zaten kurulu).

## 3. Reverse-proxy ekleme (vhost.conf)

CyberPanel'in kendi arayüzünde site oluşturulduktan sonra, SSH ile bağlanıp vhost dosyasına
tezgahimdan.com'da kullanılan AYNI deseni ekleyin (yalnızca port farklı):

```
sudo nano /usr/local/lsws/conf/vhosts/serdiado.com.tr/vhost.conf
```

`context /` bloğunun İÇİNE veya `docRoot` bloğundan SONRA şunu ekleyin:

```
extprocessor serdiado_proxy {
  type                    proxy
  address                 127.0.0.1:3010
  maxConns                100
  pcKeepAliveTimeout      60
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}

context / {
  type                    proxy
  handler                 serdiado_proxy
  addDefaultCharset       off
}
```

`api.serdiado.com.tr` için aynısı, port `3011` ile:

```
sudo nano /usr/local/lsws/conf/vhosts/api.serdiado.com.tr/vhost.conf
```

```
extprocessor serdiado_api_proxy {
  type                    proxy
  address                 127.0.0.1:3011
  maxConns                100
  pcKeepAliveTimeout      60
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}

context / {
  type                    proxy
  handler                 serdiado_api_proxy
  addDefaultCharset       off
}
```

Değişikliklerden sonra LiteSpeed'i yeniden yükleyin (restart DEĞİL — mevcut bağlantıları
kesmez, tezgahimdan.com etkilenmez):

```
sudo /usr/local/lsws/bin/lswsctrl reload
```

## 4. İlk deploy

İlk deploy'da henüz bir MySQL container'ı (dolayısıyla yedeklenecek bir şey) yok — `deploy.sh`
"yedek al" adımıyla başladığı için ilk seferde ONU ATLAYIP adımları elle sırayla çalıştırın:

```bash
ssh -i "D:\US\Oracle\Guvenlik_keyleri\ssh-key-2025-09-20.key" ubuntu@161.118.172.246
sudo mkdir -p /home/serdiado.com.tr && cd /home/serdiado.com.tr
sudo git clone <repo-url> app && cd app
sudo cp apps/api/.env.production.example .env.production
sudo nano .env.production   # gerçek şifreleri/sırları doldurun

PROJE_ADI="presserdiado"
COMPOSE="docker compose -f docker-compose.prod.yml -p $PROJE_ADI --env-file .env.production"

$COMPOSE --profile tools build
$COMPOSE up -d mysql minio                       # önce veritabanı/depolama ayağa kalksın
$COMPOSE --profile tools run --rm migrate        # şema oluştur
$COMPOSE run --rm api sh -c "cd /app/apps/api && npx tsx src/db/seed.ts"   # katalog/fiyat verisi (TEK SEFERLİK)
$COMPOSE up -d api web                           # uygulamayı başlat
```

Sonraki her deploy için (kod güncellemesi) artık `./scripts/deploy.sh` yeterli — o script
sırasıyla: yedek alır → `git pull` → build eder → migration uygular → uygulamayı yeniden
başlatır. `db:seed` bir daha çalıştırılmaz (katalog/fiyat verisi zaten DB'de kalıcı;
`seed.ts` idempotent olsa da yalnızca ilk kurulumda gerekli).

## 5. Doğrulama

```bash
docker compose -f docker-compose.prod.yml -p presserdiado ps   # tüm servisler "Up" olmalı
curl -I https://tezgahimdan.com                                 # HİÇ ETKİLENMEMİŞ olmalı
curl -I https://serdiado.com.tr
curl -I https://api.serdiado.com.tr/api/v1/catalog/product-types
```

Ardından tarayıcıda gerçek bir pilot hesabıyla uçtan uca bir sipariş deneyin: giriş, tasarım,
sipariş, PDF dondurma, admin panelden görüntüleme.

## Sonraki deploy'lar

```bash
cd /home/serdiado.com.tr/app && sudo ./scripts/deploy.sh
```

## Yedekleme

`scripts/backup.sh` günlük cron ile otomatik çalıştırılabilir (mevcut CyberPanel/tezgahimdan
cron'larına dokunmadan, crontab'a YENİ bir satır eklenir):

```bash
sudo crontab -e
# şu satırı ekleyin:
0 3 * * * /home/serdiado.com.tr/app/scripts/backup.sh >> /home/serdiado.com.tr/backups/backup.log 2>&1
```
