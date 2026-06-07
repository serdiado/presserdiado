# Kullanıcı Paneli — Cline Tasarım Referansı

Bu klasör, Presserdiado `apps/web` projesindeki Kullanıcı Paneli için
piksel-hassas tasarım referansı ve bileşen başlangıç kodlarını içerir.

## Nasıl Kullanılır

1. Dosyaları `apps/web/src/features/dashboard/` veya ilgili feature klasörüne kopyala.
2. Bileşenler **Tailwind 4 + Lucide React** kullanır — mevcut bağımlılıklarla uyumlu.
3. `design-tokens.css`'i `apps/web/src/index.css` içine `@import` et (eğer eklenmemişse).
4. Veri tipleri `types.ts` içinde — Zustand store veya API dönüşüne göre adapt et.

## Mimari

```
Shell.tsx          — TopBar + SideNav wrapper (layout)
pages/
  AnaSayfa.tsx     — KPI'lar + son projeler + hızlı erişim + sipariş durumu
  Projelerim.tsx   — Proje ızgarası, arama, filtreler
  MarkaVarliklari.tsx — Logo, renk paleti, yazı tipleri
  Siparislerim.tsx — Sipariş tablosu
types.ts           — Paylaşılan TypeScript tipleri
design-tokens.css  — Kanonik CSS custom property token'ları
```

## Tasarım Kuralları (Cline için)

- **Zemin:** `bg-stone-100` — `bg-slate-*` KULLANILMAZ
- **Seçili durum:** `border-slate-700` (koyu gri) — `border-blue-*` KULLANILMAZ
- **CTA butonu:** `bg-blue-600` — sayfada sadece bir tane
- **İkincil buton:** `bg-white border border-slate-300 text-slate-700`
- **İkon rengi:** varsayılan `text-slate-500`, aktif `text-slate-800`
- **UI dili:** Türkçe — Canvas→Çalışma Yüzeyi, Dashboard→Ana Sayfa, Template→Şablon vb.
- **Fontlar:** `Inter` (UI), `Oswald` (fiyat/sayı)

## Menü Yapısı

| id | Görünen Ad | Route (öneri) |
|---|---|---|
| home | Ana Sayfa | /dashboard |
| projects | Tasarım Projelerim | /dashboard/projeler |
| templates | Kayıtlı Şablonlarım | /dashboard/sablonlar |
| lists | Ürün Listelerim | /dashboard/urun-listeleri |
| brand | Marka Varlıklarım | /dashboard/marka |
| orders | Baskı Siparişlerim | /dashboard/siparisler |
| files | Dosyalarım | /dashboard/dosyalar |
| team | Ekip ve Paylaşım | /dashboard/ekip |
| billing | Fatura ve Ödeme | /dashboard/fatura |
| account | Hesap Ayarları | /dashboard/ayarlar |
| help | Yardım Merkezi | /dashboard/yardim |

## Kaynak

Proje: https://github.com/serdiado/presserdiado
Terminoloji: `docs/terminoloji/05_Kullanici_Paneli_Terminoloji.md`
Canlı tasarım referansı: bu klasörün üst dizinindeki `index.html` (tarayıcıda açılabilir)
