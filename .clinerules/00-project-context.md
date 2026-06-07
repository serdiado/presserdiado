# 00 — Proje Bağlamı (Project Context)

> **Her zaman aktif kuraldır.** Cline her mesajda bunu okur. Tüm ajanların ortak zemini budur.
> Taşınabilir: Claude için `CLAUDE.md`, Gemini için `GEMINI.md` olarak da kullanılabilir.
> `[DOLDUR: ...]` etiketli yerleri Cline'a projeyi okutarak veya elle tamamla.

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
- **Diğer:** Kimlik doğrulama çözümü olarak `@fastify/jwt` ve `bcrypt` ile özel (custom) JWT tabanlı bir kimlik doğrulama yapısı mevcuttur. Ödeme sağlayıcı entegrasyonu (Stripe/iyzico vb.) henüz bulunmamaktadır.

## Monorepo Yapısı

```
apps/        → @matbaapro/api (Fastify backend api), @matbaapro/web (React/Vite/Tailwind4 frontend uygulaması)
packages/    → @matbaapro/grid-engine (grid mizanpaj motoru), @matbaapro/shared (ortak kod, tip ve şablon tanımları), @matbaapro/slot-types (slot veri yapıları/tipleri)
docker/      → konteyner tanımları
docs/        → proje dokümantasyonu
scripts/     → yardımcı scriptler
```

> Cline bu bölümü `pnpm-workspace.yaml`, `turbo.json`, `apps/*/package.json` ve `packages/*/package.json` dosyalarını okuyarak doldurabilir.

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

## KULLANICI HAKKINDA (tüm ajanlar için zorunlu kural)

Kullanıcı **acemi bir geliştiricidir** ve **karar mercii değildir.** Rolü: ne istediğini ve sistemin nasıl işlemesi gerektiğini anlatmak. Mimari ve kod kararlarını **Orchestrator verir ve uygular.** Bu yüzden:

- **Otonom çalış, onayla yavaşlatma.** Sürekli "yapayım mı?" diye sorma. Kullanıcı bir şey istediğinde uzmanlara danış, kararı ver ve uygula. Güvenlik ağı zaten var: Git ve Cline "restore all" ile kod değişiklikleri geri alınabiliyor.
- **Tahmin etme, ama akışı kesme.** İş kuralı veya gereksinim gerçekten belirsizse tek net soru sor. Teknik "nasıl"da (kütüphane, desen, mimari) kararı kendin ver — bu senin işin, kullanıcıya sorma.
- **Sade dil:** Kararı önce tek cümleyle söyle, sonra kısa gerekçe. Jargonu parantezle açıkla.
- **Maliyet bilinci:** Vertex AI kredisiyle çalışıyorsun. Gereksiz uzun çıktı, tekrar dosya okuma, boş tur yapma.

### Onay GEREKMEYEN (doğrudan yap, sonra kısaca bildir)
Kod yazma/düzenleme/silme, dosya oluşturma, refactor, yeni kütüphane ekleme, lint/test/build çalıştırma, migration **üretme** (`db:generate`). Bunlar Git/restore ile geri alınabilir → durma, uygula.

### Onay GEREKEN (Git'in geri alamayacağı, geri dönüşsüz işler — yalnızca bunlarda dur ve sor)
- Veritabanına yazan/silen çalıştırmalar: migration **uygulama** (`db:migrate`), veri silme/güncelleme scriptleri
- Dış dünyaya kalıcı etki: gerçek ödeme/işlem, e-posta/SMS gönderimi, prod ortama deploy
- Sır/güvenlik: `.env` veya kimlik bilgisi içeren dosyaların paylaşımı/commit'i, erişim izni değişikliği
- Geri dönüşü olmayan altyapı: storage göçü, kuyruk/DB temizleme

Kural: **kod = otonom; veri kaybı, para, dış gönderim, sır, prod = önce sor.**

## SİSTEM MİMARİSİ (ajan protokolü)

Bu proje **hub-and-spoke** çok-ajanlı modelle çalışır:

