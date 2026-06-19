import { richTextToPlain } from '../modules/richText';

/**
 * Sürükleme işlemi sırasında farenin altında belirecek olan ürün "drag image"
 * (hayalet görüntü / ghost) DOM yapısını oluşturur.
 * Ürün havuzundaki (ProductManagement.tsx) ürün kartı tasarımıyla birebir eşleşir.
 */
export function createProductDragImage(product: { name: string; imageUrl?: string }) {
  // Geçici dış kapsayıcı div (Sidebarda yer alan ürün kartı sınıfları ve genişliği)
  const dragDiv = document.createElement('div');
  
  // Tailwind sınıflarını doğrudan atıyoruz
  dragDiv.className = 'flex items-center gap-3 bg-surface-panel border border-border-default rounded-radius-lg p-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] pointer-events-none';
  
  // Drag image'ın düzgün görüntülenmesi ve ekran dışında kalması için inline stiller
  dragDiv.style.position = 'fixed';
  dragDiv.style.top = '-1000px';
  dragDiv.style.left = '-1000px';
  dragDiv.style.width = '240px'; // Kart için makul sabit genişlik
  dragDiv.style.zIndex = '9999';

  // Görsel Kutusu (w-10 h-10)
  const imgBox = document.createElement('div');
  imgBox.className = 'w-10 h-10 bg-surface-panel rounded-radius-md border border-border-default flex justify-center items-center overflow-hidden shrink-0';

  if (product.imageUrl) {
    const img = document.createElement('img');
    img.src = product.imageUrl;
    img.className = 'max-w-full max-h-full object-contain';
    imgBox.appendChild(img);
  } else {
    const noImgSpan = document.createElement('span');
    noImgSpan.className = 'text-label-sm text-text-muted';
    noImgSpan.innerText = 'Yok';
    imgBox.appendChild(noImgSpan);
  }
  dragDiv.appendChild(imgBox);

  // İçerik Kutusu (Metin alanları)
  const contentBox = document.createElement('div');
  contentBox.className = 'flex-1 min-w-0 flex flex-col justify-center';

  const nameDiv = document.createElement('div');
  nameDiv.className = 'text-label-md truncate text-text-primary font-medium';
  nameDiv.textContent = richTextToPlain(product.name); // HTML ad → düz metin (tag göstermesin)
  contentBox.appendChild(nameDiv);

  dragDiv.appendChild(contentBox);

  // DOM'a ekle
  document.body.appendChild(dragDiv);

  // Tarayıcının sürükleme görüntüsünü yakalamasından sonra asenkron olarak DOM'dan temizle
  setTimeout(() => {
    if (dragDiv.parentNode) {
      document.body.removeChild(dragDiv);
    }
  }, 0);

  return dragDiv;
}
