// Public broşür vitrini — web-to-print sipariş akışının giriş kapısı (login öncesi).
// Pazarlama bölümleri (Hero, ProductGrid, HowItWorks, Trust, Footer) GEÇİCİ KABUK —
// docs/web-to-print/Site.jsx tasarımından port; tasarımdaki hardcode Tailwind paleti
// (slate/blue/emerald/stone) olduğu gibi korunur. Fonksiyonel ÇEKİRDEK konfigüratör
// <BrochureConfigurator/> içinde, token-bazlı ve gerçek katalog/fiyat altyapısıyla.

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { BrochureConfigurator } from './BrochureConfigurator';

const ICONS = {
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  arrow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  truck: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  layoutTemplate: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="7" rx="1" />
      <rect x="3" y="14" width="9" height="7" rx="1" />
      <rect x="16" y="14" width="5" height="7" rx="1" />
    </svg>
  ),
} as const;

type ProductId =
  | 'brosur' | 'katalog' | 'etiket' | 'kartvizit' | 'afis' | 'kitapcik' | 'ambalaj' | 'flyer';

interface Product {
  id: ProductId;
  name: string;
  desc: string;
  mm: string;
  active?: boolean;
}

const PRODUCTS: Product[] = [
  { id: 'brosur', name: 'Broşür', desc: 'A4 · A5 · 2-8 sayfa', mm: '210 × 297 mm', active: true },
  { id: 'katalog', name: 'Katalog', desc: 'A4 · 8-32 sayfa', mm: '210 × 297 mm' },
  { id: 'etiket', name: 'Etiket', desc: 'Özel ölçü · roll', mm: '60 × 80 mm' },
  { id: 'kartvizit', name: 'Kartvizit', desc: 'Çift yüz · selefon', mm: '85 × 55 mm' },
  { id: 'afis', name: 'Afiş / Poster', desc: 'A3 · A2 · A1', mm: '420 × 594 mm' },
  { id: 'kitapcik', name: 'Kitapçık', desc: 'Spiralli · iplikli', mm: '148 × 210 mm' },
  { id: 'ambalaj', name: 'Ambalaj', desc: 'Kutu · poşet · taşıma', mm: 'özel ölçü' },
  { id: 'flyer', name: 'El İlanı', desc: 'A5 · A6 · tek yüz', mm: '148 × 210 mm' },
];

function Brand() {
  return (
    <span className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-md bg-slate-900 text-white grid place-items-center text-[13px] font-extrabold">
        P
      </span>
      <span className="text-lg font-extrabold tracking-tight text-slate-900">Presserdiado</span>
    </span>
  );
}