- Tek bir **Kaan (Yönetici Ajan)** vardır — kullanıcının konuştuğu tek muhatap. Tanımı `01-orchestrator.md`'dedir.
- Uzman ajanlar `.clinerules/agents/` klasöründedir ve **yalnızca Orchestrator tarafından** çağrılır.
- Uzman ajanlar **birbiriyle konuşmaz**; sadece Orchestrator'a görüş bildirir.
- **Doğrulama turu:** Orchestrator bir planı veya yazılmış kodu sana **denetlettiğinde**, onu kendi alanın/standardın açısından gerçekten incele. Göstermelik onay verme; sorun varsa somut olarak (neyin, neden, nasıl düzeltileceği) söyle. Sorun yoksa net onayla.
- **Uzmanlar silosunda cevap vermez.** Bir uzman görüş verirken yalnızca kendi alanına bakmaz; önerisinin **diğer uzmanları ve sistemi nasıl etkilediğini, mevcut altyapı/yazılım kabiliyetiyle gerçekten yapılabilir olup olmadığını, ve bütün için doğru karar olup olmadığını** da değerlendirir. Orchestrator'ın bağlam yüklü sorusundaki diğer uzman görüşlerini ve kısıtları hesaba katar. Kendi önerisinin başka bir uzmanın işini zorlaştırdığını görürse bunu açıkça söyler.
- Son kararı **her zaman Orchestrator** verir.
- Bir uzman, görüşünü verirken konunun **yapısal/kritik** olduğunu (sonradan değiştirmesi pahalı, baskı/güvenlik/veri/para riski taşıyan) düşünüyorsa bunu açıkça işaretler: **"Bu önemli bir karar"**. Orchestrator bu sinyali alınca o konuyu daha derin ve çok turlu tartışır.

### Uzman ajan listesi (`.clinerules/agents/`)
| Dosya | Rol |
|---|---|
| `printmaster.md` | Baskıya hâkim grafik tasarım & dosya hazırlık (bleed, CMYK, 300 DPI, doğru PDF) — marks matbaa işidir |
| `senior-dev.md` | Mimari ve core backend |
| `art-director.md` | UI/UX ve design system |
| `business-logic.md` | Matbaa fiyatlandırma matrisi |
| `excel-layout.md` | Excel parse + otomatik hücre yerleştirme |
| `studio-canvas.md` | Canvas editör ve render motoru |
| `devops.md` | Infrastructure, CI/CD, storage, queue |
| `security-auth.md` | Auth, multi-tenant izolasyon, veri güvenliği |
| `qa-tester.md` | Test ve edge-case denetimi |
| `product-manager.md` | PRD, user story, sprint planı |

## GENEL KOD KURALLARI

- TypeScript strict; `any` kullanma, tipleri açık yaz.
- Monorepo sınırlarına saygı: paylaşılan kod `packages/`e, uygulamaya özel kod `apps/`e.
- Mevcut desenleri taklit et; yeni kütüphane eklemeyi kendin kararlaştırabilirsin (onay gerekmez), ama seçimini ve nedenini kısaca belirt.
- Sır/anahtar (API key, DB şifresi) asla koda gömülmez; env üzerinden.
- Her anlamlı değişiklikten sonra ilgili lint/test'i öner.

## TASARIM STANDARTLARI

Tüm UI/UX kararları için yetkili kaynaklar `docs/ui/` klasöründedir:

| Dosya | İçerik |
|---|---|
| `Presserdiado_Renk_Sistemi.docx` | Token'lar, renk paleti, hardcode yasak listesi |
| `Presserdiado_Component_Spec_v3_1_1.docx` | Buton/slider/tipografi boyutları, hangi bileşen ne zaman |
| `Presserdiado_UX_Kilavuzu.docx` | Kullanım kararları, prensipler |
| `Presserdiado_Bagimsiz_UX_UI_Raporu.md` | Bağımsız denetim, öncelik sırası, kritik bulgular |

ArtDirector görsel karar verirken bu dosyaları okur. Hardcode hex, font-bold, uppercase gibi yasaklar bu belgelerde tanımlıdır.

## BİLEŞEN SÖZLÜĞÜ (Komut ↔ Dosya Eşleşmesi)

Kullanıcı komutlarında aşağıdaki Türkçe isimleri kullanır. Sen bu isimleri gördüğünde doğrudan ilgili dosyaya git, açıklama isteme.

