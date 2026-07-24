// Hero imza sahnesi: urunler.xlsx → kesim işaretli broşür sayfası dönüşümü.
// Sahne bir KESİM MATI (koyu ızgara zemin) üzerinde oynar — arayüz değil, "gösterilen iş"
// okunsun diye. Ortadaki metin anlatım altyazısıdır (buton değil): küçük harf, sessiz gri.
// Satırlar sırayla flaşlar; cyan kılavuz-hücreler ürüne dönüşür; sarı fiyat çipleri oturur.
// Zamanlama --d custom property'siyle landing.css keyframe'lerine bağlıdır.

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

// Örnek market ürünleri — satır ve hücre aynı diziden beslenir (POS = hücre no).
const SAMPLE = [
  { pos: 1, name: 'Süt 1 L', price: '29,90' },
  { pos: 2, name: 'Ayçiçek Yağı 5 L', price: '289,00' },
  { pos: 3, name: 'Un 2 kg', price: '45,50' },
  { pos: 4, name: 'Yumurta 30’lu', price: '89,90' },
  { pos: 5, name: 'Pirinç 1 kg', price: '52,75' },
  { pos: 6, name: 'Deterjan 6 kg', price: '189,90' },
];

const STEP = 0.42; // satır başına sekans aralığı (s)
const START = 0.7; // hero metni otursun diye ilk gecikme (s)
const delayOf = (i: number) => `${(START + i * STEP).toFixed(2)}s`;
const END_DELAY = `${(START + SAMPLE.length * STEP + 0.35).toFixed(2)}s`;

