// UI Theme token types — Presserdiado arayüzünün görsel değerleri.
// Bu dosya katalog EDITOR veri modelinden (design-tokens.ts) bağımsızdır.

export interface UITypographyToken {
  fontSize: string;      // "1.25rem", "0.875rem" vb. — minimum 0.6875rem (11px)
  fontWeight: string;    // "400", "500", "600"
  lineHeight: string;    // "1.3", "1.5" vb.
  letterSpacing: string; // "0em", "-0.01em" vb.
}

export interface UIThemeTokens {
  colors: {
    primary: string;         // CTA buton, aktif sekme
    primaryHover: string;    // Birincil buton hover
    danger: string;          // Silme, hata mesajı
    success: string;         // Başarı bildirimi
    warning: string;         // Uyarı
    surfaceApp: string;      // Uygulama genel zemini
    surfacePanel: string;    // Panel, kart, modal yüzeyi
    surfaceSubtle: string;   // İkincil yüzey, section arka planı
    borderDefault: string;   // Standart kart/panel ayırıcı
    borderStrong: string;    // Hover/focus durumunda border
    borderSelected: string;  // Seçili kart veya hücre
    textPrimary: string;     // Ana başlık, önemli değer
    textSecondary: string;   // Açıklama, label
    textMuted: string;       // Placeholder, ipucu, devre dışı
  };
  typography: {
    fontFamilySans: string;   // Tüm UI rolleri bu font ailesini kullanır
    // Başlık rolleri
    headingXl: UITypographyToken;  // Modal/sayfa başlığı
    navLabel: UITypographyToken;   // Panel Bölüm Başlığı
    headingMd: UITypographyToken;  // Kart/akordiyon başlığı
    headingSm: UITypographyToken;  // Form grup başlığı
    // Gövde metin rolleri
    bodyMd: UITypographyToken;     // Standart içerik metni
    bodySm: UITypographyToken;     // Açıklama, yardım metni
    bodyXs: UITypographyToken;     // Alt etiket, ipucu (min 11px)
    // UI eleman rolleri
    labelMd: UITypographyToken;    // Form etiketi
    labelSm: UITypographyToken;    // Sekme alt etiketi, badge (min 11px)
    iconLabel: UITypographyToken;  // İkon altındaki kısa etiket (min 11px)
  };
  radii: {
    sm:   string; // "4px"
    md:   string; // "8px"
    lg:   string; // "12px"
    xl:   string; // "16px"
    full: string; // "9999px"
  };
  shadows: {
    dropSm: string; // Hafif gölge — kart, input
    dropMd: string; // Orta gölge — dropdown, tooltip
    dropLg: string; // Derin gölge — modal, overlay
  };
  buttons: {
    radius: string; // Birincil buton köşe yarıçapı
    height: string; // Standart buton yüksekliği
  };
}

// ── Açık Tema (Light) Varsayılan Değerleri ───────────────────────────────────
// Tüm değerler mevcut hardcoded Tailwind class'larıyla birebir eşleşir —
// token sistemi aktif olduğunda UI görsel olarak değişmez.

