# Renk Tokenları ve Kullanım Analiz Raporu

## 1. Tanımlı Renk Token'ları (Light / Dark Varsayılan Değerleri)
*Projedeki tüm CSS custom property'leri ve Tailwind renk token'ları, `apps/web/src/index.css` ve `packages/shared/src/types/ui-tokens.ts` dosyalarında tanımlanmıştır.*

| Token Adı | Light Hex | Dark Hex | Tanımlandığı Dosya | Açıklama |
|---|---|---|---|---|
| `primary` | `#2563eb` | `#3b82f6` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `primary-hover` | `#1d4ed8` | `#2563eb` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `danger` | `#dc2626` | `#f87171` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `success` | `#059669` | `#34d399` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `warning` | `#d97706` | `#fbbf24` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `surface-app` | `#f5f5f4` | `#0f172a` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `surface-panel` | `#ffffff` | `#1e293b` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `surface-subtle` | `#f8fafc` | `#334155` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `border-default` | `#e2e8f0` | `#334155` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `border-strong` | `#cbd5e1` | `#475569` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `border-selected` | `#0f172a` | `#e2e8f0` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `text-primary` | `#0f172a` | `#f1f5f9` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `text-secondary` | `#475569` | `#94a3b8` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |
| `text-muted` | `#94a3b8` | `#64748b` | `packages/shared/src/types/ui-tokens.ts` / `index.css` | UI rolü |

## 2. Kullanım Haritası
*Her renk token'ının projede hangi bileşenlerde ve ne amaçla kullanıldığı listelenmiştir.*

