// Vitrin — TEK işe odaklı landing: çok ürünlü kampanya broşürü (Excel → slot → baskı).
// Strateji kararı: başka hiçbir baskı ürünü sunulmaz; katalog/ürün-detay kodu PARK
// edilmiştir (App.tsx'te route kapalı, API duruyor). Tasarım dili "Broşür + hassasiyet":
// kağıt zemin, aktüel kırmızısı, etiket sarısı fiyat çipleri, cyan kılavuzlar, kesim
// işaretleri. Tüm stiller landing.css'teki .pdl kapsamında; uygulama token'larına dokunmaz.

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { BrochureConfigurator } from './BrochureConfigurator';
import { HeroScene } from './HeroScene';
import './landing.css';

function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={`w-6 h-6 rounded-[4px] grid place-items-center text-[13px] font-extrabold ${
          light ? 'bg-[var(--pdl-paper)] text-[var(--pdl-ink)]' : 'bg-[var(--pdl-ink)] text-[var(--pdl-paper)]'
        }`}
      >
        P
      </span>
      <span
        className={`text-lg font-extrabold tracking-tight ${
          light ? 'text-white' : 'text-[var(--pdl-ink)]'
        }`}
      >
        Presserdiado
      </span>
    </span>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const isAuthed = useAuthStore((s) => !!s.accessToken);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout({ clearLocalDrafts: true });
    navigate('/login');
  };

  return (
    <header className="pdl bg-[var(--pdl-paper)]/95 backdrop-blur-sm border-b border-[var(--pdl-ink-12)] sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
        <a href="/#top" aria-label="Presserdiado ana sayfa" className="shrink-0">
          <Brand />
        </a>
        <nav className="ml-10 hidden md:flex items-center gap-7 text-sm font-medium text-[var(--pdl-ink-60)]">
          <a href="/#nasil" className="hover:text-[var(--pdl-ink)] transition-colors">Nasıl çalışır</a>
          <a href="/#fiyat" className="hover:text-[var(--pdl-ink)] transition-colors">Fiyat</a>
          <a href="/#sss" className="hover:text-[var(--pdl-ink)] transition-colors">SSS</a>
        </nav>
        <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
          {isAuthed ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs sm:text-sm whitespace-nowrap font-medium text-[var(--pdl-ink-60)] hover:text-[var(--pdl-ink)]"
              >
                Panelim
              </button>
              <button
                onClick={handleLogout}
                className="hidden sm:block text-sm font-medium text-[var(--pdl-ink-40)] hover:text-[var(--pdl-ink)]"
              >
                Çıkış
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-xs sm:text-sm whitespace-nowrap font-medium text-[var(--pdl-ink-60)] hover:text-[var(--pdl-ink)]"
            >
              Giriş yap
            </button>
          )}
          <button
            onClick={() => navigate(isAuthed ? '/new' : '/login?next=/new')}
            className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm whitespace-nowrap rounded-[4px] bg-[var(--pdl-red)] hover:bg-[var(--pdl-red-dark)] text-white font-semibold transition-colors"
          >
            Broşürünü başlat
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const navigate = useNavigate();
  const isAuthed = useAuthStore((s) => !!s.accessToken);

  return (
    <section className="max-w-6xl mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-20">
      <div className="max-w-3xl">
        <div
          className="pdl-fade-up pdl-mono text-[11px] tracking-[0.22em] uppercase text-[var(--pdl-red)]"
          style={{ '--d': '0s' } as React.CSSProperties}
        >
          Marketler ve çok ürünlü kampanyalar için
        </div>
        <h1
          className="pdl-fade-up pdl-display uppercase font-semibold text-[var(--pdl-ink)] mt-4 text-[clamp(2.4rem,7vw,4.6rem)] leading-[1.08] tracking-tight"
          style={{ '--d': '0.08s' } as React.CSSProperties}
        >
          Excel&rsquo;ini yükle.
          <br />
          <span className="text-[var(--pdl-red)]">Broşürün dizilsin.</span>
        </h1>
        <p
          className="pdl-fade-up text-base md:text-lg text-[var(--pdl-ink-60)] mt-5 leading-relaxed max-w-xl"
          style={{ '--d': '0.16s' } as React.CSSProperties}
        >
          Ürün listeni yükle; ürünler fiyatlarıyla birlikte sayfadaki hücrelere otomatik
          yerleşsin. Stüdyoda düzenle, onayla — baskısı kapına gelsin.{' '}
          <strong className="text-[var(--pdl-ink)] font-semibold">Sadece bu.</strong>
        </p>
        <div
          className="pdl-fade-up flex flex-wrap items-center gap-3 mt-7"
          style={{ '--d': '0.24s' } as React.CSSProperties}
        >
          <button
            onClick={() => navigate(isAuthed ? '/new' : '/login?next=/new')}
            className="h-11 px-5 rounded-[4px] bg-[var(--pdl-red)] hover:bg-[var(--pdl-red-dark)] text-white text-sm font-semibold transition-colors"
          >
            Broşürünü başlat
          </button>
          <a
            href="#nasil"
            className="h-11 px-4 inline-flex items-center text-sm font-semibold text-[var(--pdl-ink-60)] hover:text-[var(--pdl-ink)] transition-colors"
          >
            Nasıl çalışır ↓
          </a>
        </div>
      </div>

      <div className="mt-12 md:mt-14">
        <HeroScene />
      </div>
    </section>
  );
}