function SiteHeader() {
  const navigate = useNavigate();
  const isAuthed = useAuthStore((s) => !!s.accessToken);
  const logout = useAuthStore((s) => s.logout);

  // Mevcut logout davranışıyla tutarlı (DashboardLayout/AdminShell): çıkış → /login.
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
        <a href="#top"><Brand /></a>
        <nav className="ml-10 hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#products" className="hover:text-slate-900 transition-colors">Ürünler</a>
          <a href="#configurator" className="hover:text-slate-900 transition-colors">Fiyat Hesapla</a>
          <a href="#how" className="hover:text-slate-900 transition-colors">Nasıl Çalışır</a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {isAuthed ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Panelim
              </button>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Çıkış
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Giriş Yap
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            2.140 işletme bugün baskı aldı
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
            Tarayıcıda tasarla,<br />
            <span className="text-slate-500">48 saatte kapına gelsin.</span>
          </h1>
          <p className="text-base text-slate-600 mt-5 leading-relaxed max-w-lg">
            Süpermarket kataloğundan ambalaja, kartvizitten etikete kadar tüm matbaa
            işleriniz tek panelde. Anlık fiyat, baskı kontrolü ve{' '}
            <strong className="text-slate-800">300 DPI</strong> baskı garantisi.
          </p>
          <div className="flex items-center gap-3 mt-7">
            <a
              href="#configurator"
              className="h-11 px-5 inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              Fiyat Hesapla {ICONS.arrow}
            </a>
            <a
              href="#products"
              className="h-11 px-5 inline-flex items-center gap-2 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Ürünleri Gör
            </a>
          </div>
          <div className="flex items-center gap-6 mt-8 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600">{ICONS.check}</span> Excel'den ürünleri otomatik yerleştir
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600">{ICONS.check}</span> Baskı kontrolü ücretsiz
            </div>
          </div>
        </div>

        {/* Hero görsel: mini studio preview */}
        <div className="relative">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ boxShadow: '0 20px 40px -12px rgb(0 0 0 / 0.15)' }}>
            <div className="h-9 bg-slate-50 border-b border-slate-200 flex items-center px-3 gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
              <div className="ml-3 text-[10px] font-mono text-slate-500">presserdiado/studio/yeni-katalog</div>
            </div>
            <div className="bg-stone-200 p-5">
              <div
                className="bg-white shadow-md aspect-16/11 relative"
                style={{ outline: '1px solid #ef4444', outlineOffset: 6 }}
              >
                <div className="grid grid-cols-8 gap-1 p-1.5 h-full">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-sm flex flex-col p-1">
                      <div className="bg-slate-100 rounded flex-1 mb-0.5" />
                      <div className="text-[5px] font-semibold text-slate-700 truncate">Ürün {i + 1}</div>
                      <div className="text-[6px] font-bold text-slate-900" style={{ fontFamily: 'Oswald' }}>12,90 ₺</div>
                    </div>
                  ))}
                </div>
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded">
                  TAŞMA PAYI 3 mm
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -left-6 top-8 bg-white border border-slate-200 rounded-lg shadow-sm p-3 max-w-45 hidden lg:block">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 grid place-items-center">{ICONS.check}</div>
              <div>
                <div className="text-[11px] font-bold text-slate-800">Baskı Kontrolü</div>
                <div className="text-[10px] text-slate-500">Sıfır hata garantisi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductIcon({ id }: { id: ProductId }) {
  const stroke = 'currentColor';
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke={stroke} strokeWidth="1.5" className="text-slate-700">
      {id === 'brosur' && (<><rect x="6" y="4" width="11" height="28" rx="0.5" /><rect x="19" y="4" width="11" height="28" rx="0.5" /></>)}
      {id === 'katalog' && (<><rect x="5" y="5" width="24" height="26" rx="0.5" /><line x1="17" y1="5" x2="17" y2="31" /><line x1="9" y1="11" x2="14" y2="11" /><line x1="9" y1="15" x2="14" y2="15" /><line x1="20" y1="11" x2="25" y2="11" /><line x1="20" y1="15" x2="25" y2="15" /></>)}
      {id === 'etiket' && (<><rect x="6" y="10" width="24" height="16" rx="2" /><circle cx="11" cy="18" r="1.5" /><line x1="16" y1="16" x2="26" y2="16" /><line x1="16" y1="20" x2="22" y2="20" /></>)}
      {id === 'kartvizit' && (<><rect x="4" y="11" width="28" height="16" rx="1" /><line x1="9" y1="17" x2="20" y2="17" /><line x1="9" y1="21" x2="16" y2="21" /></>)}
      {id === 'afis' && (<><rect x="8" y="3" width="20" height="30" rx="0.5" /><circle cx="18" cy="13" r="3" /><line x1="11" y1="22" x2="25" y2="22" /><line x1="11" y1="26" x2="20" y2="26" /></>)}
      {id === 'kitapcik' && (<><rect x="5" y="5" width="26" height="26" rx="0.5" /><line x1="10" y1="5" x2="10" y2="31" /><circle cx="7.5" cy="10" r="0.7" fill={stroke} /><circle cx="7.5" cy="14" r="0.7" fill={stroke} /><circle cx="7.5" cy="18" r="0.7" fill={stroke} /><circle cx="7.5" cy="22" r="0.7" fill={stroke} /><circle cx="7.5" cy="26" r="0.7" fill={stroke} /></>)}
      {id === 'ambalaj' && (<><path d="M6 12l12-6 12 6v15l-12 6-12-6z" /><path d="M6 12l12 6 12-6" /><line x1="18" y1="18" x2="18" y2="33" /></>)}
      {id === 'flyer' && (<><rect x="8" y="6" width="20" height="24" rx="0.5" /><line x1="12" y1="12" x2="24" y2="12" /><line x1="12" y1="16" x2="24" y2="16" /><line x1="12" y1="20" x2="20" y2="20" /></>)}
    </svg>
  );
}