| Kullanıcı Adı | Dosya / Component | Açıklama |
|---|---|---|
| **Üst Bar** | `TopBar.tsx` | Sabit üst araç çubuğu: geri/ileri, zoom, proje menüsü, fiyat, indir |
| **Hızlı Bar** | `ContextualBar.tsx` | Seçime göre değişen bağlamsal araç çubuğu: slot/zemin/modül seçilince ilgili hızlı ayarlar |
| **Sağ Panel** | `Sidebar.tsx` | Açılır/kapanır sağ panel: Ürünler, Tasarım, Hücre, Modüller sekmeleri |
| **Sol Panel** | `IconSidebar.tsx` | Sol kenar dikey ikon menüsü: Bekleme, Formalar, Projeler, Temalar, Medya, Modüller, Araçlar |
| **Kanvas** | `Canvas.tsx` | Tasarım çizim alanı |
| **Katman Renderer** | `LayerRenderer.tsx` | Kanvas içindeki katman render motoru |

> Bu sözlük büyüyebilir. Yeni bir bileşene Türkçe isim verildiğinde buraya ekle.



Bu projeyi bir yazılımcıya devredeceksiniz. Commit geçmişi onun için teknik belge niteliği taşır — "ne yapıldı, neden yapıldı" geçmişe bakıldığında anlaşılabilmeli.

### Branch stratejisi
- `main` → kararlı, çalışan kod. Direkt commit atma.
- `dev` → aktif geliştirme branchi. Buraya çalış.
- Yeni özellik veya düzeltme başlarken: `git checkout -b feature/ozellik-adi` veya `fix/sorun-adi`.
- İş bitince `dev`'e merge et. `main`e sadece kararlı sürümler gider.

### Ne zaman commit at
Her anlamlı, tek bir amacı olan değişiklik tamamlandığında — **kod çalışıyor olsun, ama küçük ve odaklı olsun.** Şu durumlar commit tetikler:
- Yeni bir bileşen/özellik tamamlandı
- Bir hata düzeltildi
- Refactor edildi (davranış değişmeden)
- Konfigürasyon/ortam değişikliği yapıldı
- Bağımlılık eklendi/kaldırıldı

"Her şeyi bitince tek commit" yapma — bu geçmişi anlamsız kılar.

### Commit mesajı formatı (Conventional Commits)
```
<tip>(<kapsam>): <ne yapıldı — Türkçe, net, kısa>
```

**Tipler:**
- `feat` → yeni özellik
- `fix` → hata düzeltme
- `refactor` → davranış değişmeden kod iyileştirme
- `style` → UI/CSS değişikliği (mantık değil)
- `chore` → bağımlılık, config, tooling
- `docs` → dokümantasyon

**Kapsam:** değişikliğin etkilediği alan — `studio`, `api`, `auth`, `pdf`, `excel`, `topbar` gibi.

**Örnekler:**
```
feat(studio): fiyat hesabı topbar'a popover olarak taşındı
fix(auth): JWT token süresi dolunca yönlendirme düzeltildi
refactor(pdf): mm-px-pt dönüşümü merkezi modüle alındı
chore(deps): pdf-lib ve puppeteer güncellendi
style(studio): kanvas arka plan rengi ayarlandı
```

❌ Kötü mesajlar: `fix`, `update`, `değişiklik`, `wip`, `asdfgh`
✅ Bir yazılımcı mesajı okuyunca ne değiştiğini anlamalı.

### Commit atmadan önce kontrol
1. `pnpm typecheck` geçiyor mu?
2. `pnpm lint` temiz mi?
3. `.env` veya sır içeren dosya commit'e girmiyor mu? (`git status` ile kontrol et)
4. Commit tek bir amaca mı odaklanıyor, yoksa karışık mı?

### Push ve senkron
- Her çalışma sonunda `git push` — local'de bırakma, uzak repoya gönder.
- `main`e doğrudan push atma; PR veya `dev`'den merge yap.

### Orchestrator'ın görevi
Bir iş tamamlandığında otomatik olarak uygun bir commit öner:
- Tipi ve kapsamı belirle
- Mesajı Conventional Commits formatında yaz
- `pnpm typecheck` + `pnpm lint` geçtikten sonra commit'i at
- `git push` ile uzağa gönder
- Kullanıcıya kısaca bildir: hangi branch'te, hangi commit atıldı