// Ürün illüstrasyonları — tek aile: mürekkep kontur + kırmızı etiket bandı.
// Foto yerine bilinçli çizim dili; gri kutu "boşluk" hissini kaldırır.
function ProductArt({ pos }: { pos: number }) {
  const stroke = { stroke: '#17161B', strokeWidth: 2, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 48 48" className="h-full w-auto" aria-hidden="true">
      {pos === 1 && ( // süt — gable kutu
        <g {...stroke}>
          <polygon points="14,18 24,9 34,18" fill="#fff" />
          <rect x="14" y="18" width="20" height="22" fill="#fff" />
          <rect x="14" y="27" width="20" height="6" fill="#E4262B" strokeWidth="1.6" />
        </g>
      )}
      {pos === 2 && ( // ayçiçek yağı — sarı bidon
        <g {...stroke}>
          <rect x="19" y="7" width="10" height="5" rx="1.5" fill="#E4262B" strokeWidth="1.6" />
          <rect x="20" y="12" width="8" height="6" fill="#FFD23F" />
          <rect x="15" y="17" width="18" height="23" rx="3" fill="#FFD23F" />
          <rect x="18" y="24" width="12" height="9" fill="#fff" strokeWidth="1.6" />
        </g>
      )}
      {pos === 3 && ( // un — kraft paket
        <g {...stroke}>
          <rect x="13" y="9" width="22" height="5" fill="#fff" />
          <rect x="15" y="14" width="18" height="26" fill="#F3EDE0" />
          <rect x="15" y="26" width="18" height="6" fill="#E4262B" strokeWidth="1.6" />
        </g>
      )}
      {pos === 4 && ( // yumurta — viyol
        <g {...stroke}>
          <rect x="12" y="17" width="24" height="8" rx="2" fill="#EFE8DA" />
          <circle cx="17" cy="26" r="4.2" fill="#fff" strokeWidth="1.6" />
          <circle cx="24" cy="26" r="4.2" fill="#fff" strokeWidth="1.6" />
          <circle cx="31" cy="26" r="4.2" fill="#fff" strokeWidth="1.6" />
          <rect x="11" y="28" width="26" height="9" rx="2" fill="#E6DCC9" />
        </g>
      )}
      {pos === 5 && ( // pirinç — çuval
        <g {...stroke}>
          <circle cx="24" cy="13" r="3.2" fill="#EADFC8" strokeWidth="1.6" />
          <rect x="14" y="15" width="20" height="25" rx="5" fill="#EADFC8" />
          <rect x="14" y="27" width="20" height="6" fill="#E4262B" strokeWidth="1.6" />
        </g>
      )}
      {pos === 6 && ( // deterjan — kulplu bidon
        <g {...stroke}>
          <rect x="17" y="8" width="12" height="6" rx="1.5" fill="#FFD23F" strokeWidth="1.6" />
          <rect x="13" y="14" width="20" height="26" rx="3" fill="#fff" />
          <rect x="33" y="18" width="5" height="9" rx="2" fill="none" strokeWidth="1.6" />
          <rect x="13" y="26" width="20" height="6" fill="#E4262B" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  );
}

export function HeroScene() {
  // "Yeniden izle": key değişince sahne remount olur, animasyonlar baştan oynar.
  const [runId, setRunId] = useState(0);

  return (
    <div className="pdl-stage p-4 sm:p-6 md:p-8">
      {/* Sahne başlığı — gösterim çerçevesi: etiket + oynatma kontrolü */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <span className="pdl-mono text-[10px] tracking-[0.18em] uppercase text-white/40">
          Örnek broşür · 6 ürün
        </span>
        <button
          type="button"
          onClick={() => setRunId((k) => k + 1)}
          className="pdl-mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase text-white/50 hover:text-white/90 transition-colors"
        >
          <RotateCcw size={11} /> yeniden izle
        </button>
      </div>

      <div
        key={runId}
        className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_auto_minmax(0,7fr)] items-center gap-4 md:gap-5"
      >
        {/* Sol: Excel kartı */}
        <div className="bg-white border border-black/20 rounded-md shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--pdl-ink-12)] bg-[#f6f6f2]">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-[#1d6f42]" aria-hidden="true" />
            <span className="pdl-mono text-[11px] text-[var(--pdl-ink-60)]">urunler.xlsx</span>
          </div>
          <table className="w-full pdl-mono text-[11px] text-[var(--pdl-ink)]">
            <thead>
              <tr className="text-left text-[10px] text-[var(--pdl-ink-40)]">
                <th className="px-3 py-1.5 font-medium w-10">POS</th>
                <th className="py-1.5 font-medium">ÜRÜN</th>
                <th className="px-3 py-1.5 font-medium text-right">FİYAT</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE.map((p, i) => (
                <tr
                  key={p.pos}
                  className="pdl-row border-t border-[var(--pdl-ink-12)]"
                  style={{ '--d': delayOf(i) } as React.CSSProperties}
                >
                  <td className="px-3 py-[7px] text-[var(--pdl-ink-40)]">{p.pos}</td>
                  <td className="py-[7px]">{p.name}</td>
                  <td className="px-3 py-[7px] text-right">{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Orta: anlatım — buton DEĞİL; küçük harf, sessiz, nokta-nokta ilerliyor */}
        <div className="flex md:flex-col items-center justify-center gap-2 text-white/60">
          <svg
            className="pdl-arrow rotate-90 md:rotate-0"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="12" x2="20" y2="12" />
            <polyline points="13 5 20 12 13 19" />
          </svg>
          <span className="pdl-mono text-[10px] text-white/45 whitespace-nowrap md:[writing-mode:vertical-rl] md:rotate-180">
            hücrelere yerleşiyor<span className="pdl-caption-dots" />
          </span>
        </div>

        {/* Sağ: kesim işaretli broşür sayfası */}
        <div className="pdl-cropwrap">
          <span className="pdl-crop tl" aria-hidden="true" />
          <span className="pdl-crop tr" aria-hidden="true" />
          <span className="pdl-crop bl" aria-hidden="true" />
          <span className="pdl-crop br" aria-hidden="true" />

          <div className="pdl-page p-2.5 sm:p-3">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {SAMPLE.map((p, i) => (
                <div
                  key={p.pos}
                  className="pdl-slot p-1.5 sm:p-2"
                  style={{ '--d': delayOf(i) } as React.CSSProperties}
                >
                  <div className="pdl-slot-content">
                    <div className="h-10 sm:h-14 rounded-[3px] bg-[#f4f2ec] mb-1 grid place-items-center py-0.5">
                      <ProductArt pos={p.pos} />
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-semibold text-[var(--pdl-ink)] leading-tight truncate">
                      {p.name}
                    </div>
                    <div className="mt-0.5 flex items-baseline justify-between gap-1">
                      <span className="pdl-mono text-[7px] text-[var(--pdl-ink-40)]">
                        POS {p.pos}
                      </span>
                      <span className="pdl-price-chip pdl-display inline-block whitespace-nowrap px-1 py-px rounded-[3px] text-[10px] sm:text-[12px] font-semibold leading-none">
                        {p.price} ₺
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Taşma etiketi — sekans sonunda */}
            <span
              className="pdl-bleed-tag pdl-mono absolute -top-2.5 right-3 px-1.5 py-0.5 rounded-[3px] bg-[var(--pdl-red)] text-white text-[8px] tracking-[0.12em]"
              style={{ '--d': END_DELAY } as React.CSSProperties}
            >
              TAŞMA 3 MM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
