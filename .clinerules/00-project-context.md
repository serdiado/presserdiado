# 00 — Proje Bağlamı (Project Context)

> **Her zaman aktif kuraldır.** Cline her mesajda bunu okur. Tüm ajanların ortak zemini budur.
> Taşınabilir: Claude için `CLAUDE.md`, Gemini için `GEMINI.md` olarak da kullanılabilir.

---

## Proje Nedir

**MatbaaPro** — geleneksel matbaacılığı modern bir SaaS + e-ticaret altyapısıyla birleştiren bir platform. Kullanıcılar online tasarım yapar, Excel listesinden otomatik katalog/broşür üretir, baskı siparişi verir.

**Çekirdek yetenekler:**
1. E-ticaret + üyelik + sepet/ödeme akışı
2. Hücre bazlı tasarım stüdyosu (web-to-print editör)
3. Excel listesinden otomatik mizanpaj ("Otomatik Yerleştir")
4. Matbaaya özel dinamik fiyatlandırma (gramaj, selefon, lak, adet bazlı)
5. Baskıya uygun yüksek çözünürlüklü PDF üretimi (300 DPI, CMYK, bleed)

## Teknik Yığın (Stack)

- **Monorepo:** pnpm workspace + Turborepo
- **Dil:** TypeScript
- **Frontend:** React + Tailwind (Vite v6 ve Tailwind v4 kullanılmaktadır. Router olarak React Router v7 / `react-router-dom` tercih edilmiştir.)
- **Backend:** Fastify (Fastify v5 (`fastify: ^5.0.0`) kullanılmaktadır.)
- **ORM / DB:** Drizzle ORM + MySQL (`mysql2` sürücüsü kullanılmaktadır.)
- **Tasarım editörü:** Harici bir canvas kütüphanesi (Fabric.js, Konva vb.) kullanılmamaktadır; tamamen custom React, DOM ve CSS tabanlı mizanpaj ve katman sistemi (`Canvas.tsx`, `LayerRenderer.tsx`) kullanılmaktadır.
- **Altyapı:** Docker (repo'da `docker/` klasörü var) + Yerel disk depolama (Yüklemeler şimdilik `/uploads` yerel dizinine kaydedilmekte ve `@fastify/static` ile sunulmaktadır; S3 uyumlu obje depolama (MinIO/S3) yapılandırması hazırdır ancak aktif değildir). Arka plan işleri için BullMQ ve Redis kullanılmaktadır. PDF üretimi ve render işlemleri için `pdf-lib` ve `puppeteer` mevcuttur.
- **Görüntü yakalama (thumbnail + JPG export):** `html2canvas-pro` (oklch/lab/color() destekli; `useCORS` ile cross-origin görseller, foreignObject kullanmadığı için flex satır düzeni korunur). Eski `html-to-image` ve `html2canvas` kaldırılmıştır — tek standart `html2canvas-pro`.
- **Diğer:** Kimlik doğrulama çözümü olarak `@fastify/jwt` ve `bcrypt` ile özel (custom) JWT tabanlı bir kimlik doğrulama yapısı mevcuttur. Ödeme sağlayıcı entegrasyonu (Stripe/iyzico vb.) henüz bulunmamaktadır.

## Monorepo Yapısı

```
apps/        → @matbaapro/api (Fastify backend api), @matbaapro/web (React/Vite/Tailwind4 frontend uygulaması)
packages/    → @matbaapro/grid-engine (grid mizanpaj motoru), @matbaapro/shared (ortak kod, tip ve şablon tanımları), @matbaapro/slot-types (slot veri yapıları/tipleri)
docker/      → konteyner tanımları
docs/        → proje dokümantasyonu
scripts/     → yardımcı scriptler
```

## Geliştirme Komutları

- Kurulum: `pnpm install`
- Geliştirme: `pnpm dev` (veya `turbo dev` ile tüm uygulamaları geliştirme modunda başlatır)
- Build: `pnpm build` (veya `turbo build` ile tüm uygulamaları derler)
- Test: Henüz bir test kütüphanesi veya test scripti tanımlanmamıştır.
- Tip Kontrolü: `pnpm typecheck` (veya `turbo typecheck`)
- Lint: ESLint (`eslint.config.js`) + Prettier (`.prettierrc`) — `pnpm lint` (veya `turbo lint`)
- Veritabanı Komutları:
  - Migration Üretme: `pnpm db:generate`
  - Migration Çalıştırma: `pnpm db:migrate`
  - Drizzle Studio: `pnpm db:studio`

---

## ÇALIŞMA MODELİ (tüm ajanlar için zorunlu kural)

Bu projede **orkestratör ajan yoktur.** Eski hub-and-spoke modeli (Kaan + çoklu ajan müzakeresi) emekliye ayrılmıştır. Yeni model:

- **Kullanıcı, her görevi doğrudan tek bir uzman ajana verir.** Hangi uzmanın gerektiğine kullanıcı karar verir. Ajanlar birbirini çağırmaz, aralarında müzakere yapmaz.
- **Her ajan kendi uzmanlık dökümanına ve bu bağlam dosyasına göre çalışır.** Görevi alır, kendi alanı çerçevesinde en doğru çözümü tasarlar.
- **Denetim katmanı Cline'ın Plan/Act akışıdır.** Ajan **Plan modunda** çözümünü/planını sunar, uygulamaz. Kullanıcı planı dış bir mimari danışmanla (Claude) birlikte inceler, gerekirse düzeltir, sonra **Act moduna** alır. Act'e alınana kadar ajan kod yazmaz.
- **Karar mercii kullanıcı + mimari danışmandır (Claude).** Ajan kendi başına "uygula" kararı vermez; Plan'ı sunar, onay Act geçişiyle gelir.

### Kullanıcı hakkında
Kullanıcı ürün sahibidir ve **ne istediğini + sistemin nasıl işlemesi gerektiğini** anlatır. Mimari ve plan kararları kullanıcı ile mimari danışman (Claude) tarafından, ajanın sunduğu plan üzerinden birlikte verilir. Ajanın işi: alanında **en doğru, kökten ve mimari açıdan sağlam** çözümü planlamak ve (Act'te) uygulamak.

> **Geçici çözüm / yama / workaround istenmez.** Her sorunda öncelik daima kökten, mimari açıdan doğru ("olması gerektiği gibi") çözümdür. Geçici fix'i varsayılan olarak sunma; en baştan doğru mimariyi öner.

### Plan modunda ajandan beklenen
- Sorunun/işin **kök nedenini veya gerçek gereksinimini** tespit et — tahminle değil, ilgili kodu/dosyaları okuyarak.
- Çözümü net adımlarla sun: hangi dosyada ne değişecek, neden.
- Daha önce denenmiş ve işe yaramamış bir yaklaşım varsa belirt (tekrar denenmesin).
- Kararın yapısal/kritik (sonradan değiştirmesi pahalı; baskı/güvenlik/veri/para riski taşıyan) olduğunu düşünüyorsan **"Bu önemli bir karar"** diye işaretle.
- Belirsiz bir iş kuralı/gereksinim varsa **tek net soru** sor; teknik "nasıl"da (kütüphane, desen) kararı kendin öner.

### Act modunda ajandan beklenen
- Planı uygula. Mevcut desenleri taklit et.
- Değişiklik sonrası `pnpm typecheck` + `pnpm lint` çalıştır.
- Uygun, tek amaçlı bir commit öner (aşağıdaki Git kuralları).
- Otomatik doğrulayamadığın runtime adımlarını dürüstçe belirt ("şunu sen test etmelisin"). **Sahte "test ettim" deme.**

### Onay GEREKEN (geri dönüşsüz, Act'te bile önce sor)
- Veritabanına yazan/silen çalıştırmalar: migration **uygulama** (`db:migrate`), veri silme/güncelleme scriptleri
- Dış dünyaya kalıcı etki: gerçek ödeme/işlem, e-posta/SMS gönderimi, prod ortama deploy
- Sır/güvenlik: `.env` veya kimlik bilgisi içeren dosyaların paylaşımı/commit'i, erişim izni değişikliği
- Geri dönüşü olmayan altyapı: storage göçü, kuyruk/DB temizleme

Kural: **kod yazma/düzenleme = Plan→Act akışıyla; veri kaybı, para, dış gönderim, sır, prod = ek olarak önce sor.**

### Maliyet bilinci
Vertex AI kredisiyle çalışıyorsun. Gereksiz uzun çıktı, tekrar dosya okuma, boş tur yapma. Tek bir uzmanlık alanına odaklı, net çalış.

---

## UZMAN AJANLAR

Ajanlar `.clinerules/agents/` klasöründedir. Kullanıcı işi doğrudan ilgili ajana verir. Her ajan yalnızca kendi alanında çalışır; başka ajanı çağırmaz.

| Dosya | Rol |
|---|---|
| `printmaster.md` | Baskıya hâkim grafik tasarım & dosya hazırlık (bleed, CMYK, 300 DPI, doğru PDF) |
| `senior-dev.md` | Mimari ve core backend |
| `art-director.md` | UI/UX ve design system |
| `business-logic.md` | Matbaa fiyatlandırma matrisi |
| `excel-layout.md` | Excel parse + otomatik hücre yerleştirme |
| `studio-canvas.md` | Canvas editör ve render motoru |
| `devops.md` | Infrastructure, CI/CD, storage, queue |
| `security-auth.md` | Auth, multi-tenant izolasyon, veri güvenliği |
| `qa-tester.md` | Test ve edge-case denetimi |
| `product-manager.md` | PRD, user story, sprint planı |

### Hangi iş → hangi ajan (kullanıcı için hızlı rehber)
| İstek türü | Ajan |
|---|---|
| Baskı/PDF/çözünürlük/renk | `printmaster` |
| Backend mimari, API, DB şeması | `senior-dev` |
| Arayüz, tasarım, UX, Tailwind, font/renk denetimi | `art-director` |
| Fiyat, gramaj, varyant, sepet hesabı | `business-logic` |
| Excel okuma + otomatik yerleştirme | `excel-layout` |
| Tasarım editörü, katman, render | `studio-canvas` |
| Docker, CI/CD, Redis/BullMQ, storage | `devops` |
| Login, JWT, multi-tenant, veri izolasyonu | `security-auth` |
| Test, hata senaryosu, bozuk girdi | `qa-tester` |
| Öncelik, kapsam, sprint, "ne yapmalıyız" | `product-manager` |

> Bir iş birden fazla alana dokunuyorsa: kullanıcı işi parçalara böler ve her parçayı ilgili ajana ayrı verir; veya ana alanın ajanına verip, planında diğer alanı da hesaba katmasını ister. Sentez ve çapraz kontrol kullanıcı + Claude tarafında yapılır.

---

## GENEL KOD KURALLARI

- TypeScript strict; `any` kullanma, tipleri açık yaz.
- Monorepo sınırlarına saygı: paylaşılan kod `packages/`e, uygulamaya özel kod `apps/`e.
- Mevcut desenleri taklit et; yeni kütüphane eklemeyi planında gerekçesiyle öner.
- Sır/anahtar (API key, DB şifresi) asla koda gömülmez; env üzerinden.
- Her anlamlı değişiklikten sonra ilgili lint/test'i çalıştır.

## TASARIM STANDARTLARI

Tüm UI/UX kararları için yetkili kaynaklar `docs/ui/` klasöründedir:

| Dosya | İçerik |
|---|---|
| `Presserdiado_Renk_Sistemi.docx` | Token'lar, renk paleti, hardcode yasak listesi |
| `Presserdiado_Component_Spec_v3_1_1.docx` | Buton/slider/tipografi boyutları, hangi bileşen ne zaman |
| `Presserdiado_UX_Kilavuzu.docx` | Kullanım kararları, prensipler |
| `Presserdiado_Bagimsiz_UX_UI_Raporu.md` | Bağımsız denetim, öncelik sırası, kritik bulgular |

ArtDirector görsel/font/renk kararı verirken bu dosyaları okur. Hardcode hex, font-bold, uppercase gibi yasaklar bu belgelerde tanımlıdır. Tanımsız Tailwind class (`bg-brand-default`, `bg-error-default` gibi) üretme; yalnızca tanımlı token'ları kullan (`bg-primary`, `bg-danger` vb.).

## BİLEŞEN SÖZLÜĞÜ (Komut ↔ Dosya Eşleşmesi)

Kullanıcı komutlarında aşağıdaki Türkçe isimleri kullanır. Bu isimleri gördüğünde doğrudan ilgili dosyaya git, açıklama isteme.

| Kullanıcı Adı | Dosya / Component | Açıklama |
|---|---|---|
| **Üst Bar** | `TopBar.tsx` | Sabit üst araç çubuğu: geri/ileri, zoom, proje menüsü, fiyat, indir |
| **Hızlı Bar** | `ContextualBar.tsx` | Seçime göre değişen bağlamsal araç çubuğu |
| **Sağ Panel** | `Sidebar.tsx` | Açılır/kapanır sağ panel: Ürünler, Tasarım, Hücre, Modüller sekmeleri |
| **Sol Panel** | `IconSidebar.tsx` | Sol kenar dikey ikon menüsü |
| **Kanvas** | `Canvas.tsx` | Tasarım çizim alanı |
| **Katman Renderer** | `LayerRenderer.tsx` | Kanvas içindeki katman render motoru |
| **Kullanıcı Paneli / Ana Sayfa** | `AnaSayfa.tsx` (`features/dashboard/pages/`) | Dashboard karşılama sayfası; "Son Tasarımlar", istatistik kartları |
| **Proje Kartı** | `ProjectCard.tsx` (`features/dashboard/components/`) | Dashboard'daki tek tasarım kartı (thumbnail + isim + tarih) |
| **Panel Kabuğu** | `Shell.tsx` / `DashboardLayout.tsx` (`features/dashboard/`) | Dashboard TopBar + SideNav düzeni |

> Bu sözlük büyüyebilir. Yeni bir bileşene Türkçe isim verildiğinde buraya ekle.

---

## GIT VE COMMIT DİSİPLİNİ

Bu projeyi ileride bir yazılımcıya devredeceğiz. Commit geçmişi teknik belge niteliği taşır — "ne yapıldı, neden yapıldı" geçmişe bakıldığında anlaşılabilmeli.

### Branch stratejisi
- `main` → kararlı, çalışan kod. Direkt commit atma.
- `dev` → aktif geliştirme branchi. Buraya çalış.
- Yeni özellik/düzeltme: `git checkout -b feature/ozellik-adi` veya `fix/sorun-adi`.
- İş bitince `dev`'e merge. `main`e sadece kararlı sürümler.

### Ne zaman commit at
Her anlamlı, tek amaçlı değişiklik tamamlandığında — kod çalışıyor olsun, küçük ve odaklı olsun. "Her şeyi bitince tek commit" yapma.

### Commit mesajı formatı (Conventional Commits)
```
<tip>(<kapsam>): <ne yapıldı — Türkçe, net, kısa>
```
**Tipler:** `feat`, `fix`, `refactor`, `style`, `chore`, `docs`
**Kapsam:** `studio`, `api`, `auth`, `pdf`, `excel`, `topbar`, `dashboard` gibi.

**Örnekler:**
```
feat(studio): fiyat hesabı topbar'a popover olarak taşındı
fix(auth): JWT token süresi dolunca yönlendirme düzeltildi
fix(thumbnail): html2canvas-pro'ya geçiş, oklch + foreignObject sorunları giderildi
```
❌ Kötü: `fix`, `update`, `değişiklik`, `wip`
✅ Mesajı okuyan ne değiştiğini anlamalı.

### Commit atmadan önce kontrol
1. `pnpm typecheck` geçiyor mu?
2. `pnpm lint` temiz mi?
3. `.env` veya sır içeren dosya commit'e girmiyor mu? (`git status`)
4. Commit tek bir amaca mı odaklı?

### Push
- Her çalışma sonunda `git push` — local'de bırakma.
- `main`e doğrudan push atma; `dev`'den merge yap.
- Act'te iş bitince: tip/lint geçir → commit öner → kullanıcı onaylarsa at → push → kısaca bildir (hangi branch, hangi commit).
