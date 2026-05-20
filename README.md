# MatbaaPro

Web-tabanlı katalog & matbaa tasarım stüdyosu. Süpermarket katalogları, broşürler, etiketler ve daha fazlasını tarayıcıda tasarla, PDF/PNG/JPEG olarak indir.

**Canlı:** [serdiado.de](https://serdiado.de) (planlanan)
**Repo:** [github.com/eokayakca/matbaapro](https://github.com/eokayakca/matbaapro)

---

## İçindekiler

- [Hızlı Bakış](#hızlı-bakış)
- [Gereksinimler](#gereksinimler)
- [Kurulum (Geliştirme)](#kurulum-geliştirme)
- [MySQL Kurulumu ve Şema](#mysql-kurulumu-ve-şema)
- [Sistemi Çalıştırma](#sistemi-çalıştırma)
- [Production Deploy](#production-deploy)
- [Mimari](#mimari)
- [Komut Referansı](#komut-referansı)

---

## Hızlı Bakış

| Katman | Teknoloji |
|---|---|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind 4 + Zustand |
| **Backend** | Node.js 20 + Fastify 5 + TypeScript + Drizzle ORM |
| **Veritabanı** | MySQL 8.0 (veya MariaDB 10.5+) |
| **Cache/Queue** | Redis 7 (BullMQ planlı) |
| **Object storage** | Lokal disk (dev) / S3 veya MinIO (prod planlı) |
| **PDF/PNG export** | Puppeteer + pdf-lib |
| **Excel import** | xlsx |
| **Monorepo** | pnpm workspaces + Turborepo |

**Özellikler:**
- 📐 Stüdyo öncesi sihirbaz (ürün tipi / mod / kağıt / kırım yapısı)
- 🎨 InDesign benzeri DOM-tabanlı tasarım editörü
- ▦ Hücre yapılı + serbest alan, modüller (Banner, Pizza)
- 📊 Excel'den ürün içe aktarma + POS otomatik yerleşim
- 💰 Anlık fiyat hesabı (adet, kağıt, renk, kaplama, cilt — JSON config)
- 📤 PDF/PNG/JPEG export (Puppeteer, 300 DPI, çok-formalı PDF)
- 💾 Proje JSON kaydet/yükle, çoğalt
- 🔍 Mouse-anchored zoom, middle-click + space pan
- 🪟 Özel şablon + kullanıcı modülü kaydetme (localStorage)

---

## Gereksinimler

```
Node.js   >= 20.x
pnpm      >= 9.x
MySQL     >= 8.0      (veya MariaDB 10.5+)
Redis     >= 7        (opsiyonel — şu an sadece config'te)
Git       >= 2.x
```

**Opsiyonel (sadece dev için):**
- Docker + Docker Compose (lokalde MySQL/Redis container ile çalıştırmak için)
- Chromium / Chrome (Puppeteer için — `pnpm install` otomatik indirir)

---

## Kurulum (Geliştirme)

### 1. Repo'yu klonla

```bash
git clone https://github.com/eokayakca/matbaapro.git
cd matbaapro
```

### 2. Bağımlılıkları yükle

```bash
pnpm install
```

İlk yüklemede Puppeteer Chrome'u indirir (~150MB). Eğer atlanırsa manuel:

```bash
cd apps/api && npx puppeteer browsers install chrome
```

### 3. Ortam değişkenlerini ayarla

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

`apps/api/.env` içinde sadece şunu düzenle (geri kalanı default işe yarar):

```env
DATABASE_URL=mysql://root:@localhost:3306/matbaapro
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
```

---

## MySQL Kurulumu ve Şema

### macOS (Homebrew)

```bash
brew install mysql
brew services start mysql

# (opsiyonel) root şifresi ayarla
mysql_secure_installation
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

### Docker ile (önerilen — temiz başlangıç)

```bash
docker compose -f docker/docker-compose.yml up -d mysql
# 3306 portunda hazır olur; user: matbaapro / pass: matbaapro_dev / db: matbaapro
```

### Şemayı yükle

Repo'da `apps/api/drizzle/schema.sql` sıfırdan kurulum için hazır. Tek komutla uygula:

```bash
mysql -u root -p < apps/api/drizzle/schema.sql
```

Bu komut:
1. `matbaapro` veritabanını oluşturur (utf8mb4 collation)
2. 8 tabloyu açar (users, products, projects, product_types, orders, printers, system_templates, user_modules)
3. 8 foreign key constraint kurar
4. Bir örnek `product_types` kaydı ekler (Broşür A3 6 Sayfa) — studio'nun çalışabilmesi için gerekli

**Alternatif:** Drizzle Kit ile (eşdeğer):

```bash
pnpm --filter @matbaapro/api db:migrate
```

### Şema'yı doğrula

```bash
mysql -u root -p matbaapro -e "SHOW TABLES;"
# Beklenen çıktı:
# orders
# printers
# product_types
# products
# projects
# system_templates
# user_modules
# users
```

### Test kullanıcısı oluştur (opsiyonel)

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@matbaapro.local","password":"test12345","companyName":"Test"}'
```

---

## Sistemi Çalıştırma

### Tüm servisleri tek seferde (Turbo)

```bash
pnpm dev
```

### Veya ayrı ayrı

Terminal 1 — API:
```bash
pnpm --filter @matbaapro/api dev
# → http://localhost:3001
```

Terminal 2 — Web:
```bash
pnpm --filter @matbaapro/web dev
# → http://localhost:5173
```

### Sağlık kontrolü

```bash
curl http://localhost:3001/health    # {"status":"ok"}
curl -I http://localhost:5173        # HTTP/1.1 200 OK
```

Tarayıcıda http://localhost:5173 açılır → Login/Register → Dashboard → **+ Yeni Tasarım**.

### Servisleri durdur

```bash
# Foreground'da çalışıyorsa: Ctrl+C
# Background'da: lsof -i :3001 -i :5173 -t | xargs kill
```

---

## Production Deploy

### Domain planı

| Bileşen | URL |
|---------|-----|
| Web | `https://serdiado.de` |
| API | `https://api.serdiado.de` |
| Uploads | `https://api.serdiado.de/uploads/...` |

### Adımlar

**1. MySQL — canlı sunucuda şema kur**

```bash
# Lokal şema.sql'i uzaktaki MySQL'e gönder
mysql -h 34.32.45.126 -P 3306 -u morfagen -p < apps/api/drizzle/schema.sql
```

**2. API sunucusunda**

```bash
cp apps/api/.env.production.example apps/api/.env.production
# DATABASE_URL, JWT_SECRET'ları doldur

pnpm install --frozen-lockfile
pnpm --filter @matbaapro/api build

NODE_ENV=production node apps/api/dist/server.js
# veya systemd / pm2 ile çalıştır
```

**3. Web sunucusunda**

```bash
cp apps/web/.env.production.example apps/web/.env.production
# VITE_API_URL=https://api.serdiado.de/api/v1

pnpm install --frozen-lockfile
pnpm --filter @matbaapro/web build

# apps/web/dist/ klasörünü nginx/Cloudflare/static host'a deploy et
```

**4. Nginx (örnek)**

```nginx
# serdiado.de
server {
  listen 443 ssl http2;
  server_name serdiado.de;
  root /var/www/matbaapro/dist;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}

# api.serdiado.de
server {
  listen 443 ssl http2;
  server_name api.serdiado.de;
  client_max_body_size 25M;  # upload + state için
  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

## Mimari

```
matbaapro/
├── apps/
│   ├── api/                    Fastify backend
│   │   ├── src/
│   │   │   ├── db/             Drizzle ORM schemas
│   │   │   ├── modules/        auth, catalog, project, export, upload
│   │   │   └── server.ts
│   │   ├── drizzle/            Migration + schema.sql
│   │   └── uploads/            Lokal upload dizini (gitignore'da)
│   └── web/                    React + Vite frontend
│       └── src/
│           ├── features/
│           │   ├── auth/       Login, Register
│           │   ├── dashboard/  Proje listesi
│           │   ├── wizard/     Stüdyo öncesi seçim (JSON config)
│           │   ├── studio/     Tasarım editörü (canvas, sidebar, modüller, pricing)
│           │   └── print-view/ Puppeteer hedef sayfası
│           ├── stores/         Zustand store'lar (auth, studio/*)
│           └── lib/            api client, upload helper
├── packages/
│   ├── shared/                 Tipler, sabitler, BrochureTemplate
│   ├── grid-engine/            Pure TS grid layout motoru
│   └── slot-types/             Slot type tanımları
├── docker/
│   └── docker-compose.yml      MySQL + Redis + MinIO
└── turbo.json
```

### Studio Render Mimarisi

Stüdyo **DOM tabanlı** çalışır (Konva değil). mm hassasiyetiyle CSS Grid + transform. Bu sayede:
- Puppeteer ile PDF/PNG export bire bir çıkar
- `contenteditable` ile native metin düzenleme
- CSS clip-path ile katmanlı maskeleme

### Veri Akışı

```
Wizard seçimleri (4 adım)
        ↓
buildTemplateFromWizard()  →  BrochureTemplate
        ↓
catalogStore.applyTemplate()
        ↓
recalculateLayout (grid-engine)
        ↓
Studio render (Canvas + Page + Slot)
```

Persist: `localStorage["matbaapro-studio-v1"]` (zustand persist middleware).

---

## Komut Referansı

| Komut | Açıklama |
|-------|---------|
| `pnpm install` | Tüm workspace bağımlılıkları |
| `pnpm dev` | Tüm app'ler dev modunda (turbo) |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript kontrol |
| `pnpm --filter @matbaapro/api dev` | Sadece API |
| `pnpm --filter @matbaapro/web dev` | Sadece Web |
| `pnpm --filter @matbaapro/api db:generate` | Yeni Drizzle migration üret |
| `pnpm --filter @matbaapro/api db:migrate` | Migration uygula |
| `pnpm --filter @matbaapro/api db:studio` | Drizzle Studio (browser UI) |

---

## Sorun giderme

**MySQL "Invalid ON UPDATE clause for 'updated_at'"** — MySQL 5.7 kullanıyorsun. 8.0+ gerekli.

**Puppeteer "Could not find Chrome"** — `cd apps/api && npx puppeteer browsers install chrome`.

**`unable to resolve port 3306`** — `brew services start mysql` veya `sudo systemctl start mysql`.

**Vite "Cannot find module '@matbaapro/shared'"** — `pnpm install` köke gel.

**Wizard tasarım açılınca beyaz ekran** — `apps/web/src/features/wizard/wizard.config.json` syntax hatası kontrol et.

---

## Lisans

Bu repo özel/kapalı kaynak. © 2026 MatbaaPro.