function ProductGrid() {
  // Sadece broşür aktif; diğerleri görünür ama pasif ("Yakında").
  const scrollToConfigurator = () =>
    document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="products" className="bg-stone-100 border-y border-stone-200 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-2">1. Ürün Seçimi</div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Ne basacaksınız?</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRODUCTS.map((p) =>
            p.active ? (
              <button
                key={p.id}
                onClick={scrollToConfigurator}
                className="relative p-5 rounded-xl text-left transition-all bg-white border-2 border-slate-700 hover:border-slate-900"
              >
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-slate-700 text-white grid place-items-center">{ICONS.check}</span>
                <ProductIcon id={p.id} />
                <div className="text-base font-bold text-slate-900 mt-3">{p.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{p.desc}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-2">{p.mm}</div>
              </button>
            ) : (
              <div
                key={p.id}
                aria-disabled="true"
                className="relative p-5 rounded-xl text-left bg-white border border-slate-200 opacity-60 cursor-not-allowed select-none"
              >
                <span className="absolute top-3 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">Yakında</span>
                <ProductIcon id={p.id} />
                <div className="text-base font-bold text-slate-500 mt-3">{p.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                <div className="text-[10px] font-mono text-slate-300 mt-2">{p.mm}</div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function ConfiguratorSection() {
  return (
    <section id="configurator" className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-2">2. Baskı Özellikleri</div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Anlık fiyat hesapla</h2>
          <p className="text-sm text-slate-500 mt-2">
            Broşür için ebat, kağıt, gramaj, renk ve adet seçin. Tutar canlı güncellenir.
          </p>
        </div>
        <BrochureConfigurator />
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '01', icon: ICONS.layoutTemplate, title: 'Şablon seç veya tasarla', body: "Hazır şablon kullanın, kendi tasarımınızı yükleyin veya online tasarım stüdyosunda baştan üretin. Excel'den ürünleriniz otomatik yerleşir." },
    { n: '02', icon: ICONS.shield, title: 'Baskı Kontrolü onaylasın', body: 'Sistem 300 DPI çözünürlük, taşma payı, güvenli alan ve yazı tipi gömme kontrollerini saniyeler içinde tamamlar.' },
    { n: '03', icon: ICONS.truck, title: '48 saatte kapınızda', body: 'Üretim 2 iş gününde tamamlanır. Türkiye geneli kargo Presserdiado tarafından karşılanır.' },
  ];
  return (
    <section id="how" className="bg-white border-y border-slate-200 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-2">3. Nasıl Çalışır</div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">3 adımda baskınız hazır</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="bg-stone-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl font-extrabold text-slate-300 tabular-nums" style={{ fontFamily: 'Oswald, Inter, sans-serif' }}>{s.n}</span>
                <span className="text-slate-700">{s.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-6">
          Türkiye'nin önde gelen perakende markaları
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 items-center">
          {['MİGROS', 'ŞOK', 'A101', 'BİM', 'CARREFOURSA', 'HAKMAR'].map((n) => (
            <div key={n} className="text-center text-base font-extrabold tracking-wider text-slate-400 hover:text-slate-700 transition-colors">{n}</div>
          ))}
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            { stat: '2.140', label: 'işletme bu hafta sipariş verdi' },
            { stat: '48 sa', label: 'ortalama üretim süresi' },
            { stat: '%99,4', label: 'baskı kontrolünden geçme oranı' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-lg p-5 text-center">
              <div className="text-3xl font-bold text-slate-900 tabular-nums" style={{ fontFamily: 'Oswald, Inter, sans-serif' }}>{s.stat}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  const cols = [
    { h: 'Ürünler', items: ['Broşür', 'Katalog', 'Etiket', 'Kartvizit', 'Afiş', 'Kitapçık', 'Ambalaj', 'El İlanı'] },
    { h: 'Kurumsal', items: ['Hakkımızda', 'Müşteri Hikayeleri', 'Basın Odası', 'İletişim'] },
    { h: 'Destek', items: ['Yardım Merkezi', 'Baskı Rehberi', 'Sıkça Sorulanlar', 'Kargo & Teslimat'] },
  ];
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-8">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-white">
            <span className="w-5 h-5 rounded bg-white text-slate-900 grid place-items-center text-[11px] font-extrabold">P</span>
            <span className="text-base font-extrabold tracking-tight">Presserdiado</span>
          </div>
          <p className="text-xs leading-relaxed mt-3 max-w-sm">
            Tarayıcıda tasarla, 48 saatte kapına gelsin. Web-to-print platformu ile
            katalogdan ambalaja tüm matbaa işlerinizi tek panelde yönetin.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.h}>
            <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-3">{col.h}</div>
            <ul className="space-y-2 text-xs">
              {col.items.map((i) => (
                <li key={i}><a href="#" className="hover:text-white transition-colors">{i}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-800 flex items-center justify-between text-[11px]">
        <div>© 2026 Presserdiado · Tüm hakları saklıdır.</div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-white">KVKK</a>
          <a href="#" className="hover:text-white">Çerez Politikası</a>
          <a href="#" className="hover:text-white">Mesafeli Satış Sözleşmesi</a>
        </div>
      </div>
    </footer>
  );
}

export default function StorefrontPage() {
  return (
    <div id="top" className="min-h-screen bg-stone-50">
      <SiteHeader />
      <Hero />
      <ProductGrid />
      <ConfiguratorSection />
      <HowItWorks />
      <Trust />
      <SiteFooter />
    </div>
  );
}