export const defaultLightTheme: UIThemeTokens = {
  colors: {
    primary:        '#1a56db', // blue-600
    primaryHover:   '#1447c0', // blue-700
    danger:         '#dc2626', // red-600
    success:        '#059669', // emerald-600
    warning:        '#d97706', // amber-600
    surfaceApp:     '#f1f5f9', // stone-100
    surfacePanel:   '#ffffff', // white
    surfaceSubtle:  '#f8fafc', // slate-50
    borderDefault:  '#e2e8f0', // slate-200
    borderStrong:   '#cbd5e1', // slate-300
    borderSelected: '#0f172a', // slate-900
    textPrimary:    '#0f172a', // slate-900
    textSecondary:  '#475569', // slate-600
    textMuted:      '#94a3b8', // slate-400
  },
  typography: {
    fontFamilySans: 'Inter, system-ui, sans-serif',
    headingXl: { fontSize: '1.25rem',   fontWeight: '600', lineHeight: '1.3',  letterSpacing: '0em'     },
    navLabel:  { fontSize: '0.8125rem',  fontWeight: '500', lineHeight: '1.4',  letterSpacing: '0em'     },
    headingMd: { fontSize: '0.8125rem',  fontWeight: '600', lineHeight: '1.4',  letterSpacing: '0em'     },
    headingSm: { fontSize: '0.75rem',   fontWeight: '600', lineHeight: '1.4',  letterSpacing: '0em'     },
    bodyMd:    { fontSize: '0.8125rem',  fontWeight: '400', lineHeight: '1.5',  letterSpacing: '0em'     },
    bodySm:    { fontSize: '0.75rem',   fontWeight: '400', lineHeight: '1.5',  letterSpacing: '0em'     },
    bodyXs:    { fontSize: '0.6875rem', fontWeight: '400', lineHeight: '1.4',  letterSpacing: '0em'     },
    labelMd:   { fontSize: '0.75rem',   fontWeight: '500', lineHeight: '1.4',  letterSpacing: '0em'     },
    labelSm:   { fontSize: '0.6875rem', fontWeight: '500', lineHeight: '1.4',  letterSpacing: '0em'     },
    iconLabel: { fontSize: '0.6875rem', fontWeight: '500', lineHeight: '1.3',  letterSpacing: '0.01em'  },
  },
  radii: {
    sm:   '4px',
    md:   '8px',
    lg:   '12px',
    xl:   '16px',
    full: '9999px',
  },
  shadows: {
    dropSm: '0 1px 2px 0px rgba(0,0,0,0.05)',
    dropMd: '0 4px 6px -1px rgba(0,0,0,0.1)',
    dropLg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },
  buttons: {
    radius: '6px',
    height: '36px',
  },
};

// ── Koyu Tema (Dark) Varsayılan Değerleri ────────────────────────────────────

export const defaultDarkTheme: UIThemeTokens = {
  colors: {
    primary:        '#4b7cf3', // blue-500 (koyu arka planda daha iyi kontrast)
    primaryHover:   '#2563eb', // blue-600
    danger:         '#f87171', // red-400
    success:        '#34d399', // emerald-400
    warning:        '#fbbf24', // amber-400
    surfaceApp:     '#0f172a', // slate-900
    surfacePanel:   '#1e293b', // slate-800
    surfaceSubtle:  '#334155', // slate-700
    borderDefault:  '#334155', // slate-700
    borderStrong:   '#475569', // slate-600
    borderSelected: '#e2e8f0', // slate-200
    textPrimary:    '#f1f5f9', // slate-100
    textSecondary:  '#94a3b8', // slate-400
    textMuted:      '#64748b', // slate-500
  },
  typography: {
    // Koyu temada tipografi ölçeği aynıdır, yalnızca renkler değişir
    fontFamilySans: 'Inter, system-ui, sans-serif',
    headingXl: { fontSize: '1.25rem',   fontWeight: '600', lineHeight: '1.3',  letterSpacing: '0em'    },
    navLabel:  { fontSize: '0.8125rem',  fontWeight: '500', lineHeight: '1.4',  letterSpacing: '0em'    },
    headingMd: { fontSize: '0.8125rem',  fontWeight: '600', lineHeight: '1.4',  letterSpacing: '0em'    },
    headingSm: { fontSize: '0.75rem',   fontWeight: '600', lineHeight: '1.4',  letterSpacing: '0em'    },
    bodyMd:    { fontSize: '0.8125rem',  fontWeight: '400', lineHeight: '1.5',  letterSpacing: '0em'    },
    bodySm:    { fontSize: '0.75rem',   fontWeight: '400', lineHeight: '1.5',  letterSpacing: '0em'    },
    bodyXs:    { fontSize: '0.6875rem', fontWeight: '400', lineHeight: '1.4',  letterSpacing: '0em'    },
    labelMd:   { fontSize: '0.75rem',   fontWeight: '500', lineHeight: '1.4',  letterSpacing: '0em'    },
    labelSm:   { fontSize: '0.6875rem', fontWeight: '500', lineHeight: '1.4',  letterSpacing: '0em'    },
    iconLabel: { fontSize: '0.6875rem', fontWeight: '500', lineHeight: '1.3',  letterSpacing: '0.01em' },
  },
  radii: {
    sm:   '4px',
    md:   '8px',
    lg:   '12px',
    xl:   '16px',
    full: '9999px',
  },
  shadows: {
    dropSm: '0 1px 2px 0px rgba(0,0,0,0.05)',
    dropMd: '0 4px 6px -1px rgba(0,0,0,0.1)',
    dropLg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },
  buttons: {
    radius: '6px',
    height: '36px',
  },
};
