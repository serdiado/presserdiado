// Hızlı bar renk-tetikleyici — TÜM renk seçimlerinde (zemin/çerçeve/font rengi) TEK, tutarlı
// görünüm. ColorOpacityPicker'ın `trigger` prop'una geçirilir; kendi sarmalayıcı class'ı YOKTUR —
// ColorOpacityPicker'ın varsayılan trigger kutusu (h-9 px-3 ...) zaten bunu sağlar, üstüne
// eklenirse çifte kutu/dolgu oluşur (önceki bug: TextStyleSection'ın kendi ColorSwatch'ı böyleydi).
export function ColorSwatchTrigger({
  color,
  opacity,
  label = 'Renk',
}: {
  color: string;
  opacity: number;
  label?: string;
}) {
  return (
    <>
      <span
        className="w-3.5 h-3.5 rounded-sm shrink-0"
        style={{ backgroundColor: color, opacity: opacity / 100, border: '1px solid rgba(0,0,0,0.15)' }}
      />
      <span>{label}</span>
    </>
  );
}
