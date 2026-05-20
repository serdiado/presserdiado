import { useRef, useState } from 'react';
import type {
  BorderRadiusData,
  ShadowData,
  SpacingData,
  TypographyData,
} from '@matbaapro/shared';
import { useCatalogStore } from '@/stores/studio';
import { hexToRgba } from '../util/style';
import type { PizzaModuleData } from './types';

interface Props {
  instanceData: PizzaModuleData;
  slotId: string;
  pageNumber: number;
}

const radiusStyle = (r: BorderRadiusData) => `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`;
const paddingStyle = (s: SpacingData) => `${s.t}px ${s.r}px ${s.b}px ${s.l}px`;
const shadowStyle = (s: ShadowData) =>
  !s.active ? 'none' : `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`;

const fontStyle = (font: TypographyData): React.CSSProperties => ({
  fontFamily: font.fontFamily,
  fontWeight: font.fontWeight,
  fontSize: `${font.fontSize}px`,
  lineHeight: font.lineHeight,
  letterSpacing: `${font.letterSpacing}px`,
  textAlign: font.textAlign,
  textTransform: font.textTransform,
  textDecoration: font.textDecoration,
  color: hexToRgba(font.color, font.opacity),
  display: 'flex',
  justifyContent:
    font.textAlign === 'center' ? 'center' : font.textAlign === 'right' ? 'flex-end' : 'flex-start',
  alignItems:
    font.verticalAlign === 'top' ? 'flex-start' : font.verticalAlign === 'bottom' ? 'flex-end' : 'center',
});

function EditableText({
  initialValue,
  font,
  className,
  style,
  onChange,
}: {
  initialValue: string;
  font: TypographyData;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (val: string) => void;
}) {
  const [val, setVal] = useState(initialValue);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        className={`outline-none bg-white/90 ring-1 ring-inset ring-blue-500 z-50 shadow-sm ${className ?? ''}`}
        style={{ ...style, ...fontStyle(font) }}
        onBlur={(e) => {
          const v = e.currentTarget.innerText;
          setVal(v);
          setEditing(false);
          onChange?.(v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setEditing(false);
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        ref={(el) => {
          if (el && document.activeElement !== el) {
            el.focus();
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }}
      >
        {val}
      </div>
    );
  }

  return (
    <div
      className={`cursor-text ${className ?? ''}`}
      style={{ ...style, ...fontStyle(font) }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="Düzenlemek için çift tıklayın"
    >
      {val}
    </div>
  );
}

export function PizzaSection({ instanceData, slotId, pageNumber }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateSlotModuleData = useCatalogStore((s) => s.updateSlotModuleData);
  const { title, colors, fonts, tableLineWidth, radiuses, spacings, shadows, imageUrl } = instanceData;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    updateSlotModuleData(pageNumber, slotId, { imageUrl: URL.createObjectURL(f) });
  };

  const tableBorder = `${tableLineWidth}px solid ${hexToRgba(colors.tableLine.c, colors.tableLine.o)}`;

  const Cell = ({ size, price, isLast }: { size: string; price: string; isLast?: boolean }) => (
    <div
      className="flex flex-col h-full"
      style={{
        borderRight: isLast ? 'none' : tableBorder,
        boxShadow: shadowStyle(shadows.cell),
      }}
    >
      <EditableText
        initialValue={size}
        font={fonts.sizes}
        className="flex-1 w-full"
        style={{
          padding: paddingStyle(spacings.cell),
          borderBottom: tableBorder,
          backgroundColor: hexToRgba(colors.cellBg.c, colors.cellBg.o),
        }}
      />
      <EditableText
        initialValue={price}
        font={fonts.prices}
        className="flex-1 w-full"
        style={{
          padding: paddingStyle(spacings.cell),
          backgroundColor: hexToRgba(colors.cellPriceBg.c, colors.cellPriceBg.o),
        }}
      />
    </div>
  );

  return (
    <div
      className="w-full h-full flex flex-col border-2"
      style={{
        padding: paddingStyle(spacings.container),
        backgroundColor: hexToRgba(colors.bg.c, colors.bg.o),
        borderColor: hexToRgba(colors.border.c, colors.border.o),
        borderRadius: radiusStyle(radiuses.container),
        boxShadow: shadowStyle(shadows.container),
      }}
    >
      <div
        className="w-full shrink-0 border-b-2 pb-2"
        style={{ borderColor: hexToRgba(colors.border.c, colors.border.o) }}
      >
        <EditableText
          initialValue={title || 'PIZZA-MENÜ'}
          font={fonts.title}
          className="w-full"
          onChange={(v) => updateSlotModuleData(pageNumber, slotId, { title: v })}
        />
      </div>

      <div className="flex flex-row gap-4 flex-1 min-h-0 mt-4">
        <div className="flex flex-col gap-3 flex-1">
          <div
            className="flex flex-col flex-1 overflow-hidden"
            style={{
              border: tableBorder,
              backgroundColor: hexToRgba(colors.tableBg.c, colors.tableBg.o),
              borderRadius: radiusStyle(radiuses.table),
              boxShadow: shadowStyle(shadows.table),
            }}
          >
            <EditableText
              initialValue="20'lik 100 Adet"
              font={fonts.tableTitle}
              className="w-full"
              style={{
                padding: paddingStyle(spacings.tableTitle),
                backgroundColor: hexToRgba(colors.tableTitleBg.c, colors.tableTitleBg.o),
              }}
            />
            <div className="grid grid-cols-4 flex-1">
              <Cell size="20×20" price="7,99" />
              <Cell size="22×22" price="9,49" />
              <Cell size="24×24" price="10,49" />
              <Cell size="26×26" price="11,49" isLast />
            </div>
          </div>
          <div
            className="flex flex-col flex-1 overflow-hidden"
            style={{
              border: tableBorder,
              backgroundColor: hexToRgba(colors.tableBg.c, colors.tableBg.o),
              borderRadius: radiusStyle(radiuses.table),
              boxShadow: shadowStyle(shadows.table),
            }}
          >
            <EditableText
              initialValue="30'luk 50 Adet"
              font={fonts.tableTitle}
              className="w-full"
              style={{
                padding: paddingStyle(spacings.tableTitle),
                backgroundColor: hexToRgba(colors.tableTitleBg.c, colors.tableTitleBg.o),
              }}
            />
            <div className="grid grid-cols-4 flex-1">
              <Cell size="28×28" price="12,49" />
              <Cell size="29×29" price="12,99" />
              <Cell size="30×30" price="13,49" />
              <Cell size="32×32" price="14,49" isLast />
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <div
            className="w-full h-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden"
            style={{
              borderColor: hexToRgba(colors.imgBorder.c, colors.imgBorder.o),
              backgroundColor: hexToRgba(colors.imgBg.c, colors.imgBg.o),
              borderRadius: radiusStyle(radiuses.image),
              boxShadow: shadowStyle(shadows.image),
            }}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Pizza" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="text-slate-400 font-bold text-sm flex flex-col items-center">
                <span className="text-3xl mb-1">+</span>
                <span>RESİM EKLE</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