// Niş beyanı — mürekkep bant. Konum farkımızın kendisi mesajdır.
function NicheBand() {
  return (
    <section className="bg-[var(--pdl-ink)] text-[var(--pdl-paper)]">
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16 grid md:grid-cols-[auto_1fr] gap-6 md:gap-12 items-start">
        <div className="pdl-display uppercase font-semibold text-2xl md:text-3xl leading-tight whitespace-nowrap">
          Sadece bunu
          <br />
          yapıyoruz.
        </div>
        <div className="max-w-2xl">
          <p className="text-sm md:text-base leading-relaxed text-white/70">
            Kartvizit basmıyoruz. Düğün davetiyesi almıyoruz. Tek işimiz{' '}
            <strong className="text-white font-semibold">çok ürünlü kampanya broşürleri</strong> —
            Excel&rsquo;deki ürün listenden baskıya hazır broşüre giden yolun tamamı.
            Haftalık aktüel, aylık kampanya, toptancı kataloğu&hellip; Yüz ürünü tek tek
            kopyala-yapıştır yapmak yerine listeni yüklersin, gerisini yerleşim motoru dizer.
          </p>
          <p className="pdl-mono text-[11px] tracking-[0.16em] uppercase text-white/40 mt-4">
            Tek iş · tek akış · o yüzden iyi
          </p>
        </div>
      </div>
    </section>
  );
}