### `primary` &rarr; Light: `#2563eb` / Dark: `#3b82f6`
  - **ThemeInjector.tsx**
    - Satır 10: `r.style.setProperty('--color-primary', safeTokens.colors.primary);`
    - Satır 21: `r.style.setProperty('--color-text-primary', safeTokens.colors.textPrimary);`
  - **ThemeToggle.tsx**
    - Satır 14: `className={`inline-flex items-center justify-center gap-2 rounded-radius-md border border-border-default bg-surface-subtle text-text-secondary transition hover:border-border-strong hover:text-text-primary ${`
  - **Button.tsx**
    - Satır 19: `secondary: 'bg-white text-text-primary border border-[#E5E7EB] hover:bg-surface-subtle',`
  - **AdminThemePage.tsx**
    - Satır 174: `<main className="min-h-screen bg-surface-app text-text-primary">`
    - Satır 193: `? 'border-primary bg-primary text-white'`
    - Satır 204: `className="rounded-radius-md bg-primary px-4 py-2 text-label-md text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"`
    - Satır 246: `className="mt-2 w-full rounded-radius-md border border-border-default bg-surface-panel px-3 py-2 text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 369: `className="min-w-0 flex-1 rounded-radius-md border border-border-default bg-surface-panel px-3 py-2 font-mono text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 405: `className="mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-2 py-2 text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 493: `className="mt-2 w-full accent-primary"`
    - Satır 523: `className={`mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-2 py-2 text-body-sm text-text-primary outline-none focus:border-primary ${mono ? 'font-mono' : ''}`}`
    - Satır 548: `<button className="bg-primary text-white hover:bg-primary-hover" style={{ borderRadius: tokens.buttons.radius, height: tokens.buttons.height, paddingInline: 16 }}>`
    - Satır 559: `<p className="text-body-md text-text-primary">Body MD örnek metin</p>`
  - **Layout.tsx**
    - Satır 16: `<div className="min-h-screen bg-surface-app text-text-primary">`
    - Satır 21: `<Link to="/dashboard" className="text-heading-lg text-primary">`
    - Satır 27: `className="text-body-sm text-text-secondary hover:text-text-primary transition-colors"`
  - **Page.tsx**
    - Satır 118: `className="w-full text-left px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-subtle"`
  - **ContextualBar.tsx**
    - Satır 208: `? 'bg-surface-subtle text-text-primary hover:bg-border-default'`
    - Satır 305: `font.textAlign === a ? 'bg-surface-panel shadow text-text-primary' : 'text-text-muted'`
  - **BannerSection.tsx**
    - Satır 365: `className="absolute pointer-events-none z-50 border border-primary bg-primary/10"`
  - **CustomTemplateBuilder.tsx**
    - Satır 167: `className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-drop-sm"`
  - **ProductManagement.tsx**
    - Satır 133: `<div className="space-y-4 font-sans text-text-primary">`
    - Satır 152: `<summary className="text-[12px] font-bold text-text-primary cursor-pointer p-3 flex items-center justify-between bg-surface-subtle/60">`
    - Satır 162: `<summary className="text-[12px] font-medium text-text-primary cursor-pointer p-2.5 flex items-center justify-between">`
    - Satır 186: `<h4 className="text-[13px] font-bold text-text-primary">Excel ile Otomatik Yerleştir</h4>`
    - Satır 249: `className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-radius-lg shadow-drop-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"`
    - Satır 263: `<h4 className="text-[13px] font-bold text-text-primary">Ürün Havuzu</h4>`
    - Satır 333: `<h4 className="text-[13px] font-bold text-text-primary">Ürün Ara ve Sürükle</h4>`
    - Satır 354: `className={`py-1.5 text-center transition-all ${filterType === 'all' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}`
    - Satır 360: `className={`py-1.5 text-center transition-all ${filterType === 'used' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}`
    - Satır 366: `className={`py-1.5 text-center transition-all ${filterType === 'unused' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}`
    - Satır 414: `<div className={`text-[12px] font-semibold truncate ${placed ? 'text-text-muted' : 'text-text-primary'}`}>`
    - Satır 421: `<div className={`text-[12px] font-bold ${placed ? 'text-text-muted' : 'text-text-primary'}`}>`
    - Satır 453: `<button className="text-[12px] font-medium text-text-secondary hover:text-text-primary flex items-center justify-center w-full gap-1">`
    - Satır 557: `<h3 className="text-heading-xl text-text-primary">Yeni Ürün Ekle</h3>`
    - Satır 660: `<label className="block text-[11px] font-semibold text-text-primary mb-1.5">Satış Fiyatı (Fiyat)</label>`
    - Satır 684: `className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"`
    - Satır 754: `<div className="text-[12px] font-semibold text-text-primary">`
  - **TemplateSettingsPanel.tsx**
    - Satır 60: `isActive ? 'text-text-primary' : 'text-text-secondary'`
  - **BorderRadiusPicker.tsx**
    - Satır 26: `? 'bg-surface-subtle text-text-primary'`
  - **PriceCalculator.tsx**
    - Satır 66: `<h3 className="text-sm font-bold text-text-primary flex items-center gap-2">`
    - Satır 79: `<strong className="text-text-primary">{template.name}</strong>`
    - Satır 135: `<span className="text-lg font-semibold text-text-primary">`
  - **Sidebar.tsx**
    - Satır 78: `? 'text-text-primary bg-surface-panel border-b-2 border-b-primary shadow-[0_-1px_0_0_#e2e8f0]'`
    - Satır 79: `: 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle border-b-2 border-b-transparent'`
    - Satır 115: `<div className={`flex items-center gap-2 transition-colors ${openSection === 'template' ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 121: `className={`transition-all duration-300 ${openSection === 'template' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 143: `<span className="text-body-md text-text-primary">{activeTemplate?.designType ? getTerm('print', activeTemplate.designType) : 'Seçilmedi'}</span>`
    - Satır 147: `<span className="text-body-md text-text-primary">{activeTemplate?.mode ? getTerm('print', activeTemplate.mode) : '-'}</span>`
    - Satır 151: `<span className="text-body-md text-text-primary">{activeTemplate?.paperSize ? getTerm('print', activeTemplate.paperSize) : '-'}</span>`
    - Satır 155: `<span className="text-body-md text-text-primary">`
    - Satır 161: `<span className="text-body-md text-text-primary">{activeTemplate?.pageCount || '-'}</span>`
    - Satır 186: `<div className={`flex items-center gap-2 transition-colors ${openSection === 'grid' ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 192: `className={`transition-all duration-300 ${openSection === 'grid' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 212: `<div className={`flex items-center gap-2 transition-colors ${openSection === 'background' ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 218: `className={`transition-all duration-300 ${openSection === 'background' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 258: `<div className="flex items-center gap-2 text-text-primary">`
    - Satır 279: `<div className={`flex items-center gap-2 transition-colors ${readyOpen ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 285: `className={`transition-all duration-300 ${readyOpen ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 326: `<div className={`flex items-center gap-2 transition-colors ${mineOpen ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 332: `className={`transition-all duration-300 ${mineOpen ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
  - **TopBar.tsx**
    - Satır 57: `className="h-8 px-3 text-text-secondary hover:text-text-primary hover:bg-border-default rounded-radius-md text-xs font-medium disabled:opacity-30 disabled:hover:bg-transparent"`
    - Satır 76: `? 'bg-surface-subtle border-border-strong text-text-primary hover:bg-border-default'`

### `primary-hover` &rarr; Light: `#1d4ed8` / Dark: `#2563eb`
  - **ThemeInjector.tsx**
    - Satır 11: `r.style.setProperty('--color-primary-hover', safeTokens.colors.primaryHover);`
  - **AdminThemePage.tsx**
    - Satır 18: `primaryHover: 'Primary hover',`
    - Satır 204: `className="rounded-radius-md bg-primary px-4 py-2 text-label-md text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"`
    - Satır 548: `<button className="bg-primary text-white hover:bg-primary-hover" style={{ borderRadius: tokens.buttons.radius, height: tokens.buttons.height, paddingInline: 16 }}>`
  - **CustomTemplateBuilder.tsx**
    - Satır 167: `className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-drop-sm"`
  - **ProductManagement.tsx**
    - Satır 249: `className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-radius-lg shadow-drop-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"`
    - Satır 684: `className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"`

### `danger` &rarr; Light: `#dc2626` / Dark: `#f87171`
  - **ThemeInjector.tsx**
    - Satır 12: `r.style.setProperty('--color-danger', safeTokens.colors.danger);`
  - **AdminThemePage.tsx**
    - Satır 212: `className="rounded-radius-md border border-border-default bg-surface-panel px-4 py-2 text-label-md text-text-secondary hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"`
  - **Layout.tsx**
    - Satır 47: `className="text-body-sm text-text-muted hover:text-danger transition-colors"`
  - **ContextualBar.tsx**
    - Satır 216: `className="px-2 py-1 hover:bg-red-50 text-danger rounded text-xs"`
  - **TemplateSettingsPanel.tsx**
    - Satır 84: `className="absolute top-2 right-2 text-[10px] text-danger hover:text-danger opacity-0 group-hover:opacity-100"`
  - **TempPoolBar.tsx**
    - Satır 36: `className="text-danger hover:underline"`
    - Satır 65: `className="absolute top-0.5 right-0.5 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100"`

### `success` &rarr; Light: `#059669` / Dark: `#34d399`
  - **ThemeInjector.tsx**
    - Satır 13: `r.style.setProperty('--color-success', safeTokens.colors.success);`

### `warning` &rarr; Light: `#d97706` / Dark: `#fbbf24`
  - **ThemeInjector.tsx**
    - Satır 14: `r.style.setProperty('--color-warning', safeTokens.colors.warning);`

### `surface-app` &rarr; Light: `#f5f5f4` / Dark: `#0f172a`
  - **ThemeInjector.tsx**
    - Satır 15: `r.style.setProperty('--color-surface-app', safeTokens.colors.surfaceApp);`
  - **AdminThemePage.tsx**
    - Satır 174: `<main className="min-h-screen bg-surface-app text-text-primary">`
  - **Layout.tsx**
    - Satır 16: `<div className="min-h-screen bg-surface-app text-text-primary">`

### `surface-panel` &rarr; Light: `#ffffff` / Dark: `#1e293b`
  - **ThemeInjector.tsx**
    - Satır 16: `r.style.setProperty('--color-surface-panel', safeTokens.colors.surfacePanel);`
  - **AdminThemePage.tsx**
    - Satır 176: `<header className="flex flex-col gap-4 rounded-radius-xl border border-border-default bg-surface-panel p-5 shadow-drop-sm md:flex-row md:items-center md:justify-between">`
    - Satır 212: `className="rounded-radius-md border border-border-default bg-surface-panel px-4 py-2 text-label-md text-text-secondary hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"`
    - Satır 246: `className="mt-2 w-full rounded-radius-md border border-border-default bg-surface-panel px-3 py-2 text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 344: `<section className="rounded-radius-xl border border-border-default bg-surface-panel p-5 shadow-drop-sm">`
    - Satır 369: `className="min-w-0 flex-1 rounded-radius-md border border-border-default bg-surface-panel px-3 py-2 font-mono text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 405: `className="mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-2 py-2 text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 480: `<label className="block rounded-radius-md border border-border-default bg-surface-panel/60 p-2">`
    - Satır 523: `className={`mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-2 py-2 text-body-sm text-text-primary outline-none focus:border-primary ${mono ? 'font-mono' : ''}`}`
    - Satır 532: `<aside className="sticky top-6 h-fit rounded-radius-xl border border-border-default bg-surface-panel p-5 shadow-drop-lg">`
    - Satır 551: `<button className="border border-border-default bg-surface-panel px-4 text-text-secondary" style={{ borderRadius: tokens.buttons.radius, height: tokens.buttons.height }}>`
    - Satır 557: `<div className="mt-4 space-y-2 rounded-radius-lg border border-border-default bg-surface-panel p-4 shadow-drop-sm">`
    - Satır 564: `<div className="mt-4 rounded-radius-lg border border-border-default bg-surface-panel p-4 shadow-drop-lg">`
  - **Layout.tsx**
    - Satır 17: `<nav className="bg-surface-panel border-b border-border-default">`
  - **FooterRenderer.tsx**
    - Satır 150: `className="w-full h-full grid relative overflow-hidden box-border bg-surface-panel"`
  - **Page.tsx**
    - Satır 88: `className="fixed z-99999 bg-surface-panel border border-border-strong shadow-2xl rounded-md py-1 min-w-37.5"`
  - **ContextualBar.tsx**
    - Satır 41: `<div className="absolute top-full left-0 mt-1 z-99999 w-72 bg-surface-panel border border-border-default rounded-radius-lg shadow-xl p-3">`
    - Satır 57: `className="h-12 px-3 flex items-center gap-1 text-xs text-text-secondary min-w-175 bg-surface-panel"`
    - Satır 268: `className="text-xs border border-border-default rounded px-1.5 py-1 bg-surface-panel"`
    - Satır 305: `font.textAlign === a ? 'bg-surface-panel shadow text-text-primary' : 'text-text-muted'`
  - **BannerSettingsPanel.tsx**
    - Satır 94: `<div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm space-y-2">`
    - Satır 140: `<div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm">`
    - Satır 150: `<div className="bg-surface-panel p-2 rounded border border-border-default shadow-drop-sm">`
  - **CustomTemplateBuilder.tsx**
    - Satır 79: `<div className="space-y-3 bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm">`
  - **ProductInfoSettings.tsx**
    - Satır 100: `<div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm space-y-2">`
  - **ProductManagement.tsx**
    - Satır 142: `className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-secondary border border-border-strong rounded-radius-sm text-[11px] font-medium hover:bg-surface-subtle transition-colors shrink-0"`
    - Satır 151: `<details open className="bg-surface-panel rounded-radius-lg border border-border-default shadow-drop-sm overflow-hidden">`
    - Satır 161: `<details className="bg-surface-panel rounded-radius-md border border-border-default">`
    - Satır 184: `<div className="bg-surface-panel rounded-radius-lg border border-border-default p-4 shadow-drop-sm">`
    - Satır 268: `className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-secondary border border-border-strong rounded-radius-lg text-[11px] font-medium hover:bg-surface-subtle transition-colors shrink-0"`
    - Satır 311: `className="flex-1 border border-border-default bg-surface-panel hover:bg-surface-subtle text-text-secondary text-xs py-1.5 px-3 rounded-radius-md flex items-center justify-center gap-1.5 transition-colors"`
    - Satır 331: `<div className="bg-surface-panel rounded-radius-lg border border-border-default p-4 shadow-drop-sm pb-2">`
    - Satır 354: `className={`py-1.5 text-center transition-all ${filterType === 'all' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}`
    - Satır 360: `className={`py-1.5 text-center transition-all ${filterType === 'used' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}`
    - Satır 366: `className={`py-1.5 text-center transition-all ${filterType === 'unused' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}`
    - Satır 397: `className={`flex items-center gap-3 bg-surface-panel border border-border-default rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-border-strong hover:shadow-drop-sm transition-all duration-200 group ${`
    - Satır 401: `<div className="w-10 h-10 bg-surface-panel rounded-radius-md border border-border-default flex justify-center items-center overflow-hidden shrink-0">`
    - Satır 555: `<div className="bg-surface-panel rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">`
    - Satır 667: `className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted bg-surface-panel shadow-drop-sm font-medium"`
    - Satır 677: `className="px-4 py-2.5 bg-surface-panel border border-border-default hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl transition-all shadow-drop-sm disabled:opacity-50 disabled:cursor-not-allowed"`
    - Satır 748: `<div className={`w-8 h-8 rounded-radius-lg bg-surface-panel shadow-drop-sm flex items-center justify-center shrink-0 ${iconColor}`}>`
  - **TemplateSettingsPanel.tsx**
    - Satır 54: `: 'bg-surface-panel border-border-default hover:border-border-strong hover:bg-border-default'`
  - **PriceCalculator.tsx**
    - Satır 64: `<div className="fixed bottom-4 right-4 z-1100 w-80 bg-surface-panel rounded-xl shadow-2xl border border-border-default max-h-[calc(100vh-100px)] flex flex-col">`
    - Satır 104: `className="w-full mt-1 text-xs border border-border-strong rounded px-2 py-1.5 bg-surface-panel focus:border-border-strong outline-none"`
  - **Sidebar.tsx**
    - Satır 68: `<div className="w-96 bg-surface-panel border-l border-border-default flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">`
    - Satır 78: `? 'text-text-primary bg-surface-panel border-b-2 border-b-primary shadow-[0_-1px_0_0_#e2e8f0]'`
    - Satır 89: `<div className="flex-1 overflow-auto p-5 bg-surface-panel">`
    - Satır 110: `<div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel">`
    - Satır 129: `<div className="p-4 flex flex-col gap-4 border-t border-border-default bg-surface-panel">`
    - Satır 133: `className="w-full flex items-center justify-center gap-2 border border-border-strong bg-surface-panel hover:bg-surface-subtle text-text-secondary text-body-md py-2.5 rounded-radius-lg transition-all"`
    - Satır 200: `<div className="p-4 border-t border-border-default bg-surface-panel">`
    - Satır 293: `<div className="p-4 border-t border-border-default bg-surface-panel flex flex-col gap-2">`
    - Satır 340: `<div className="p-4 border-t border-border-default bg-surface-panel flex flex-col gap-1">`
  - **StudioPage.tsx**
    - Satır 26: `<div className="inline-flex justify-center bg-surface-panel shadow-drop-md rounded-b-lg border-b border-x border-border-default overflow-visible shrink-0 z-50 mb-2">`
  - **TempPoolBar.tsx**
    - Satır 18: `className={`bg-surface-panel border-r border-border-default flex flex-col h-full transition-all ${`
  - **DownloadMenu.tsx**
    - Satır 83: `className="h-8 px-3.5 rounded-radius-md text-xs font-medium border border-border-strong bg-surface-panel text-text-secondary hover:bg-surface-subtle disabled:opacity-60"`
    - Satır 88: `<div className="absolute top-full right-0 mt-1 w-64 bg-surface-panel border border-border-default rounded-radius-lg shadow-xl p-1 z-99999">`
  - **ProjectMenu.tsx**
    - Satır 128: `className="h-8 px-3 rounded-radius-md text-xs font-semibold border border-border-strong bg-surface-panel text-text-secondary hover:bg-surface-subtle"`
    - Satır 133: `<div className="absolute top-full right-0 mt-1 w-56 bg-surface-panel border border-border-default rounded-radius-lg shadow-xl p-1 z-99999">`
  - **TopBar.tsx**
    - Satır 33: `<div className="h-12 bg-surface-panel border-b border-border-default flex items-center justify-between px-4 shrink-0 shadow-drop-sm relative z-1001">`
    - Satır 77: `: 'bg-surface-panel border-border-strong text-text-secondary hover:bg-surface-subtle'`

### `surface-subtle` &rarr; Light: `#f8fafc` / Dark: `#334155`
  - **ThemeInjector.tsx**
    - Satır 17: `r.style.setProperty('--color-surface-subtle', safeTokens.colors.surfaceSubtle);`
  - **ThemeToggle.tsx**
    - Satır 14: `className={`inline-flex items-center justify-center gap-2 rounded-radius-md border border-border-default bg-surface-subtle text-text-secondary transition hover:border-border-strong hover:text-text-primary ${`
  - **Button.tsx**
    - Satır 19: `secondary: 'bg-white text-text-primary border border-[#E5E7EB] hover:bg-surface-subtle',`
    - Satır 20: `ghost: 'bg-transparent text-text-secondary hover:bg-surface-subtle border border-transparent',`
  - **SegmentedControl.tsx**
    - Satır 18: `: 'bg-white text-text-secondary hover:bg-surface-subtle'`
  - **AdminThemePage.tsx**
    - Satır 194: `: 'border-border-default bg-surface-subtle text-text-secondary hover:border-border-strong'`
    - Satır 241: `<label className="block rounded-radius-lg border border-border-default bg-surface-subtle p-3">`
    - Satır 357: `<label className="rounded-radius-lg border border-border-default bg-surface-subtle p-3">`
    - Satır 386: `<fieldset className="rounded-radius-lg border border-border-default bg-surface-subtle p-3">`
    - Satır 539: `<div className="mt-4 rounded-radius-lg border border-border-default bg-surface-subtle p-4">`
  - **Page.tsx**
    - Satır 95: `className="w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-subtle"`
    - Satır 118: `className="w-full text-left px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-subtle"`
  - **Slot.tsx**
    - Satır 438: `? `z-50 border-2 border-border-selected shadow-2xl${isModuleSlot ? '' : ' bg-surface-subtle'}``
    - Satır 477: `<div className="w-full h-full flex flex-col items-center justify-center bg-surface-subtle border-2 border-dashed border-border-strong pointer-events-none">`
  - **ContextualBar.tsx**
    - Satır 208: `? 'bg-surface-subtle text-text-primary hover:bg-border-default'`
    - Satır 299: `<div className="flex bg-surface-subtle rounded p-0.5">`
  - **BannerSettingsPanel.tsx**
    - Satır 105: `className="w-full text-xs text-center border border-border-default rounded px-1 py-0.5 bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-primary"`
  - **CustomTemplateBuilder.tsx**
    - Satır 158: `<div className="text-[10px] text-text-muted bg-surface-subtle p-2 rounded">`
  - **ProductInfoSettings.tsx**
    - Satır 218: `className="flex-1 py-1.5 bg-surface-subtle hover:bg-border-default text-text-secondary text-[10px] font-medium rounded border border-border-default"`
  - **ProductManagement.tsx**
    - Satır 142: `className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-secondary border border-border-strong rounded-radius-sm text-[11px] font-medium hover:bg-surface-subtle transition-colors shrink-0"`
    - Satır 152: `<summary className="text-[12px] font-bold text-text-primary cursor-pointer p-3 flex items-center justify-between bg-surface-subtle/60">`
    - Satır 199: `bgColor={layoutDrag ? 'bg-surface-subtle' : 'bg-surface-subtle/30'}`
    - Satır 225: `className="w-7 h-7 flex items-center justify-center bg-surface-subtle text-text-muted hover:bg-border-default hover:text-text-secondary rounded-radius-md transition-colors"`
    - Satır 268: `className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-secondary border border-border-strong rounded-radius-lg text-[11px] font-medium hover:bg-surface-subtle transition-colors shrink-0"`
    - Satır 286: `bgColor={masterDrag ? 'bg-surface-subtle' : 'bg-surface-subtle/30'}`
    - Satır 311: `className="flex-1 border border-border-default bg-surface-panel hover:bg-surface-subtle text-text-secondary text-xs py-1.5 px-3 rounded-radius-md flex items-center justify-center gap-1.5 transition-colors"`
    - Satır 351: `<div className="bg-surface-subtle p-1 rounded-radius-lg grid grid-cols-3 text-xs text-text-secondary">`
    - Satır 556: `<div className="px-6 py-4 border-b border-border-default flex items-center justify-between bg-surface-subtle/50">`
    - Satır 558: `<button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors p-1 rounded-radius-md hover:bg-surface-subtle">`
    - Satır 586: `? 'border-border-strong bg-surface-subtle/50'`
    - Satır 588: `? 'border-transparent bg-surface-subtle'`
    - Satır 589: `: 'border-border-default hover:border-border-strong hover:bg-surface-subtle'`
    - Satır 677: `className="px-4 py-2.5 bg-surface-panel border border-border-default hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl transition-all shadow-drop-sm disabled:opacity-50 disabled:cursor-not-allowed"`
    - Satır 730: `const activeBg = dragging ? 'bg-surface-subtle/60' : 'bg-surface-subtle/60';`
    - Satır 746: `className={`border border-dashed rounded-xl p-3 cursor-pointer transition-all flex items-center justify-center gap-3 ${activeBorder} ${activeBg} hover:border-border-strong hover:bg-surface-subtle/30`}`
  - **TemplateSettingsPanel.tsx**
    - Satır 53: `? 'bg-surface-subtle border-border-selected shadow-drop-sm'`
    - Satır 65: `<span className="ml-1.5 text-[8px] font-bold text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded">`
    - Satır 107: `className="w-full py-2 text-xs font-medium rounded border border-border-strong text-text-secondary hover:bg-surface-subtle"`
  - **BorderRadiusPicker.tsx**
    - Satır 26: `? 'bg-surface-subtle text-text-primary'`
    - Satır 27: `: 'bg-surface-subtle text-text-muted hover:bg-border-default'`
    - Satır 34: `<div className="bg-surface-subtle p-3 rounded border border-border-default text-center space-y-2">`
    - Satır 53: `<div key={k} className="bg-surface-subtle p-2 rounded border border-border-default space-y-1.5">`
  - **PriceCalculator.tsx**
    - Satır 65: `<div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-surface-subtle rounded-t-xl">`
    - Satır 78: `<div className="bg-surface-subtle rounded p-2 text-[10px] text-text-secondary leading-snug">`
    - Satır 116: `<div className="px-4 py-3 border-t border-border-default bg-surface-subtle rounded-b-xl space-y-1.5">`
  - **Sidebar.tsx**
    - Satır 71: `<div className="grid grid-cols-4 shrink-0 bg-surface-subtle border-b border-border-default">`
    - Satır 79: `: 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle border-b-2 border-b-transparent'`
    - Satır 113: `className="flex items-center justify-between p-3 bg-surface-subtle hover:bg-border-default transition-colors"`
    - Satır 133: `className="w-full flex items-center justify-center gap-2 border border-border-strong bg-surface-panel hover:bg-surface-subtle text-text-secondary text-body-md py-2.5 rounded-radius-lg transition-all"`
    - Satır 256: `className={`flex flex-col gap-2 p-3 border border-border-default rounded-radius-md bg-surface-subtle hover:bg-border-default transition-colors select-none ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${className}`}`
  - **TempPoolBar.tsx**
    - Satır 24: `className="h-12 flex items-center justify-center border-b border-border-default text-text-secondary hover:bg-surface-subtle text-xs font-semibold"`
  - **DownloadMenu.tsx**
    - Satır 83: `className="h-8 px-3.5 rounded-radius-md text-xs font-medium border border-border-strong bg-surface-panel text-text-secondary hover:bg-surface-subtle disabled:opacity-60"`
    - Satır 93: `className="w-full text-left p-2 hover:bg-surface-subtle rounded"`
  - **ProjectMenu.tsx**
    - Satır 128: `className="h-8 px-3 rounded-radius-md text-xs font-semibold border border-border-strong bg-surface-panel text-text-secondary hover:bg-surface-subtle"`
    - Satır 136: `className="w-full text-left px-3 py-2 hover:bg-surface-subtle rounded text-xs"`
  - **TopBar.tsx**
    - Satır 41: `className="bg-surface-subtle text-text-secondary text-xs font-semibold px-3 py-1.5 rounded-radius-md border border-border-strong cursor-pointer hover:bg-border-default transition-all min-w-45 h-8 outline-none"`
    - Satır 76: `? 'bg-surface-subtle border-border-strong text-text-primary hover:bg-border-default'`
    - Satır 77: `: 'bg-surface-panel border-border-strong text-text-secondary hover:bg-surface-subtle'`

### `border-default` &rarr; Light: `#e2e8f0` / Dark: `#334155`
  - **ThemeInjector.tsx**
    - Satır 18: `r.style.setProperty('--color-border-default', safeTokens.colors.borderDefault);`
  - **ThemeToggle.tsx**
    - Satır 14: `className={`inline-flex items-center justify-center gap-2 rounded-radius-md border border-border-default bg-surface-subtle text-text-secondary transition hover:border-border-strong hover:text-text-primary ${`
  - **AdminThemePage.tsx**
    - Satır 176: `<header className="flex flex-col gap-4 rounded-radius-xl border border-border-default bg-surface-panel p-5 shadow-drop-sm md:flex-row md:items-center md:justify-between">`
    - Satır 194: `: 'border-border-default bg-surface-subtle text-text-secondary hover:border-border-strong'`
    - Satır 212: `className="rounded-radius-md border border-border-default bg-surface-panel px-4 py-2 text-label-md text-text-secondary hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"`
    - Satır 241: `<label className="block rounded-radius-lg border border-border-default bg-surface-subtle p-3">`
    - Satır 246: `className="mt-2 w-full rounded-radius-md border border-border-default bg-surface-panel px-3 py-2 text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 344: `<section className="rounded-radius-xl border border-border-default bg-surface-panel p-5 shadow-drop-sm">`
    - Satır 357: `<label className="rounded-radius-lg border border-border-default bg-surface-subtle p-3">`
    - Satır 364: `className="h-9 w-10 cursor-pointer rounded-radius-md border border-border-default bg-transparent p-0"`
    - Satır 369: `className="min-w-0 flex-1 rounded-radius-md border border-border-default bg-surface-panel px-3 py-2 font-mono text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 386: `<fieldset className="rounded-radius-lg border border-border-default bg-surface-subtle p-3">`
    - Satır 405: `className="mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-2 py-2 text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 480: `<label className="block rounded-radius-md border border-border-default bg-surface-panel/60 p-2">`
    - Satır 523: `className={`mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-2 py-2 text-body-sm text-text-primary outline-none focus:border-primary ${mono ? 'font-mono' : ''}`}`
    - Satır 532: `<aside className="sticky top-6 h-fit rounded-radius-xl border border-border-default bg-surface-panel p-5 shadow-drop-lg">`
    - Satır 539: `<div className="mt-4 rounded-radius-lg border border-border-default bg-surface-subtle p-4">`
    - Satır 544: `<div key={key} title={key} className="h-10 rounded-radius-md border border-border-default" style={{ backgroundColor: tokens.colors[key] }} />`
    - Satır 551: `<button className="border border-border-default bg-surface-panel px-4 text-text-secondary" style={{ borderRadius: tokens.buttons.radius, height: tokens.buttons.height }}>`
    - Satır 557: `<div className="mt-4 space-y-2 rounded-radius-lg border border-border-default bg-surface-panel p-4 shadow-drop-sm">`
    - Satır 564: `<div className="mt-4 rounded-radius-lg border border-border-default bg-surface-panel p-4 shadow-drop-lg">`
  - **Layout.tsx**
    - Satır 17: `<nav className="bg-surface-panel border-b border-border-default">`
  - **Page.tsx**
    - Satır 137: `<div className="my-1 border-t border-border-default" />`
  - **ContextualBar.tsx**
    - Satır 14: `const Divider = () => <div className="w-px h-5 bg-border-default mx-2" />;`
    - Satır 36: `className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-text-secondary hover:bg-border-default"`
    - Satır 41: `<div className="absolute top-full left-0 mt-1 z-99999 w-72 bg-surface-panel border border-border-default rounded-radius-lg shadow-xl p-3">`
    - Satır 181: `className="px-2 py-1 hover:bg-border-default rounded text-xs"`
    - Satır 191: `className="px-2 py-1 hover:bg-border-default rounded text-xs disabled:opacity-30"`
    - Satır 208: `? 'bg-surface-subtle text-text-primary hover:bg-border-default'`
    - Satır 209: `: 'hover:bg-border-default'`
    - Satır 268: `className="text-xs border border-border-default rounded px-1.5 py-1 bg-surface-panel"`
    - Satır 294: `className="w-12 text-xs border border-border-default rounded px-1.5 py-1 text-center"`
  - **BannerSettingsPanel.tsx**
    - Satır 94: `<div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm space-y-2">`
    - Satır 105: `className="w-full text-xs text-center border border-border-default rounded px-1 py-0.5 bg-surface-subtle focus:outline-none focus:ring-1 focus:ring-primary"`
    - Satır 140: `<div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm">`
    - Satır 150: `<div className="bg-surface-panel p-2 rounded border border-border-default shadow-drop-sm">`
  - **CustomTemplateBuilder.tsx**
    - Satır 79: `<div className="space-y-3 bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm">`
    - Satır 89: `className="w-full mt-1 text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"`
    - Satır 102: `className="w-full mt-1 text-xs border border-border-default rounded p-1.5"`
  - **ProductInfoSettings.tsx**
    - Satır 100: `<div className="bg-surface-panel p-3 rounded border border-border-default shadow-drop-sm space-y-2">`
    - Satır 120: `className="w-full text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"`
    - Satır 191: `<div className="pt-3 mt-3 border-t border-border-default space-y-2">`
    - Satır 218: `className="flex-1 py-1.5 bg-surface-subtle hover:bg-border-default text-text-secondary text-[10px] font-medium rounded border border-border-default"`
  - **ProductManagement.tsx**
    - Satır 151: `<details open className="bg-surface-panel rounded-radius-lg border border-border-default shadow-drop-sm overflow-hidden">`
    - Satır 156: `<div className="p-3 border-t border-border-default">`
    - Satır 161: `<details className="bg-surface-panel rounded-radius-md border border-border-default">`
    - Satır 173: `<div className="text-[10px] text-text-secondary p-2.5 pt-0 border-t border-border-default mt-1 space-y-1">`
    - Satır 184: `<div className="bg-surface-panel rounded-radius-lg border border-border-default p-4 shadow-drop-sm">`
    - Satır 198: `borderColor={layoutDrag ? 'border-border-strong' : 'border-border-default'}`
    - Satır 225: `className="w-7 h-7 flex items-center justify-center bg-surface-subtle text-text-muted hover:bg-border-default hover:text-text-secondary rounded-radius-md transition-colors"`
    - Satır 285: `borderColor={masterDrag ? 'border-border-strong' : 'border-border-default'}`
    - Satır 311: `className="flex-1 border border-border-default bg-surface-panel hover:bg-surface-subtle text-text-secondary text-xs py-1.5 px-3 rounded-radius-md flex items-center justify-center gap-1.5 transition-colors"`
    - Satır 331: `<div className="bg-surface-panel rounded-radius-lg border border-border-default p-4 shadow-drop-sm pb-2">`
    - Satır 346: `className="w-full text-[13px] border rounded-radius-full border-border-default pl-10 pr-3 py-2 outline-none focus:border-border-strong placeholder:text-text-muted"`
    - Satır 397: `className={`flex items-center gap-3 bg-surface-panel border border-border-default rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-border-strong hover:shadow-drop-sm transition-all duration-200 group ${`
    - Satır 401: `<div className="w-10 h-10 bg-surface-panel rounded-radius-md border border-border-default flex justify-center items-center overflow-hidden shrink-0">`
    - Satır 452: `<div className="pt-3 border-t border-border-default text-center">`
    - Satır 556: `<div className="px-6 py-4 border-b border-border-default flex items-center justify-between bg-surface-subtle/50">`
    - Satır 589: `: 'border-border-default hover:border-border-strong hover:bg-surface-subtle'`
    - Satır 632: `className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted shadow-drop-sm"`
    - Satır 667: `className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted bg-surface-panel shadow-drop-sm font-medium"`
    - Satır 677: `className="px-4 py-2.5 bg-surface-panel border border-border-default hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl transition-all shadow-drop-sm disabled:opacity-50 disabled:cursor-not-allowed"`
    - Satır 729: `const activeBorder = dragging ? 'border-border-strong' : 'border-border-default';`
  - **TemplateSettingsPanel.tsx**
    - Satır 54: `: 'bg-surface-panel border-border-default hover:border-border-strong hover:bg-border-default'`
  - **BorderRadiusPicker.tsx**
    - Satır 19: `<div className="pt-2 border-t border-border-default">`
    - Satır 27: `: 'bg-surface-subtle text-text-muted hover:bg-border-default'`
    - Satır 34: `<div className="bg-surface-subtle p-3 rounded border border-border-default text-center space-y-2">`
    - Satır 40: `className="w-30 mx-auto block text-[10px] font-bold text-text-secondary text-center border border-border-default rounded p-1.5 outline-none focus:border-border-strong"`
    - Satır 53: `<div key={k} className="bg-surface-subtle p-2 rounded border border-border-default space-y-1.5">`
    - Satır 59: `className="w-full text-[10px] font-bold text-text-secondary text-center border border-border-default rounded p-1.5 outline-none focus:border-border-strong"`
  - **PriceCalculator.tsx**
    - Satır 64: `<div className="fixed bottom-4 right-4 z-1100 w-80 bg-surface-panel rounded-xl shadow-2xl border border-border-default max-h-[calc(100vh-100px)] flex flex-col">`
    - Satır 65: `<div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-surface-subtle rounded-t-xl">`
    - Satır 116: `<div className="px-4 py-3 border-t border-border-default bg-surface-subtle rounded-b-xl space-y-1.5">`
  - **Sidebar.tsx**
    - Satır 68: `<div className="w-96 bg-surface-panel border-l border-border-default flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">`
    - Satır 71: `<div className="grid grid-cols-4 shrink-0 bg-surface-subtle border-b border-border-default">`
    - Satır 110: `<div className="flex flex-col border border-border-default rounded-radius-md overflow-hidden bg-surface-panel">`
    - Satır 113: `className="flex items-center justify-between p-3 bg-surface-subtle hover:bg-border-default transition-colors"`
    - Satır 129: `<div className="p-4 flex flex-col gap-4 border-t border-border-default bg-surface-panel">`
    - Satır 141: `<div className="flex justify-between items-center py-1 text-sm border-b border-border-default last:border-0">`
    - Satır 200: `<div className="p-4 border-t border-border-default bg-surface-panel">`
    - Satır 256: `className={`flex flex-col gap-2 p-3 border border-border-default rounded-radius-md bg-surface-subtle hover:bg-border-default transition-colors select-none ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${className}`}`
    - Satır 293: `<div className="p-4 border-t border-border-default bg-surface-panel flex flex-col gap-2">`
    - Satır 340: `<div className="p-4 border-t border-border-default bg-surface-panel flex flex-col gap-1">`
  - **StudioPage.tsx**
    - Satır 26: `<div className="inline-flex justify-center bg-surface-panel shadow-drop-md rounded-b-lg border-b border-x border-border-default overflow-visible shrink-0 z-50 mb-2">`
  - **TempPoolBar.tsx**
    - Satır 18: `className={`bg-surface-panel border-r border-border-default flex flex-col h-full transition-all ${`
    - Satır 24: `className="h-12 flex items-center justify-center border-b border-border-default text-text-secondary hover:bg-surface-subtle text-xs font-semibold"`
    - Satır 31: `<div className="px-2 py-1.5 text-[10px] text-text-muted flex justify-between items-center border-b border-border-default">`
  - **DownloadMenu.tsx**
    - Satır 88: `<div className="absolute top-full right-0 mt-1 w-64 bg-surface-panel border border-border-default rounded-radius-lg shadow-xl p-1 z-99999">`
  - **ProjectMenu.tsx**
    - Satır 133: `<div className="absolute top-full right-0 mt-1 w-56 bg-surface-panel border border-border-default rounded-radius-lg shadow-xl p-1 z-99999">`
    - Satır 148: `<div className="my-1 border-t border-border-default" />`
  - **TopBar.tsx**
    - Satır 33: `<div className="h-12 bg-surface-panel border-b border-border-default flex items-center justify-between px-4 shrink-0 shadow-drop-sm relative z-1001">`
    - Satır 41: `className="bg-surface-subtle text-text-secondary text-xs font-semibold px-3 py-1.5 rounded-radius-md border border-border-strong cursor-pointer hover:bg-border-default transition-all min-w-45 h-8 outline-none"`
    - Satır 52: `<div className="flex items-center gap-1 mr-2 border-r pr-3 border-border-default">`
    - Satır 57: `className="h-8 px-3 text-text-secondary hover:text-text-primary hover:bg-border-default rounded-radius-md text-xs font-medium disabled:opacity-30 disabled:hover:bg-transparent"`
    - Satır 76: `? 'bg-surface-subtle border-border-strong text-text-primary hover:bg-border-default'`

### `border-strong` &rarr; Light: `#cbd5e1` / Dark: `#475569`
  - **ThemeInjector.tsx**
    - Satır 19: `r.style.setProperty('--color-border-strong', safeTokens.colors.borderStrong);`
  - **ThemeToggle.tsx**
    - Satır 14: `className={`inline-flex items-center justify-center gap-2 rounded-radius-md border border-border-default bg-surface-subtle text-text-secondary transition hover:border-border-strong hover:text-text-primary ${`
  - **AdminThemePage.tsx**
    - Satır 194: `: 'border-border-default bg-surface-subtle text-text-secondary hover:border-border-strong'`
  - **Page.tsx**
    - Satır 88: `className="fixed z-99999 bg-surface-panel border border-border-strong shadow-2xl rounded-md py-1 min-w-37.5"`
    - Satır 168: `className={`physical-page relative shrink-0 border-r border-dashed border-border-strong last:border-r-0 overflow-hidden ${`
  - **Slot.tsx**
    - Satır 440: `? 'border-border-strong scale-[0.98] z-20'`
    - Satır 443: `: 'hover:border-border-strong z-10'`
    - Satır 477: `<div className="w-full h-full flex flex-col items-center justify-center bg-surface-subtle border-2 border-dashed border-border-strong pointer-events-none">`
    - Satır 560: `: 'cursor-pointer hover:ring-1 hover:ring-border-strong'`
    - Satır 673: `: 'line-clamp-3 whitespace-pre-wrap hover:ring-1 hover:ring-border-strong'`
  - **CustomTemplateBuilder.tsx**
    - Satır 89: `className="w-full mt-1 text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"`
  - **ProductInfoSettings.tsx**
    - Satır 120: `className="w-full text-xs border border-border-default rounded p-1.5 focus:border-border-strong outline-none"`
  - **ProductManagement.tsx**
    - Satır 142: `className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-secondary border border-border-strong rounded-radius-sm text-[11px] font-medium hover:bg-surface-subtle transition-colors shrink-0"`
    - Satır 198: `borderColor={layoutDrag ? 'border-border-strong' : 'border-border-default'}`
    - Satır 268: `className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-secondary border border-border-strong rounded-radius-lg text-[11px] font-medium hover:bg-surface-subtle transition-colors shrink-0"`
    - Satır 285: `borderColor={masterDrag ? 'border-border-strong' : 'border-border-default'}`
    - Satır 346: `className="w-full text-[13px] border rounded-radius-full border-border-default pl-10 pr-3 py-2 outline-none focus:border-border-strong placeholder:text-text-muted"`
    - Satır 397: `className={`flex items-center gap-3 bg-surface-panel border border-border-default rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-border-strong hover:shadow-drop-sm transition-all duration-200 group ${`
    - Satır 586: `? 'border-border-strong bg-surface-subtle/50'`
    - Satır 589: `: 'border-border-default hover:border-border-strong hover:bg-surface-subtle'`
    - Satır 632: `className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted shadow-drop-sm"`
    - Satır 667: `className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted bg-surface-panel shadow-drop-sm font-medium"`
    - Satır 729: `const activeBorder = dragging ? 'border-border-strong' : 'border-border-default';`
    - Satır 746: `className={`border border-dashed rounded-xl p-3 cursor-pointer transition-all flex items-center justify-center gap-3 ${activeBorder} ${activeBg} hover:border-border-strong hover:bg-surface-subtle/30`}`
  - **TemplateSettingsPanel.tsx**
    - Satır 54: `: 'bg-surface-panel border-border-default hover:border-border-strong hover:bg-border-default'`
    - Satır 107: `className="w-full py-2 text-xs font-medium rounded border border-border-strong text-text-secondary hover:bg-surface-subtle"`
  - **BorderRadiusPicker.tsx**
    - Satır 40: `className="w-30 mx-auto block text-[10px] font-bold text-text-secondary text-center border border-border-default rounded p-1.5 outline-none focus:border-border-strong"`
    - Satır 59: `className="w-full text-[10px] font-bold text-text-secondary text-center border border-border-default rounded p-1.5 outline-none focus:border-border-strong"`
  - **PriceCalculator.tsx**
    - Satır 92: `className="w-full mt-1 text-sm border border-border-strong rounded px-2 py-1.5 focus:border-border-strong outline-none"`
    - Satır 104: `className="w-full mt-1 text-xs border border-border-strong rounded px-2 py-1.5 bg-surface-panel focus:border-border-strong outline-none"`
    - Satır 133: `<div className="border-t border-border-strong pt-1.5 flex items-center justify-between">`
  - **Sidebar.tsx**
    - Satır 133: `className="w-full flex items-center justify-center gap-2 border border-border-strong bg-surface-panel hover:bg-surface-subtle text-text-secondary text-body-md py-2.5 rounded-radius-lg transition-all"`
  - **DownloadMenu.tsx**
    - Satır 83: `className="h-8 px-3.5 rounded-radius-md text-xs font-medium border border-border-strong bg-surface-panel text-text-secondary hover:bg-surface-subtle disabled:opacity-60"`
  - **ProjectMenu.tsx**
    - Satır 128: `className="h-8 px-3 rounded-radius-md text-xs font-semibold border border-border-strong bg-surface-panel text-text-secondary hover:bg-surface-subtle"`
  - **TopBar.tsx**
    - Satır 41: `className="bg-surface-subtle text-text-secondary text-xs font-semibold px-3 py-1.5 rounded-radius-md border border-border-strong cursor-pointer hover:bg-border-default transition-all min-w-45 h-8 outline-none"`
    - Satır 76: `? 'bg-surface-subtle border-border-strong text-text-primary hover:bg-border-default'`
    - Satır 77: `: 'bg-surface-panel border-border-strong text-text-secondary hover:bg-surface-subtle'`

### `border-selected` &rarr; Light: `#0f172a` / Dark: `#e2e8f0`
  - **ThemeInjector.tsx**
    - Satır 20: `r.style.setProperty('--color-border-selected', safeTokens.colors.borderSelected);`
  - **Page.tsx**
    - Satır 169: `isSelected ? 'ring-2 ring-border-selected' : ''`
  - **Slot.tsx**
    - Satır 438: `? `z-50 border-2 border-border-selected shadow-2xl${isModuleSlot ? '' : ' bg-surface-subtle'}``
    - Satır 559: `? 'ring-2 ring-border-selected ring-offset-1 cursor-text'`
    - Satır 672: `? 'bg-white/90 text-black z-50 ring-2 ring-border-selected overflow-hidden whitespace-pre-wrap rounded cursor-text'`
    - Satır 678: `? 'ring-2 ring-border-selected'`
  - **PizzaSection.tsx**
    - Satır 61: `className={`outline-none bg-white/90 ring-1 ring-inset ring-border-selected z-50 shadow-sm ${className ?? ''}`}`
  - **TemplateSettingsPanel.tsx**
    - Satır 53: `? 'bg-surface-subtle border-border-selected shadow-drop-sm'`
    - Satır 70: `{isActive && <span className="w-3 h-3 bg-border-selected rounded-full" />}`

### `text-primary` &rarr; Light: `#0f172a` / Dark: `#f1f5f9`
  - **ThemeInjector.tsx**
    - Satır 21: `r.style.setProperty('--color-text-primary', safeTokens.colors.textPrimary);`
  - **ThemeToggle.tsx**
    - Satır 14: `className={`inline-flex items-center justify-center gap-2 rounded-radius-md border border-border-default bg-surface-subtle text-text-secondary transition hover:border-border-strong hover:text-text-primary ${`
  - **Button.tsx**
    - Satır 19: `secondary: 'bg-white text-text-primary border border-[#E5E7EB] hover:bg-surface-subtle',`
  - **AdminThemePage.tsx**
    - Satır 174: `<main className="min-h-screen bg-surface-app text-text-primary">`
    - Satır 246: `className="mt-2 w-full rounded-radius-md border border-border-default bg-surface-panel px-3 py-2 text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 369: `className="min-w-0 flex-1 rounded-radius-md border border-border-default bg-surface-panel px-3 py-2 font-mono text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 405: `className="mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-2 py-2 text-body-sm text-text-primary outline-none focus:border-primary"`
    - Satır 523: `className={`mt-1 w-full rounded-radius-md border border-border-default bg-surface-panel px-2 py-2 text-body-sm text-text-primary outline-none focus:border-primary ${mono ? 'font-mono' : ''}`}`
    - Satır 559: `<p className="text-body-md text-text-primary">Body MD örnek metin</p>`
  - **Layout.tsx**
    - Satır 16: `<div className="min-h-screen bg-surface-app text-text-primary">`
    - Satır 21: `<Link to="/dashboard" className="text-heading-lg text-primary">`
    - Satır 27: `className="text-body-sm text-text-secondary hover:text-text-primary transition-colors"`
  - **Page.tsx**
    - Satır 118: `className="w-full text-left px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-subtle"`
  - **ContextualBar.tsx**
    - Satır 208: `? 'bg-surface-subtle text-text-primary hover:bg-border-default'`
    - Satır 305: `font.textAlign === a ? 'bg-surface-panel shadow text-text-primary' : 'text-text-muted'`
  - **ProductManagement.tsx**
    - Satır 133: `<div className="space-y-4 font-sans text-text-primary">`
    - Satır 152: `<summary className="text-[12px] font-bold text-text-primary cursor-pointer p-3 flex items-center justify-between bg-surface-subtle/60">`
    - Satır 162: `<summary className="text-[12px] font-medium text-text-primary cursor-pointer p-2.5 flex items-center justify-between">`
    - Satır 186: `<h4 className="text-[13px] font-bold text-text-primary">Excel ile Otomatik Yerleştir</h4>`
    - Satır 263: `<h4 className="text-[13px] font-bold text-text-primary">Ürün Havuzu</h4>`
    - Satır 333: `<h4 className="text-[13px] font-bold text-text-primary">Ürün Ara ve Sürükle</h4>`
    - Satır 354: `className={`py-1.5 text-center transition-all ${filterType === 'all' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}`
    - Satır 360: `className={`py-1.5 text-center transition-all ${filterType === 'used' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}`
    - Satır 366: `className={`py-1.5 text-center transition-all ${filterType === 'unused' ? 'bg-surface-panel text-text-primary shadow-drop-sm rounded-radius-md font-medium' : 'hover:text-text-primary'}`}`
    - Satır 414: `<div className={`text-[12px] font-semibold truncate ${placed ? 'text-text-muted' : 'text-text-primary'}`}>`
    - Satır 421: `<div className={`text-[12px] font-bold ${placed ? 'text-text-muted' : 'text-text-primary'}`}>`
    - Satır 453: `<button className="text-[12px] font-medium text-text-secondary hover:text-text-primary flex items-center justify-center w-full gap-1">`
    - Satır 557: `<h3 className="text-heading-xl text-text-primary">Yeni Ürün Ekle</h3>`
    - Satır 660: `<label className="block text-[11px] font-semibold text-text-primary mb-1.5">Satış Fiyatı (Fiyat)</label>`
    - Satır 754: `<div className="text-[12px] font-semibold text-text-primary">`
  - **TemplateSettingsPanel.tsx**
    - Satır 60: `isActive ? 'text-text-primary' : 'text-text-secondary'`
  - **BorderRadiusPicker.tsx**
    - Satır 26: `? 'bg-surface-subtle text-text-primary'`
  - **PriceCalculator.tsx**
    - Satır 66: `<h3 className="text-sm font-bold text-text-primary flex items-center gap-2">`
    - Satır 79: `<strong className="text-text-primary">{template.name}</strong>`
    - Satır 135: `<span className="text-lg font-semibold text-text-primary">`
  - **Sidebar.tsx**
    - Satır 78: `? 'text-text-primary bg-surface-panel border-b-2 border-b-primary shadow-[0_-1px_0_0_#e2e8f0]'`
    - Satır 79: `: 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle border-b-2 border-b-transparent'`
    - Satır 115: `<div className={`flex items-center gap-2 transition-colors ${openSection === 'template' ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 121: `className={`transition-all duration-300 ${openSection === 'template' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 143: `<span className="text-body-md text-text-primary">{activeTemplate?.designType ? getTerm('print', activeTemplate.designType) : 'Seçilmedi'}</span>`
    - Satır 147: `<span className="text-body-md text-text-primary">{activeTemplate?.mode ? getTerm('print', activeTemplate.mode) : '-'}</span>`
    - Satır 151: `<span className="text-body-md text-text-primary">{activeTemplate?.paperSize ? getTerm('print', activeTemplate.paperSize) : '-'}</span>`
    - Satır 155: `<span className="text-body-md text-text-primary">`
    - Satır 161: `<span className="text-body-md text-text-primary">{activeTemplate?.pageCount || '-'}</span>`
    - Satır 186: `<div className={`flex items-center gap-2 transition-colors ${openSection === 'grid' ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 192: `className={`transition-all duration-300 ${openSection === 'grid' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 212: `<div className={`flex items-center gap-2 transition-colors ${openSection === 'background' ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 218: `className={`transition-all duration-300 ${openSection === 'background' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 258: `<div className="flex items-center gap-2 text-text-primary">`
    - Satır 279: `<div className={`flex items-center gap-2 transition-colors ${readyOpen ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 285: `className={`transition-all duration-300 ${readyOpen ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 326: `<div className={`flex items-center gap-2 transition-colors ${mineOpen ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 332: `className={`transition-all duration-300 ${mineOpen ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
  - **TopBar.tsx**
    - Satır 57: `className="h-8 px-3 text-text-secondary hover:text-text-primary hover:bg-border-default rounded-radius-md text-xs font-medium disabled:opacity-30 disabled:hover:bg-transparent"`
    - Satır 76: `? 'bg-surface-subtle border-border-strong text-text-primary hover:bg-border-default'`

### `text-secondary` &rarr; Light: `#475569` / Dark: `#94a3b8`
  - **ThemeInjector.tsx**
    - Satır 22: `r.style.setProperty('--color-text-secondary', safeTokens.colors.textSecondary);`
  - **ThemeToggle.tsx**
    - Satır 14: `className={`inline-flex items-center justify-center gap-2 rounded-radius-md border border-border-default bg-surface-subtle text-text-secondary transition hover:border-border-strong hover:text-text-primary ${`
  - **Button.tsx**
    - Satır 20: `ghost: 'bg-transparent text-text-secondary hover:bg-surface-subtle border border-transparent',`
  - **SegmentedControl.tsx**
    - Satır 18: `: 'bg-white text-text-secondary hover:bg-surface-subtle'`
  - **Toggle.tsx**
    - Satır 31: `{label && <span className="text-xs text-text-secondary">{label}</span>}`
  - **AdminThemePage.tsx**
    - Satır 180: `<p className="mt-1 text-body-sm text-text-secondary">`
    - Satır 194: `: 'border-border-default bg-surface-subtle text-text-secondary hover:border-border-strong'`
    - Satır 212: `className="rounded-radius-md border border-border-default bg-surface-panel px-4 py-2 text-label-md text-text-secondary hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"`
    - Satır 242: `<span className="text-label-sm text-text-secondary">Font ailesi</span>`
    - Satır 347: `<p className="text-body-sm text-text-secondary">{description}</p>`
    - Satır 358: `<span className="text-label-sm text-text-secondary">{label}</span>`
    - Satır 387: `<legend className="px-1 text-label-sm text-text-secondary">{label}</legend>`
    - Satır 483: `<span className="font-mono text-text-secondary">{value}</span>`
    - Satır 541: `<p className="mt-1 text-body-sm text-text-secondary">Panel, metin, border, radius ve shadow örnekleri.</p>`
    - Satır 551: `<button className="border border-border-default bg-surface-panel px-4 text-text-secondary" style={{ borderRadius: tokens.buttons.radius, height: tokens.buttons.height }}>`
    - Satır 560: `<p className="text-body-sm text-text-secondary">Body SM açıklama metni</p>`
    - Satır 566: `<p className="mt-1 text-body-sm text-text-secondary">Shadow tokenlarının genel kart etkisi.</p>`
  - **Layout.tsx**
    - Satır 27: `className="text-body-sm text-text-secondary hover:text-text-primary transition-colors"`
  - **Page.tsx**
    - Satır 95: `className="w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-subtle"`
  - **ContextualBar.tsx**
    - Satır 36: `className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-text-secondary hover:bg-border-default"`
    - Satır 57: `className="h-12 px-3 flex items-center gap-1 text-xs text-text-secondary min-w-175 bg-surface-panel"`
    - Satır 117: `<span className="font-semibold text-text-secondary px-2">`
    - Satır 125: `<span className="text-[10px] font-bold text-text-secondary">Zemin Rengi</span>`
    - Satır 134: `<span className="text-[10px] font-bold text-text-secondary">Kenarlık</span>`
    - Satır 262: `<span className="font-semibold text-text-secondary px-2 capitalize">{element}</span>`
    - Satır 317: `<span className="text-[10px] font-bold text-text-secondary">Yazı Rengi</span>`
    - Satır 349: `<span className="font-semibold text-text-secondary px-2">Footer</span>`
    - Satır 372: `<span className="text-[10px] font-bold text-text-secondary block">Hücre Zemin Rengi</span>`
  - **BannerSettingsPanel.tsx**
    - Satır 95: `<span className="text-[10px] font-bold text-text-secondary block">Izgara Boyutu</span>`
    - Satır 142: `<span className="text-[10px] font-bold text-text-secondary">Zemin</span>`
  - **ProductInfoSettings.tsx**
    - Satır 218: `className="flex-1 py-1.5 bg-surface-subtle hover:bg-border-default text-text-secondary text-[10px] font-medium rounded border border-border-default"`
  - **ProductManagement.tsx**
    - Satır 137: `<p className="text-[11px] text-text-secondary leading-snug w-[65%]">`
    - Satır 142: `className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-secondary border border-border-strong rounded-radius-sm text-[11px] font-medium hover:bg-surface-subtle transition-colors shrink-0"`
    - Satır 173: `<div className="text-[10px] text-text-secondary p-2.5 pt-0 border-t border-border-default mt-1 space-y-1">`
    - Satır 197: `iconColor="text-text-secondary"`
    - Satır 225: `className="w-7 h-7 flex items-center justify-center bg-surface-subtle text-text-muted hover:bg-border-default hover:text-text-secondary rounded-radius-md transition-colors"`
    - Satır 268: `className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-panel text-text-secondary border border-border-strong rounded-radius-lg text-[11px] font-medium hover:bg-surface-subtle transition-colors shrink-0"`
    - Satır 311: `className="flex-1 border border-border-default bg-surface-panel hover:bg-surface-subtle text-text-secondary text-xs py-1.5 px-3 rounded-radius-md flex items-center justify-center gap-1.5 transition-colors"`
    - Satır 351: `<div className="bg-surface-subtle p-1 rounded-radius-lg grid grid-cols-3 text-xs text-text-secondary">`
    - Satır 433: `<div className={`text-text-muted ${placed ? 'opacity-30' : 'group-hover:text-text-secondary'}`}>`
    - Satır 453: `<button className="text-[12px] font-medium text-text-secondary hover:text-text-primary flex items-center justify-center w-full gap-1">`
    - Satır 558: `<button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors p-1 rounded-radius-md hover:bg-surface-subtle">`
    - Satır 569: `<label className="block text-[11px] font-semibold text-text-secondary mb-1.5">Ürün Resmi</label>`
    - Satır 613: `<svg className="w-6 h-6 text-text-muted group-hover:text-text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">`
    - Satır 625: `<label className="block text-[11px] font-semibold text-text-secondary mb-1.5">Ürün Adı</label>`
    - Satır 636: `<label className="block text-[11px] font-semibold text-text-secondary mb-1.5">SKU / Ürün Kodu</label>`
    - Satır 650: `<label className="block text-[11px] font-semibold text-text-secondary mb-1.5">Alış Fiyatı</label>`
    - Satır 677: `className="px-4 py-2.5 bg-surface-panel border border-border-default hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl transition-all shadow-drop-sm disabled:opacity-50 disabled:cursor-not-allowed"`
  - **TemplateSettingsPanel.tsx**
    - Satır 60: `isActive ? 'text-text-primary' : 'text-text-secondary'`
    - Satır 65: `<span className="ml-1.5 text-[8px] font-bold text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded">`
    - Satır 107: `className="w-full py-2 text-xs font-medium rounded border border-border-strong text-text-secondary hover:bg-surface-subtle"`
  - **BorderRadiusPicker.tsx**
    - Satır 21: `<span className="text-[10px] font-bold text-text-secondary">{title}</span>`
    - Satır 40: `className="w-30 mx-auto block text-[10px] font-bold text-text-secondary text-center border border-border-default rounded p-1.5 outline-none focus:border-border-strong"`
    - Satır 59: `className="w-full text-[10px] font-bold text-text-secondary text-center border border-border-default rounded p-1.5 outline-none focus:border-border-strong"`
  - **PriceCalculator.tsx**
    - Satır 71: `className="text-text-muted hover:text-text-secondary text-lg leading-none"`
    - Satır 78: `<div className="bg-surface-subtle rounded p-2 text-[10px] text-text-secondary leading-snug">`
    - Satır 85: `<span className="text-xs font-bold text-text-secondary">Adet</span>`
    - Satır 100: `<span className="text-xs font-bold text-text-secondary">{f.label}</span>`
    - Satır 134: `<span className="text-xs font-bold text-text-secondary">Toplam</span>`
    - Satır 158: `<div className={`flex items-center justify-between text-xs ${muted ? 'text-text-muted' : 'text-text-secondary'}`}>`
  - **Sidebar.tsx**
    - Satır 79: `: 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle border-b-2 border-b-transparent'`
    - Satır 115: `<div className={`flex items-center gap-2 transition-colors ${openSection === 'template' ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 117: `<span className="text-xs font-bold tracking-wider text-text-secondary">Şablon</span>`
    - Satır 121: `className={`transition-all duration-300 ${openSection === 'template' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 133: `className="w-full flex items-center justify-center gap-2 border border-border-strong bg-surface-panel hover:bg-surface-subtle text-text-secondary text-body-md py-2.5 rounded-radius-lg transition-all"`
    - Satır 142: `<span className="text-text-secondary">Tasarım Tipi</span>`
    - Satır 146: `<span className="text-text-secondary">Mod</span>`
    - Satır 150: `<span className="text-text-secondary">Kağıt</span>`
    - Satır 154: `<span className="text-text-secondary">Katlama</span>`
    - Satır 160: `<span className="text-text-secondary">Sayfa</span>`
    - Satır 164: `<span className="text-text-secondary">Açık Ölçü</span>`
    - Satır 170: `<span className="text-text-secondary">Kapalı Ölçü</span>`
    - Satır 186: `<div className={`flex items-center gap-2 transition-colors ${openSection === 'grid' ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 188: `<span className="text-xs font-bold tracking-wider text-text-secondary">Izgara</span>`
    - Satır 192: `className={`transition-all duration-300 ${openSection === 'grid' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 212: `<div className={`flex items-center gap-2 transition-colors ${openSection === 'background' ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 214: `<span className="text-xs font-bold tracking-wider text-text-secondary">Arka plan</span>`
    - Satır 218: `className={`transition-all duration-300 ${openSection === 'background' ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 279: `<div className={`flex items-center gap-2 transition-colors ${readyOpen ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 281: `<span className="text-xs font-bold text-text-secondary">Hazır Modüller</span>`
    - Satır 285: `className={`transition-all duration-300 ${readyOpen ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
    - Satır 326: `<div className={`flex items-center gap-2 transition-colors ${mineOpen ? 'text-text-primary' : 'text-text-secondary'}`}>`
    - Satır 328: `<span className="text-xs font-bold text-text-secondary">Modüllerim</span>`
    - Satır 332: `className={`transition-all duration-300 ${mineOpen ? 'rotate-180 text-text-primary' : 'text-text-secondary'}`}`
  - **TempPoolBar.tsx**
    - Satır 24: `className="h-12 flex items-center justify-center border-b border-border-default text-text-secondary hover:bg-surface-subtle text-xs font-semibold"`
    - Satır 58: `<div className="font-semibold text-text-secondary truncate">{p.name}</div>`
  - **DownloadMenu.tsx**
    - Satır 83: `className="h-8 px-3.5 rounded-radius-md text-xs font-medium border border-border-strong bg-surface-panel text-text-secondary hover:bg-surface-subtle disabled:opacity-60"`
    - Satır 95: `<div className="text-xs font-bold text-text-secondary">{f.label}</div>`
  - **ProjectMenu.tsx**
    - Satır 128: `className="h-8 px-3 rounded-radius-md text-xs font-semibold border border-border-strong bg-surface-panel text-text-secondary hover:bg-surface-subtle"`
    - Satır 138: `<div className="font-bold text-text-secondary">JSON Kaydet</div>`
    - Satır 145: `<div className="font-bold text-text-secondary">JSON Yükle</div>`
    - Satır 153: `<div className="font-bold text-text-secondary">Çoğalt</div>`
  - **TopBar.tsx**
    - Satır 41: `className="bg-surface-subtle text-text-secondary text-xs font-semibold px-3 py-1.5 rounded-radius-md border border-border-strong cursor-pointer hover:bg-border-default transition-all min-w-45 h-8 outline-none"`
    - Satır 57: `className="h-8 px-3 text-text-secondary hover:text-text-primary hover:bg-border-default rounded-radius-md text-xs font-medium disabled:opacity-30 disabled:hover:bg-transparent"`
    - Satır 77: `: 'bg-surface-panel border-border-strong text-text-secondary hover:bg-surface-subtle'`

### `text-muted` &rarr; Light: `#94a3b8` / Dark: `#64748b`
  - **ThemeInjector.tsx**
    - Satır 23: `r.style.setProperty('--color-text-muted', safeTokens.colors.textMuted);`
  - **AdminThemePage.tsx**
    - Satır 178: `<p className="text-label-sm uppercase tracking-[0.14em] text-text-muted">Admin</p>`
    - Satır 401: `<span className="text-label-sm text-text-muted">Ağırlık</span>`
    - Satır 481: `<span className="flex items-center justify-between gap-2 text-label-sm text-text-muted">`
    - Satır 485: `{description && <span className="mt-0.5 block text-body-xs text-text-muted">{description}</span>}`
    - Satır 495: `<div className="mt-1 flex items-center justify-between font-mono text-[10px] text-text-muted">`
    - Satır 518: `<span className="text-label-sm text-text-muted">{label}</span>`
    - Satır 533: `<p className="text-label-sm uppercase tracking-[0.14em] text-text-muted">Canlı önizleme</p>`
    - Satır 561: `<p className="text-label-sm text-text-muted">Label SM / muted metin</p>`
  - **Layout.tsx**
    - Satır 42: `<span className="text-body-sm text-text-muted">`
    - Satır 47: `className="text-body-sm text-text-muted hover:text-danger transition-colors"`
  - **FooterRenderer.tsx**
    - Satır 106: `className="absolute text-[10px] font-black text-text-muted uppercase tracking-tighter pointer-events-none"`
  - **Slot.tsx**
    - Satır 478: `<span className="text-text-muted font-bold text-[14px] uppercase tracking-widest">`
    - Satır 481: `<span className="text-[9px] text-text-muted mt-1">Modül Sürükleyin</span>`
  - **ContextualBar.tsx**
    - Satır 78: `<span className="text-text-muted italic px-2">`
    - Satır 305: `font.textAlign === a ? 'bg-surface-panel shadow text-text-primary' : 'text-text-muted'`
    - Satır 350: `<span className="text-[10px] text-text-muted">{selection.ids.length} hücre</span>`
  - **BannerSettingsPanel.tsx**
    - Satır 53: `<p className="p-3 text-xs text-text-muted italic text-center">`
    - Satır 98: `<span className="text-[10px] text-text-muted w-10">Satır</span>`
    - Satır 108: `<span className="text-text-muted text-xs">×</span>`
    - Satır 110: `<span className="text-[10px] text-text-muted w-10">Sütun</span>`
    - Satır 121: `<p className="text-[9px] text-text-muted">En fazla {MAX_DIM}×{MAX_DIM}</p>`
    - Satır 127: `<p className="text-xs text-text-muted italic text-center">`
    - Satır 130: `<p className="text-[10px] text-text-muted text-center">`
    - Satır 136: `<p className="text-[10px] text-text-muted font-bold px-1">`
  - **PizzaSection.tsx**
    - Satır 245: `<div className="text-text-muted font-bold text-sm flex flex-col items-center">`
  - **CustomTemplateBuilder.tsx**
    - Satır 80: `<h4 className="text-[10px] font-black text-text-muted">YENİ ŞABLON</h4>`
    - Satır 83: `<span className="text-[9px] font-bold text-text-muted">Şablon Adı</span>`
    - Satır 95: `<span className="text-[9px] font-bold text-text-muted">Sayfa Sayısı</span>`
    - Satır 106: `<span className="text-[9px] font-bold text-text-muted">Kırım Tipi</span>`
    - Satır 123: `<span className="text-[9px] font-bold text-text-muted">Sayfa Genişlik mm</span>`
    - Satır 134: `<span className="text-[9px] font-bold text-text-muted">Yükseklik mm</span>`
    - Satır 145: `<span className="text-[9px] font-bold text-text-muted">Bleed mm</span>`
    - Satır 158: `<div className="text-[10px] text-text-muted bg-surface-subtle p-2 rounded">`
    - Satır 173: `<p className="text-[9px] text-text-muted text-center">`
  - **ProductInfoSettings.tsx**
    - Satır 49: `<p className="text-xs text-text-muted italic p-3 text-center">`
    - Satır 101: `<h4 className="text-[10px] font-black text-text-muted">SEÇİLİ HÜCRE</h4>`
    - Satır 102: `<p className="text-[9px] text-text-muted">`
    - Satır 110: `<span className="text-[9px] font-bold text-text-muted block mb-1">Ürün Adı</span>`
    - Satır 124: `<span className="text-[9px] font-bold text-text-muted block mb-1">Fiyat</span>`
    - Satır 138: `<span className="text-[9px] font-bold text-text-muted block mb-1">SKU</span>`
    - Satır 152: `<span className="text-[9px] font-bold text-text-muted block mb-1">Kategori</span>`
    - Satır 166: `<span className="text-[9px] font-bold text-text-muted block mb-1">`
    - Satır 193: `<h5 className="text-[9px] font-black text-text-muted uppercase tracking-wider">Excel Alanları</h5>`
    - Satır 194: `<p className="text-[9px] text-text-muted mt-0.5">Excel’den gelen tüm kolonlar burada düzenlenebilir.</p>`
    - Satır 201: `<span className="ml-1 font-mono font-normal text-[8px] text-text-muted/70">({key})</span>`
  - **ProductManagement.tsx**
    - Satır 154: `<span className="text-[10px] font-medium text-text-muted">Seçili ürün verisini düzenle</span>`
    - Satır 165: `<svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">`
    - Satır 169: `<svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">`
    - Satır 187: `<p className="text-[10px] text-text-muted mt-0.5">POS / SIRA kolonu olan Excel, ürünleri numaralı hücrelere otomatik yerleştirir.</p>`
    - Satır 225: `className="w-7 h-7 flex items-center justify-center bg-surface-subtle text-text-muted hover:bg-border-default hover:text-text-secondary rounded-radius-md transition-colors"`
    - Satır 264: `<p className="text-[10px] text-text-muted mt-0.5">Genel ürün listenizi yükleyin, arayın ve boş hücrelere sürükleyin.</p>`
    - Satır 338: `<svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">`
    - Satır 346: `className="w-full text-[13px] border rounded-radius-full border-border-default pl-10 pr-3 py-2 outline-none focus:border-border-strong placeholder:text-text-muted"`
    - Satır 375: `<div className="py-8 text-center text-text-muted flex flex-col items-center">`
    - Satır 382: `<div className="py-6 text-center text-text-muted">`
    - Satır 409: `<span className="text-[9px] text-text-muted font-bold">Yok</span>`
    - Satır 414: `<div className={`text-[12px] font-semibold truncate ${placed ? 'text-text-muted' : 'text-text-primary'}`}>`
    - Satır 417: `<div className="text-[10px] text-text-muted mt-0.5">{p.sku}</div>`
    - Satır 421: `<div className={`text-[12px] font-bold ${placed ? 'text-text-muted' : 'text-text-primary'}`}>`
    - Satır 433: `<div className={`text-text-muted ${placed ? 'opacity-30' : 'group-hover:text-text-secondary'}`}>`
    - Satır 558: `<button onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors p-1 rounded-radius-md hover:bg-surface-subtle">`
    - Satır 612: `<div className="flex flex-col items-center gap-1.5 text-text-muted p-2 pointer-events-none">`
    - Satır 613: `<svg className="w-6 h-6 text-text-muted group-hover:text-text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">`
    - Satır 632: `className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted shadow-drop-sm"`
    - Satır 667: `className="w-full text-[13px] border border-border-default rounded-radius-lg px-3 py-2 outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-all placeholder:text-text-muted bg-surface-panel shadow-drop-sm font-medium"`
    - Satır 757: `<div className="text-[10px] text-text-muted">Excel sürükleyin veya tıklayıp seçin</div>`
  - **TemplateSettingsPanel.tsx**
    - Satır 72: `<span className="text-[9px] font-bold text-text-muted">`
    - Satır 96: `<p className="text-[10px] text-text-muted font-bold">`
  - **BorderRadiusPicker.tsx**
    - Satır 27: `: 'bg-surface-subtle text-text-muted hover:bg-border-default'`
    - Satır 35: `<span className="text-[10px] font-medium text-text-muted block">Tüm Köşeler</span>`
    - Satır 54: `<span className="text-[8px] font-bold text-text-muted">{label}</span>`
  - **PriceCalculator.tsx**
    - Satır 71: `className="text-text-muted hover:text-text-secondary text-lg leading-none"`
    - Satır 139: `<div className="flex items-center justify-between text-[10px] text-text-muted">`
    - Satır 158: `<div className={`flex items-center justify-between text-xs ${muted ? 'text-text-muted' : 'text-text-secondary'}`}>`
  - **Sidebar.tsx**
    - Satır 262: `<p className="text-[10px] text-text-muted leading-relaxed">{description}</p>`
    - Satır 341: `<p className="text-[10px] text-text-muted">Henüz kayıtlı modülün yok.</p>`
    - Satır 342: `<p className="text-[10px] text-text-muted">Bir modül tasarlayıp kaydet butonuyla buraya ekleyebilirsin.</p>`
  - **TempPoolBar.tsx**
    - Satır 31: `<div className="px-2 py-1.5 text-[10px] text-text-muted flex justify-between items-center border-b border-border-default">`
    - Satır 45: `<p className="text-[10px] text-text-muted italic text-center p-3">`
    - Satır 59: `<div className="text-[10px] text-text-muted">{p.sku}</div>`
    - Satır 65: `className="absolute top-0.5 right-0.5 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100"`
  - **DownloadMenu.tsx**
    - Satır 96: `<div className="text-[10px] text-text-muted">{f.hint}</div>`
  - **ProjectMenu.tsx**
    - Satır 139: `<div className="text-[10px] text-text-muted">Tüm tasarımı .json olarak indir</div>`
    - Satır 146: `<div className="text-[10px] text-text-muted">Daha önce kaydedilmiş projeyi aç</div>`
    - Satır 154: `<div className="text-[10px] text-text-muted">`
  - **TopBar.tsx**
    - Satır 35: `<span className="text-xs font-semibold text-text-muted uppercase tracking-wider">`

## 3. Hardcoded (Token Olmayan) Renk Kullanımları
*Proje genelinde token sistemi yerine doğrudan yazılmış hex, rgb veya rgba değerleri tespit edilmiştir. Bu renkler, token sistemine alınması gereken adaylardır.*

| Dosya | Satır | Değer | Kod Satırı |
|---|---|---|---|
| `apps/web/src/components/ui/Button.tsx` | 18 | `#2563EB` | `primary: 'bg-[#2563EB] text-white hover:bg-blue-700 border border-transparent',` |
| `apps/web/src/components/ui/Button.tsx` | 19 | `#E5E7EB` | `secondary: 'bg-white text-text-primary border border-[#E5E7EB] hover:bg-surface-subtle',` |
| `apps/web/src/components/ui/Button.tsx` | 21 | `#FEF2F2` | `danger: 'bg-[#FEF2F2] text-red-600 border border-red-200 hover:bg-red-100',` |
| `apps/web/src/components/ui/SegmentedControl.tsx` | 9 | `#E5E7EB` | `<div className="flex rounded-[6px] border border-[#E5E7EB] overflow-hidden">` |
| `apps/web/src/components/ui/SegmentedControl.tsx` | 17 | `#2563EB` | `? 'bg-[#2563EB] text-white'` |
| `apps/web/src/components/ui/Toggle.tsx` | 16 | `#2563EB` | `checked ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'` |
| `apps/web/src/components/ui/Toggle.tsx` | 16 | `#E5E7EB` | `checked ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'` |
| `apps/web/src/features/admin/theme/AdminThemePage.tsx` | 355 | `#000000` | `const pickerValue = value.startsWith('#') ? value : '#000000';` |
| `apps/web/src/features/dashboard/DashboardPage.tsx` | 44 | `#E31E24` | `primaryColor: '#E31E24',` |
| `apps/web/src/features/dashboard/DashboardPage.tsx` | 45 | `#FFC107` | `secondaryColor: '#FFC107',` |
| `apps/web/src/features/dashboard/DashboardPage.tsx` | 52 | `#FFFFFF` | `slotBackground: '#FFFFFF',` |
| `apps/web/src/features/dashboard/DashboardPage.tsx` | 54 | `rgba(0,0,0,0.12)` | `slotShadow: '0 1px 3px rgba(0,0,0,0.12)',` |
| `apps/web/src/features/dashboard/DashboardPage.tsx` | 64 | `#FFFFFF` | `background: { type: 'color', value: '#FFFFFF' },` |
| `apps/web/src/features/studio/canvas/Canvas.tsx` | 179 | `#ffffff` | `backgroundColor: '#ffffff',` |
| `apps/web/src/features/studio/canvas/Canvas.tsx` | 180 | `#ef4444` | `outline: '1px dashed #ef4444',` |
| `apps/web/src/features/studio/canvas/Canvas.tsx` | 192 | `#22c55e` | `style={{ outline: '1px solid #22c55e' }}` |
| `apps/web/src/features/studio/canvas/Canvas.tsx` | 202 | `#3b82f6` | `border: '1px dashed #3b82f6',` |
| `apps/web/src/features/studio/canvas/FooterRenderer.tsx` | 91 | `rgba(0,0,0,0.40)` | `style={{ background: 'rgba(0,0,0,0.40)' }}` |
| `apps/web/src/features/studio/canvas/FooterRenderer.tsx` | 128 | `rgba(156,163,175,0.4)` | `border: '1px dashed rgba(156,163,175,0.4)',` |
| `apps/web/src/features/studio/canvas/FooterRenderer.tsx` | 168 | `rgba(107,114,128,0.9)` | `? { outline: '1px solid rgba(107,114,128,0.9)', outlineOffset: '-1px' }` |
| `apps/web/src/features/studio/canvas/FooterRenderer.tsx` | 169 | `rgba(156,163,175,0.6)` | `: { outline: '1px dashed rgba(156,163,175,0.6)', outlineOffset: '-1px' }` |
| `apps/web/src/features/studio/canvas/Slot.tsx` | 514 | `rgba(0,0,0,0.40)` | `style={{ background: 'rgba(0,0,0,0.40)' }}` |
| `apps/web/src/features/studio/modules/BannerSection.tsx` | 189 | `#ffffff` | `const bgColor = instanceData?.bgColor ?? { type: 'solid' as const, color: '#ffffff', opacity: 100 };` |
| `apps/web/src/features/studio/modules/BannerSection.tsx` | 190 | `#e2e8f0` | `const cb = instanceData?.containerBorder ?? { color: { c: '#e2e8f0', o: 0 }, width: 0 };` |
| `apps/web/src/features/studio/modules/BannerSection.tsx` | 192 | `#000000` | `const shadow = instanceData?.shadow ?? { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0, active: false };` |
| `apps/web/src/features/studio/modules/BannerSection.tsx` | 232 | `rgba(100,116,139,0.9)` | `? '1px solid rgba(100,116,139,0.9)'` |
| `apps/web/src/features/studio/modules/BannerSection.tsx` | 233 | `rgba(148,163,184,0.6)` | `: '1px dashed rgba(148,163,184,0.6)'` |
| `apps/web/src/features/studio/panels/BackgroundSettings.tsx` | 23 | `#ffffff` | `const DEFAULT_VALUE: ColorValue = { type: 'solid', color: '#ffffff', opacity: 100 };` |
| `apps/web/src/features/studio/panels/BackgroundSettings.tsx` | 227 | `#2563eb` | `background: `linear-gradient(to right, #2563eb ${foregroundOpacity}%, #e2e8f0 ${foregroundOpacity}%)`,` |
| `apps/web/src/features/studio/panels/BackgroundSettings.tsx` | 227 | `#e2e8f0` | `background: `linear-gradient(to right, #2563eb ${foregroundOpacity}%, #e2e8f0 ${foregroundOpacity}%)`,` |
| `apps/web/src/features/studio/panels/CellPanel.tsx` | 707 | `#e2e8f0` | `color: { c: '#e2e8f0', o: 100 },` |
| `apps/web/src/features/studio/panels/CellPanel.tsx` | 751 | `#ffffff` | `const bgColor = module.bgColor ?? { type: 'solid' as const, color: '#ffffff', opacity: 100 };` |
| `apps/web/src/features/studio/panels/CellPanel.tsx` | 752 | `#e2e8f0` | `const cb = module.containerBorder ?? { color: { c: '#e2e8f0', o: 100 }, width: 0 };` |
| `apps/web/src/features/studio/panels/CellPanel.tsx` | 837 | `#ffffff` | `bgColor: { type: 'solid', color: '#ffffff', opacity: 0 },` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 78 | `#ffffff` | `return { type: 'solid', color: first?.color ?? '#ffffff', opacity: first?.opacity ?? 100 };` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 89 | `#000000` | `{ color: '#000000', opacity: 100, position: 100 },` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 279 | `#1e293b` | `<stop offset="0" stopColor="#1e293b" />` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 280 | `#cbd5e1` | `<stop offset="1" stopColor="#cbd5e1" />` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 290 | `#1e293b` | `<stop offset="0" stopColor="#1e293b" />` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 291 | `#cbd5e1` | `<stop offset="1" stopColor="#cbd5e1" />` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 298 | `#cbd5e1` | `<rect x="1" y="1" width="14" height="14" rx="2" fill="#cbd5e1" />` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 299 | `#1e293b` | `<path d="M8 2.5 L13.5 8 L8 13.5 L2.5 8 Z" fill="#1e293b" />` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 327 | `#ffffff` | `let color = sorted[0]?.color ?? '#ffffff';` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 467 | `rgba(0,0,0,0.35)` | `boxShadow: '0 2px 8px rgba(0,0,0,0.35)',` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 477 | `rgb(15, 23, 42)` | `? '6px solid rgb(15, 23, 42)'` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 478 | `rgb(148, 163, 184)` | `: '6px solid rgb(148, 163, 184)',` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 489 | `#ffffff` | `style={{ backgroundImage: CHECKER_BG, backgroundColor: '#ffffff' }}` |
| `apps/web/src/features/studio/pickers/ColorOpacityPicker.tsx` | 707 | `#000` | `value.type === 'solid' ? value.color : value.stops[0]?.color ?? '#000',` |
| `apps/web/src/features/studio/sidebar/Sidebar.tsx` | 78 | `#e2e8f0` | `? 'text-text-primary bg-surface-panel border-b-2 border-b-primary shadow-[0_-1px_0_0_#e2e8f0]'` |
| `apps/web/src/features/studio/util/style.ts` | 17 | `rgba(255,255,255,${opacity / 100})` | `if (!hex \|\| hex.length < 7) return `rgba(255,255,255,${opacity / 100})`;` |
| `apps/web/src/features/studio/util/style.ts` | 21 | `rgba(${r}, ${g}, ${b}, ${opacity / 100})` | `return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;` |
| `apps/web/src/features/studio/util/style.ts` | 46 | `#ffffff` | `return fallback ?? { type: 'solid', color: '#ffffff', opacity: 100 };` |
| `apps/web/src/features/studio/util/style.ts` | 53 | `#ffffff` | `return first ? { c: first.color, o: first.opacity } : { c: '#ffffff', o: 100 };` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 27 | `#ffffff` | `<polygon points="33.93,25.57 62.07,25.57 62.07,79.57 33.93,79.57" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 27 | `#1e293b` | `<polygon points="33.93,25.57 62.07,25.57 62.07,79.57 33.93,79.57" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 28 | `#ffffff` | `<polygon points="10.00,16.43 33.93,25.57 33.93,79.57 10.00,70.43" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 28 | `#1e293b` | `<polygon points="10.00,16.43 33.93,25.57 33.93,79.57 10.00,70.43" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 29 | `#ffffff` | `<polygon points="62.07,25.57 86.00,16.43 86.00,70.43 62.07,79.57" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 29 | `#1e293b` | `<polygon points="62.07,25.57 86.00,16.43 86.00,70.43 62.07,79.57" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 30 | `#d6d3d1` | `<polygon points="38.15,29.89 57.85,29.89 57.85,48.25 38.15,48.25" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 30 | `#1e293b` | `<polygon points="38.15,29.89 57.85,29.89 57.85,48.25 38.15,48.25" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 31 | `#1e293b` | `<line x1="38.15" y1="55.27" x2="57.85" y2="55.27" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 32 | `#1e293b` | `<line x1="38.15" y1="61.21" x2="53.63" y2="61.21" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 33 | `#1e293b` | `<line x1="38.15" y1="67.15" x2="57.85" y2="67.15" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 34 | `#1e293b` | `<line x1="38.15" y1="73.09" x2="51.38" y2="73.09" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 35 | `#1e293b` | `<line x1="15.98" y1="28.43" x2="30.58" y2="34.01" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 36 | `#1e293b` | `<line x1="15.98" y1="34.91" x2="27.23" y2="39.21" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 37 | `#1e293b` | `<line x1="15.98" y1="43.01" x2="30.58" y2="48.59" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 38 | `#1e293b` | `<line x1="15.98" y1="49.49" x2="28.66" y2="54.34" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 39 | `#1e293b` | `<line x1="15.98" y1="55.97" x2="30.58" y2="61.55" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 40 | `#1e293b` | `<line x1="15.98" y1="62.45" x2="25.79" y2="66.20" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 41 | `#1e293b` | `<line x1="65.42" y1="34.01" x2="80.02" y2="28.43" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 42 | `#1e293b` | `<line x1="65.42" y1="40.49" x2="76.91" y2="36.10" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 43 | `#1e293b` | `<line x1="65.42" y1="48.59" x2="80.02" y2="43.01" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 44 | `#1e293b` | `<line x1="65.42" y1="55.07" x2="75.23" y2="51.32" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 45 | `#1e293b` | `<line x1="65.42" y1="61.55" x2="80.02" y2="55.97" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 46 | `#1e293b` | `<line x1="65.42" y1="68.03" x2="72.84" y2="65.20" stroke="#1e293b" strokeWidth="1.1" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 53 | `#ffffff` | `<polygon points="11.50,78.22 48.00,67.77 48.00,69.57 11.50,80.02" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 53 | `#1e293b` | `<polygon points="11.50,78.22 48.00,67.77 48.00,69.57 11.50,80.02" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 54 | `#ffffff` | `<polygon points="11.50,78.22 48.00,67.77 48.00,71.37 11.50,81.82" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 54 | `#1e293b` | `<polygon points="11.50,78.22 48.00,67.77 48.00,71.37 11.50,81.82" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 55 | `#ffffff` | `<polygon points="11.50,78.22 48.00,67.77 48.00,73.17 11.50,83.63" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 55 | `#1e293b` | `<polygon points="11.50,78.22 48.00,67.77 48.00,73.17 11.50,83.63" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 56 | `#ffffff` | `<polygon points="48.00,67.77 84.50,78.22 84.50,80.02 48.00,69.57" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 56 | `#1e293b` | `<polygon points="48.00,67.77 84.50,78.22 84.50,80.02 48.00,69.57" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 57 | `#ffffff` | `<polygon points="48.00,67.77 84.50,78.22 84.50,81.82 48.00,71.37" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 57 | `#1e293b` | `<polygon points="48.00,67.77 84.50,78.22 84.50,81.82 48.00,71.37" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 58 | `#ffffff` | `<polygon points="48.00,67.77 84.50,78.22 84.50,83.63 48.00,73.17" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 58 | `#1e293b` | `<polygon points="48.00,67.77 84.50,78.22 84.50,83.63 48.00,73.17" fill="#ffffff" stroke="#1e293b" strokeWidth="1.1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 59 | `#ffffff` | `<polygon points="10.00,28.22 48.00,17.77 48.00,67.77 10.00,78.22" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 59 | `#1e293b` | `<polygon points="10.00,28.22 48.00,17.77 48.00,67.77 10.00,78.22" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 60 | `#ffffff` | `<polygon points="48.00,17.77 86.00,28.22 86.00,78.22 48.00,67.77" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 60 | `#1e293b` | `<polygon points="48.00,17.77 86.00,28.22 86.00,78.22 48.00,67.77" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 61 | `#d6d3d1` | `<polygon points="15.70,31.66 43.44,24.03 43.44,38.03 15.70,45.66" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 61 | `#1e293b` | `<polygon points="15.70,31.66 43.44,24.03 43.44,38.03 15.70,45.66" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 62 | `#1e293b` | `<line x1="15.70" y1="52.66" x2="43.44" y2="45.03" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 63 | `#1e293b` | `<line x1="15.70" y1="58.66" x2="38.50" y2="52.39" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 64 | `#1e293b` | `<line x1="15.70" y1="64.66" x2="43.44" y2="57.03" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 65 | `#1e293b` | `<line x1="15.70" y1="70.66" x2="34.70" y2="65.43" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 66 | `#d6d3d1` | `<polygon points="52.56,24.03 80.30,31.66 80.30,45.66 52.56,38.03" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 66 | `#1e293b` | `<polygon points="52.56,24.03 80.30,31.66 80.30,45.66 52.56,38.03" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 67 | `#1e293b` | `<line x1="52.56" y1="45.03" x2="80.30" y2="52.66" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 68 | `#1e293b` | `<line x1="52.56" y1="51.03" x2="75.36" y2="57.30" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 69 | `#1e293b` | `<line x1="52.56" y1="57.03" x2="80.30" y2="64.66" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 70 | `#1e293b` | `<line x1="52.56" y1="63.03" x2="71.56" y2="68.25" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity="1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 77 | `#d6d3d1` | `<path d="M33 14H63V19Q63 21.5 60.5 22H35.5Q33 21.5 33 19Z" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 77 | `#1e293b` | `<path d="M33 14H63V19Q63 21.5 60.5 22H35.5Q33 21.5 33 19Z" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 78 | `#fff` | `<path d="M25 28Q25 22.5 31 22H65Q71 22.5 71 28V81Q71 86.5 65 87H31Q25 86.5 25 81Z" fill="#fff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 78 | `#1e293b` | `<path d="M25 28Q25 22.5 31 22H65Q71 22.5 71 28V81Q71 86.5 65 87H31Q25 86.5 25 81Z" fill="#fff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 79 | `#fff` | `<path d="M22 44Q48 41.5 74 44V70Q48 72.5 22 70Z" fill="#fff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 79 | `#1e293b` | `<path d="M22 44Q48 41.5 74 44V70Q48 72.5 22 70Z" fill="#fff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 86 | `#fff` | `<g transform="rotate(20 22 64)"><rect x="17" y="30" width="62" height="36" rx="3" fill="#fff" stroke="#1e293b" strokeWidth="1.4" /></g>` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 86 | `#1e293b` | `<g transform="rotate(20 22 64)"><rect x="17" y="30" width="62" height="36" rx="3" fill="#fff" stroke="#1e293b" strokeWidth="1.4" /></g>` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 87 | `#fff` | `<g transform="rotate(10 22 64)"><rect x="17" y="30" width="62" height="36" rx="3" fill="#fff" stroke="#1e293b" strokeWidth="1.4" /></g>` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 87 | `#1e293b` | `<g transform="rotate(10 22 64)"><rect x="17" y="30" width="62" height="36" rx="3" fill="#fff" stroke="#1e293b" strokeWidth="1.4" /></g>` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 88 | `#fff` | `<rect x="17" y="30" width="62" height="36" rx="3" fill="#fff" stroke="#1e293b" strokeWidth="1.6" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 88 | `#1e293b` | `<rect x="17" y="30" width="62" height="36" rx="3" fill="#fff" stroke="#1e293b" strokeWidth="1.6" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 105 | `#fff` | `<rect x={v.x} y={v.y} width={v.w} height={v.h} rx="1.5" fill="#fff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 105 | `#1e293b` | `<rect x={v.x} y={v.y} width={v.w} height={v.h} rx="1.5" fill="#fff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 106 | `#0f172a` | `<text x="48" y="48" textAnchor="middle" dominantBaseline="central" fontFamily="Inter, sans-serif" fontWeight="700" fontSize={v.fs} fill="#0f172a">{v.t}</text>` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 112 | `#ffffff` | `if (id === 'none') return <SvgWrap><polygon points="29.5,16 66.5,19.5 66.5,80 29.5,76.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 112 | `#1e293b` | `if (id === 'none') return <SvgWrap><polygon points="29.5,16 66.5,19.5 66.5,80 29.5,76.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 113 | `#ffffff` | `if (id === 'half-fold') return <SvgWrap><polygon points="10.00,13.69 48.00,28.31 48.00,82.31 10.00,67.69" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="48.00,28.31 86.00,13.69 86.00,67.69 48.00,82.31" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 113 | `#1e293b` | `if (id === 'half-fold') return <SvgWrap><polygon points="10.00,13.69 48.00,28.31 48.00,82.31 10.00,67.69" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="48.00,28.31 86.00,13.69 86.00,67.69 48.00,82.31" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 114 | `#ffffff` | `if (id === 'roll-fold') return <SvgWrap><polygon points="10 15.4 34.8 26.6 34.8 80.6 10 69.4 10 15.4" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="34.8 26.6 61.2 26.6 61.2 80.6 34.8 80.6 34.8 26.6" fill="none" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="61.2 26.6 86 15.4 86 69.4 61.2 80.6 61.2 26.6" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 114 | `#1e293b` | `if (id === 'roll-fold') return <SvgWrap><polygon points="10 15.4 34.8 26.6 34.8 80.6 10 69.4 10 15.4" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="34.8 26.6 61.2 26.6 61.2 80.6 34.8 80.6 34.8 26.6" fill="none" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="61.2 26.6 86 15.4 86 69.4 61.2 80.6 61.2 26.6" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 115 | `#fff` | `if (id === 'map-fold') return <SvgWrap><polygon points="10,16.47 35.33,25.53 35.33,79.53 10,70.47" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="35.33,25.53 60.67,16.47 60.67,70.47 35.33,79.53" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="60.67,16.47 86,25.53 86,79.53 60.67,70.47" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 115 | `#1e293b` | `if (id === 'map-fold') return <SvgWrap><polygon points="10,16.47 35.33,25.53 35.33,79.53 10,70.47" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="35.33,25.53 60.67,16.47 60.67,70.47 35.33,79.53" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="60.67,16.47 86,25.53 86,79.53 60.67,70.47" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 116 | `#ffffff` | `if (id === 'z-fold') return <SvgWrap><polygon points="10.00,16.47 35.33,25.53 35.33,79.53 10.00,70.47" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="35.33,25.53 60.67,16.47 60.67,70.47 35.33,79.53" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="60.67,16.47 86.00,25.53 86.00,79.53 60.67,70.47" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 116 | `#1e293b` | `if (id === 'z-fold') return <SvgWrap><polygon points="10.00,16.47 35.33,25.53 35.33,79.53 10.00,70.47" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="35.33,25.53 60.67,16.47 60.67,70.47 35.33,79.53" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /><polygon points="60.67,16.47 86.00,25.53 86.00,79.53 60.67,70.47" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 117 | `#fff` | `if (id === 'triple-fold') return <SvgWrap><polygon points="10,24.40 29,17.60 29,71.60 10,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="29,17.60 48,24.40 48,78.40 29,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="48,24.40 67,17.60 67,71.60 48,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="67,17.60 86,24.40 86,78.40 67,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 117 | `#1e293b` | `if (id === 'triple-fold') return <SvgWrap><polygon points="10,24.40 29,17.60 29,71.60 10,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="29,17.60 48,24.40 48,78.40 29,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="48,24.40 67,17.60 67,71.60 48,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="67,17.60 86,24.40 86,78.40 67,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 118 | `#fff` | `if (id === 'accordion-fold') return <SvgWrap><polygon points="10,24.40 29,17.60 29,71.60 10,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="29,17.60 48,24.40 48,78.40 29,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="48,24.40 67,17.60 67,71.60 48,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="67,17.60 86,24.40 86,78.40 67,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 118 | `#1e293b` | `if (id === 'accordion-fold') return <SvgWrap><polygon points="10,24.40 29,17.60 29,71.60 10,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="29,17.60 48,24.40 48,78.40 29,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="48,24.40 67,17.60 67,71.60 48,78.40" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /><polygon points="67,17.60 86,24.40 86,78.40 67,71.60" fill="#fff" stroke="#1e293b" strokeWidth="1.6" /></SvgWrap>;` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 126 | `#fff` | `<rect x="22" y="14" width="50" height="68" rx="2.5" fill="#fff" stroke="#1e293b" strokeWidth="1.6" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 126 | `#1e293b` | `<rect x="22" y="14" width="50" height="68" rx="2.5" fill="#fff" stroke="#1e293b" strokeWidth="1.6" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 127 | `#1e293b` | `<line x1="48" y1="14" x2="48" y2="82" stroke="#1e293b" strokeWidth="1.2" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 128 | `#1e293b` | `<line x1="22" y1="38" x2="72" y2="38" stroke="#1e293b" strokeWidth="1.2" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 129 | `#1e293b` | `<line x1="22" y1="58" x2="72" y2="58" stroke="#1e293b" strokeWidth="1.2" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 130 | `#d6d3d1` | `<rect x="27" y="43" width="16" height="10" rx="1" fill="#d6d3d1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 131 | `#d6d3d1` | `<rect x="53" y="43" width="14" height="10" rx="1" fill="#d6d3d1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 132 | `#d6d3d1` | `<rect x="27" y="63" width="10" height="10" rx="1" fill="#d6d3d1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 133 | `#d6d3d1` | `<rect x="53" y="63" width="14" height="10" rx="1" fill="#d6d3d1" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 139 | `#fff` | `<rect x="22" y="14" width="50" height="68" rx="2.5" fill="#fff" stroke="#1e293b" strokeWidth="1.6" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 139 | `#1e293b` | `<rect x="22" y="14" width="50" height="68" rx="2.5" fill="#fff" stroke="#1e293b" strokeWidth="1.6" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 140 | `#d6d3d1` | `<rect x="28" y="22" width="20" height="26" rx="1.5" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1.3" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 140 | `#1e293b` | `<rect x="28" y="22" width="20" height="26" rx="1.5" fill="#d6d3d1" stroke="#1e293b" strokeWidth="1.3" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 141 | `#fff` | `<circle cx="60" cy="33" r="9" fill="#fff" stroke="#1e293b" strokeWidth="1.3" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 141 | `#1e293b` | `<circle cx="60" cy="33" r="9" fill="#fff" stroke="#1e293b" strokeWidth="1.3" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 142 | `#d6d3d1` | `<rect x="28" y="58" width="36" height="6" rx="1" fill="#d6d3d1" opacity="0.6" />` |
| `apps/web/src/features/wizard/NewStudioWizard.tsx` | 143 | `#d6d3d1` | `<rect x="28" y="68" width="26" height="6" rx="1" fill="#d6d3d1" opacity="0.4" />` |
| `apps/web/src/stores/studio/catalog.store.ts` | 871 | `#ffffff` | `cs.colors.cellBg = { type: 'solid', color: '#ffffff', opacity: 0 };` |
| `apps/web/src/stores/studio/catalog.store.ts` | 1336 | `#ffffff` | `value: { type: 'solid', color: c.c ?? '#ffffff', opacity: c.o ?? 100 },` |
| `apps/web/src/stores/studio/catalog.store.ts` | 1351 | `#ffffff` | `color: typeof stop.color === 'string' ? stop.color : '#ffffff',` |
| `apps/web/src/stores/studio/defaults.ts` | 31 | `#ffffff` | `bgColor: { c: '#ffffff', o: 0 },` |
| `apps/web/src/stores/studio/defaults.ts` | 32 | `#e2e8f0` | `border: { ...defaultBorder, color: { c: '#e2e8f0', o: 100 } },` |
| `apps/web/src/stores/studio/defaults.ts` | 59 | `#e60000` | `bgColor: '#e60000',` |
| `apps/web/src/stores/studio/defaults.ts` | 60 | `#ffffff` | `textColor: '#ffffff',` |
| `apps/web/src/stores/studio/defaults.ts` | 63 | `#ffffff` | `borderColor: '#ffffff',` |
| `apps/web/src/stores/studio/defaults.ts` | 71 | `#ffffff` | `color: '#ffffff',` |
| `apps/web/src/stores/studio/defaults.ts` | 80 | `#ffffff` | `cellBg: { type: 'solid', color: '#ffffff', opacity: 100 },` |
| `apps/web/src/stores/studio/defaults.ts` | 81 | `#e2e8f0` | `cellBorder: { c: '#e2e8f0', o: 100 },` |
| `apps/web/src/stores/studio/defaults.ts` | 82 | `#e60000` | `priceBg: { type: 'solid', color: '#e60000', opacity: 100 },` |
| `apps/web/src/stores/studio/defaults.ts` | 83 | `#ffffff` | `priceBorder: { c: '#ffffff', o: 100 },` |
| `apps/web/src/stores/studio/defaults.ts` | 98 | `#1e293b` | `color: '#1e293b',` |
| `apps/web/src/stores/studio/defaults.ts` | 108 | `#ffffff` | `color: '#ffffff',` |
| `apps/web/src/stores/studio/module-registry.ts` | 16 | `#ffffff` | `bgColor: { type: 'solid', color: '#ffffff', opacity: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 17 | `#e2e8f0` | `containerBorder: { color: { c: '#e2e8f0', o: 100 }, width: 0 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 19 | `#000000` | `shadow: { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0, active: false },` |
| `apps/web/src/stores/studio/module-registry.ts` | 37 | `#1e293b` | `color: '#1e293b',` |
| `apps/web/src/stores/studio/module-registry.ts` | 42 | `#ffffff` | `bgColor: { type: 'solid', color: '#ffffff', opacity: 0 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 43 | `#e2e8f0` | `border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: '#e2e8f0', o: 100 }, style: 'solid' },` |
| `apps/web/src/stores/studio/module-registry.ts` | 53 | `#ffffff` | `bg: { type: 'solid', color: '#ffffff', opacity: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 54 | `#1e293b` | `border: { c: '#1e293b', o: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 55 | `#ffffff` | `tableBg: { type: 'solid', color: '#ffffff', opacity: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 56 | `#1e293b` | `tableTitleBg: { type: 'solid', color: '#1e293b', opacity: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 57 | `#f1f5f9` | `cellBg: { type: 'solid', color: '#f1f5f9', opacity: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 58 | `#ffffff` | `cellPriceBg: { type: 'solid', color: '#ffffff', opacity: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 59 | `#cbd5e1` | `tableLine: { c: '#cbd5e1', o: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 60 | `#f8fafc` | `imgBg: { type: 'solid', color: '#f8fafc', opacity: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 61 | `#94a3b8` | `imgBorder: { c: '#94a3b8', o: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 64 | `#0f172a` | `title: { fontFamily: 'Inter', fontWeight: '900', fontSize: 18, lineHeight: 1.2, letterSpacing: 0, textAlign: 'center', textTransform: 'uppercase', textDecoration: 'none', color: '#0f172a', opacity: 100, verticalAlign: 'middle', decimalScale: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 65 | `#ffffff` | `tableTitle: { fontFamily: 'Inter', fontWeight: '700', fontSize: 11, lineHeight: 1.2, letterSpacing: 0, textAlign: 'center', textTransform: 'uppercase', textDecoration: 'none', color: '#ffffff', opacity: 100, verticalAlign: 'middle', decimalScale: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 66 | `#000000` | `sizes: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, lineHeight: 1.2, letterSpacing: 0, textAlign: 'center', textTransform: 'none', textDecoration: 'none', color: '#000000', opacity: 100, verticalAlign: 'middle', decimalScale: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 67 | `#dc2626` | `prices: { fontFamily: 'Inter', fontWeight: '900', fontSize: 12, lineHeight: 1.2, letterSpacing: 0, textAlign: 'center', textTransform: 'none', textDecoration: 'none', color: '#dc2626', opacity: 100, verticalAlign: 'middle', decimalScale: 100 },` |
| `apps/web/src/stores/studio/module-registry.ts` | 80 | `#000000` | `container: { x: 0, y: 4, blur: 10, spread: -1, color: '#000000', opacity: 5, active: true },` |
| `apps/web/src/stores/studio/module-registry.ts` | 81 | `#000000` | `table: { x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 10, active: false },` |
| `apps/web/src/stores/studio/module-registry.ts` | 82 | `#000000` | `image: { x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 10, active: false },` |
| `apps/web/src/stores/studio/module-registry.ts` | 83 | `#000000` | `cell: { x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 10, active: false },` |
| `packages/shared/src/types/design-tokens.ts` | 95 | `#000000` | `color: '#000000',` |
| `packages/shared/src/types/design-tokens.ts` | 121 | `#000000` | `color: '#000000',` |
| `packages/shared/src/types/design-tokens.ts` | 132 | `#e2e8f0` | `color: { c: '#e2e8f0', o: 100 },` |
