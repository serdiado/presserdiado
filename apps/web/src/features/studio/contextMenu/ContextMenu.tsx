// Sağ tık menüsü — TEK renderer (veri-driven). buildMenu(ctx) çıktısını portal'a çizer; §2 divider
// (gruplar arası) + §3 renk (descriptor.danger) BURADA uygulanır → JSX'te elle dal/renk/sıra yok.
// id="context-menu-container" KORUNUR → Page.tsx mousedown-capture click-outside menüyü kapatmaya devam eder.
// 2a'da WIRE YOK (Page.tsx henüz bunu mount etmez); 2b pilot parite turunda bağlanır.

import { Fragment } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { buildMenu, MENU_ACTIONS } from './menuRegistry';
import type { MenuContext } from './menuContext';

interface Props {
  ctx: MenuContext;
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ ctx, x, y, onClose }: Props) {
  const groups = buildMenu(ctx, MENU_ACTIONS);
  if (groups.length === 0) return null;

  return createPortal(
    <div
      id="context-menu-container"
      className="fixed z-99999 bg-surface-panel border border-border-strong shadow-2xl rounded-md py-1 min-w-37.5"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {groups.map((grp) => (
        <Fragment key={grp.group}>
          {grp.dividerBefore && <div className="my-1 border-t border-border-default" />}
          {grp.items.map((a) => {
            const disabled = a.enabled ? !a.enabled(ctx) : false;
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                disabled={disabled}
                className={`w-full text-left px-4 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-40 ${
                  a.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-text-secondary hover:bg-surface-subtle'
                }`}
                onClick={() => {
                  // run() bir dış-store (zustand) mutasyonu; onClose() bu portal'lı bileşeni (ContextMenu)
                  // AYNI discrete-event handler'ında UNMOUNT eder. React 18, dış-store güncellemesi
                  // unmount OLAN bileşenin handler'ından tetiklendiğinde abone bileşenlerin (Page/Slot)
                  // re-render'ını commit ETMİYOR → store doğru ama ekran F5'e kadar bayat. flushSync,
                  // run'ın abone re-render'ını onClose'dan ÖNCE SENKRON commit eder. (Eski inline menüde
                  // handler Page'e — aboneye — aitti; bu yüzden sorun yoktu.) Bkz. ContextMenu.test.tsx.
                  flushSync(() => a.run(ctx));
                  onClose();
                }}
              >
                {Icon && <Icon size={16} />}
                {a.label(ctx)}
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>,
    document.body,
  );
}