// 3 adım — gerçek bir sıra olduğu için numara hak edilmiş durumda.
function Steps() {
  const steps = [
    {
      n: '1',
      title: 'Listeni yükle',
      body:
        'Ürün adı, fiyat ve hücre numarası kolonlu Excel’ini sürükle. Ürünler ve fiyatlar sayfadaki hücrelere otomatik dizilir; ürün görsellerin varsa eşleşir.',
      visual: (
        <div className="pdl-mono text-[10px] text-[var(--pdl-ink-60)] bg-white border border-[var(--pdl-ink-12)] rounded-[4px] px-2.5 py-2 inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-[2px] bg-[#1d6f42]" />
          POS · ÜRÜN · FİYAT · GÖRSEL
        </div>
      ),
    },
    {
      n: '2',
      title: 'Düzenle',
      body:
        'Hazır market temalarından birini seç; banner’ı, zeminleri ve fiyat kutularını stüdyoda düzenle. Tasarım bilgisi gerekmez — istersen hiçbir şeye dokunma.',
      visual: (
        <div className="grid grid-cols-4 gap-1 w-24" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 rounded-[2px] ${i === 2 ? 'bg-[var(--pdl-yellow)]' : 'bg-[var(--pdl-ink-12)]'}`}
            />
          ))}
        </div>
      ),
    },
    {
      n: '3',
      title: 'Bas & teslim al',
      body:
        'Onayladığın broşür baskı kontrolünden geçer, CMYK’ya çevrilir ve kargoyla kapına gelir. Ebat, kağıt ve adet seçimine göre fiyatı anlık görürsün.',
      visual: (
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {['#00AEC2', '#E4262B', '#FFD23F', '#17161B'].map((c) => (
            <span key={c} className="w-3.5 h-3.5 rounded-full" style={{ background: c }} />
          ))}
          <span className="pdl-mono text-[10px] text-[var(--pdl-ink-40)] ml-1">CMYK</span>
        </div>
      ),
    },
  ];

  return (
    <section id="nasil" className="max-w-6xl mx-auto px-6 py-16 md:py-20 scroll-mt-20">
      <div className="pdl-mono text-[11px] tracking-[0.22em] uppercase text-[var(--pdl-ink-40)] mb-2">
        Nasıl çalışır
      </div>
      <h2 className="pdl-display uppercase font-semibold text-3xl md:text-4xl tracking-tight mb-10">
        Üç adımda rafta
      </h2>
      <div className="grid md:grid-cols-3 gap-5">
        {steps.map((s) => (
          <div key={s.n} className="bg-white border border-[var(--pdl-ink-12)] rounded-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="pdl-display text-4xl font-semibold text-[var(--pdl-red)] leading-none">
                {s.n}
              </span>
              {s.visual}
            </div>
            <h3 className="text-base font-bold mb-1.5">{s.title}</h3>
            <p className="text-sm text-[var(--pdl-ink-60)] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// İş föyü — matbaa iş emri estetiğinde yetenek listesi.
function SpecSheet() {
  const rows = [
    ['EBAT', 'A4 · A3 — kırımsız veya kırımlı (tek, çift, Z ve fazlası)'],
    ['EXCEL EŞLEŞME', 'Hücre numarası (POS) → sayfadaki yeri, birebir ve otomatik'],
    ['TEMALAR', 'Hazır market temaları: banner, zemin ve fiyat stilleri kurulu'],
    ['FİYAT KUTULARI', 'Tüm ürünlerde tek tıkla aynı stil; tek tek elle uğraşmak yok'],
    ['TAŞMA & KESİM', '3 mm taşma payı ve kesim güvenliği otomatik uygulanır'],
    ['BASKI', '115–200 gr kuşe seçenekleri, adet kademeli fiyat'],
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 pb-16 md:pb-20">
      <div className="bg-white border border-[var(--pdl-ink-12)] rounded-md overflow-hidden max-w-3xl mx-auto">
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--pdl-ink)] text-[var(--pdl-paper)]">
          <span className="pdl-mono text-[11px] tracking-[0.2em] uppercase">İş föyü</span>
          <span className="pdl-mono text-[11px] text-white/50">PRESSERDIADO · YERLEŞİM MOTORU</span>
        </div>
        <dl>
          {rows.map(([label, value], i) => (
            <div
              key={label}
              className={`grid grid-cols-[130px_1fr] sm:grid-cols-[180px_1fr] gap-4 px-5 py-3.5 text-sm ${
                i > 0 ? 'border-t border-dashed border-[var(--pdl-ink-12)]' : ''
              }`}
            >
              <dt className="pdl-mono text-[11px] tracking-[0.1em] text-[var(--pdl-ink-40)] pt-0.5">
                {label}
              </dt>
              <dd className="text-[var(--pdl-ink)] leading-relaxed">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="fiyat" className="bg-white border-y border-[var(--pdl-ink-12)] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="pdl-mono text-[11px] tracking-[0.22em] uppercase text-[var(--pdl-ink-40)] mb-2">
          Fiyat
        </div>
        <h2 className="pdl-display uppercase font-semibold text-3xl md:text-4xl tracking-tight mb-3">
          Broşür baskı fiyatını hesapla
        </h2>
        <p className="text-sm text-[var(--pdl-ink-60)] mb-8 max-w-xl">
          Ebat, kağıt, gramaj ve adedi seç; tutar anlık güncellenir, KDV dahildir.
          Tasarım stüdyosu kullanımı baskı siparişine dahildir.
        </p>
        <BrochureConfigurator />
      </div>
    </section>
  );
}

function ForWho() {
  const cards = [
    { title: 'Market & zincir', body: 'Haftalık aktüel broşürünü Excel’den dakikalar içinde çıkar; her hafta aynı temayla, yeni fiyatlarla.' },
    { title: 'Bakkal & şarküteri', body: 'Aylık kampanya sayfanı tek başına hazırla — ajansa, tasarımcıya, beklemeye gerek yok.' },
    { title: 'Toptancı', body: 'Yüzlerce ürünlük fiyat kataloğunu hücrelere döküp bayilerine gönder.' },
    { title: 'Kampanya yapan herkes', body: 'Kırtasiye, hırdavat, kozmetik… Çok ürün + fiyat listesi olan her iş bu akışa oturur.' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
      <div className="pdl-mono text-[11px] tracking-[0.22em] uppercase text-[var(--pdl-ink-40)] mb-2">
        Kimin için
      </div>
      <h2 className="pdl-display uppercase font-semibold text-3xl md:text-4xl tracking-tight mb-10">
        Çok ürünü olan herkes için
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div key={c.title} className="border-l-2 border-[var(--pdl-red)] pl-4">
            <h3 className="text-base font-bold mb-1.5">{c.title}</h3>
            <p className="text-sm text-[var(--pdl-ink-60)] leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    {
      q: 'Tasarımı ben mi yapıyorum?',
      a: 'Hayır — hazır temalardan birini seçmen yeterli; ürünler ve fiyatlar otomatik yerleşir. İstersen stüdyoda banner, zemin, fiyat kutusu gibi her parçayı kendin düzenleyebilirsin.',
    },
    {
      q: 'Excel dosyamda ne olmalı?',
      a: 'Ürün adı ve fiyat yeterli. Hücre numarası (POS) kolonu eklersen her ürün tam istediğin hücreye oturur; ürün görsellerini de yükleyip adla/kodla eşleştirebilirsin.',
    },
    {
      q: 'Baskı ne kadar sürede elimde olur?',
      a: 'Broşürünü onayladıktan sonra baskı 2 iş günü içinde tamamlanır ve kargoya verilir.',
    },
    {
      q: 'Hangi ebat ve kağıtlar var?',
      a: 'A4 ve A3; kırımsız veya kırımlı seçenekler. Kağıt olarak 115–200 gr kuşe seçenekleri mevcut — hepsinin fiyatını yukarıdaki hesaplayıcıda görebilirsin.',
    },
    {
      q: 'Baskı almadan sadece tasarım yapabilir miyim?',
      a: 'Pilot dönemde stüdyo, baskı siparişiyle birlikte çalışıyor. Yalnızca tasarım/PDF ihtiyacın varsa bize yaz, birlikte bakalım.',
    },
    {
      q: 'Ödeme nasıl işliyor?',
      a: 'Pilot dönemde havale/EFT ile çalışıyoruz; faturan siparişinle birlikte kesilir. Kartla ödeme yakında.',
    },
  ];

  return (
    <section id="sss" className="max-w-3xl mx-auto px-6 pb-16 md:pb-20 scroll-mt-20">
      <div className="pdl-mono text-[11px] tracking-[0.22em] uppercase text-[var(--pdl-ink-40)] mb-2">
        SSS
      </div>
      <h2 className="pdl-display uppercase font-semibold text-3xl md:text-4xl tracking-tight mb-8">
        Sık sorulanlar
      </h2>
      <div className="pdl-faq divide-y divide-[var(--pdl-ink-12)] border-y border-[var(--pdl-ink-12)]">
        {items.map((it) => (
          <details key={it.q} className="py-4">
            <summary className="text-sm font-semibold pr-8">{it.q}</summary>
            <p className="text-sm text-[var(--pdl-ink-60)] leading-relaxed mt-2.5 pr-8">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

// Dürüst pilot daveti — sahte sosyal kanıt yerine gerçek durum.
function PilotBand() {
  const navigate = useNavigate();
  return (
    <section className="bg-[var(--pdl-red)] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-14 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <div className="pdl-mono text-[11px] tracking-[0.22em] uppercase text-white/70 mb-2">
            Pilot dönemi
          </div>
          <h2 className="pdl-display uppercase font-semibold text-2xl md:text-3xl tracking-tight leading-tight">
            İlk 5 markete kurulum + eğitim ücretsiz
          </h2>
          <p className="text-sm text-white/80 mt-2 max-w-xl leading-relaxed">
            Yeni açıldık ve ilk müşterilerimizle birebir çalışıyoruz: ürün listeni birlikte
            yüklüyor, ilk broşürünü birlikte çıkarıyoruz.
          </p>
        </div>
        <button
          onClick={() => navigate('/register')}
          className="h-11 px-6 rounded-[4px] bg-white text-[var(--pdl-red)] hover:bg-[var(--pdl-paper)] text-sm font-bold transition-colors self-start md:self-center shrink-0"
        >
          Pilota katıl
        </button>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="pdl bg-[var(--pdl-ink)] text-white/60">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 md:items-start md:justify-between">
        <div className="max-w-sm">
          <span className="text-white">
            <Brand light />
          </span>
          <p className="text-xs leading-relaxed mt-3">
            Çok ürünlü kampanya broşürleri için tasarım stüdyosu ve baskı.
            Excel&rsquo;ini yükle, broşürün dizilsin, baskısı kapına gelsin.
          </p>
        </div>
        <nav className="flex gap-8 text-xs">
          <div className="flex flex-col gap-2">
            <a href="/#nasil" className="hover:text-white transition-colors">Nasıl çalışır</a>
            <a href="/#fiyat" className="hover:text-white transition-colors">Fiyat</a>
            <a href="/#sss" className="hover:text-white transition-colors">SSS</a>
          </div>
        </nav>
      </div>
      <div className="max-w-6xl mx-auto px-6 pb-8 pt-4 border-t border-white/10 text-[11px]">
        © 2026 Presserdiado · Tüm hakları saklıdır.
      </div>
    </footer>
  );
}

export default function StorefrontPage() {
  return (
    <div id="top" className="pdl min-h-screen">
      <SiteHeader />
      <Hero />
      <NicheBand />
      <Steps />
      <SpecSheet />
      <PricingSection />
      <ForWho />
      <hr className="pdl-cutline max-w-6xl mx-auto" />
      <Faq />
      <PilotBand />
      <SiteFooter />
    </div>
  );
}
