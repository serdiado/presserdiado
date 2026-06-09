import React, { useEffect, useState } from 'react';
import { X, Loader2, Package } from 'lucide-react';
import axios from 'axios';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import type { Product } from '../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  // Kaydetme sonrası çağrılır. Yeni ürün oluşturulduysa oluşturulan ürünü iletir.
  onSave: (saved?: Product) => void;
}

export function ProductFormModal({ isOpen, onClose, product, onSave }: ProductFormModalProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [skuError, setSkuError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setSku(product.sku);
        setName(product.name);
        setPrice(product.price ? String(product.price) : '');
        setCategory(product.category || '');
        setUnit(product.unit || '');
        setDescription(product.description || '');
      } else {
        setSku('');
        setName('');
        setPrice('');
        setCategory('');
        setUnit('');
        setDescription('');
      }
      setSkuError(null);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSkuError(null);
    
    if (!sku.trim() || !name.trim()) return;

    try {
      setIsLoading(true);
      const payload = {
        sku: sku.trim(),
        name: name.trim(),
        price: price ? parseFloat(price) : undefined,
        category: category.trim() || undefined,
        unit: unit.trim() || undefined,
        description: description.trim() || undefined,
      };

      let saved: Product | undefined;
      if (product) {
        await api.patch(`/products/${product.id}`, payload);
        toast.success('Ürün güncellendi');
      } else {
        const res = await api.post<Product>('/products', payload);
        saved = res.data;
        toast.success('Ürün eklendi');
      }

      onSave(saved);
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setSkuError('Bu SKU zaten kullanımda');
      } else {
        toast.error('Bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in">
      <div className="bg-surface-panel border border-border-default rounded-radius-xl w-full max-w-lg shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
              <Package size={16} />
            </div>
            <h2 className="text-heading-xl text-text-primary">
              {product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto flex-1 flex flex-col">
          <form id="product-form" onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md text-text-primary mb-1.5">
                  SKU <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    if (skuError) setSkuError(null);
                  }}
                  className={`w-full h-9 px-3 border rounded-radius-md text-body-md text-text-primary bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong ${
                    skuError ? 'border-danger' : 'border-border-default hover:border-border-strong'
                  }`}
                />
                {skuError && <p className="mt-1 text-body-xs text-danger">{skuError}</p>}
              </div>

              <div>
                <label className="block text-label-md text-text-primary mb-1.5">
                  Fiyat
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full h-9 pl-3 pr-8 border border-border-default hover:border-border-strong rounded-radius-md text-body-md text-text-primary bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-body-md">
                    ₺
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-label-md text-text-primary mb-1.5">
                Ürün Adı <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={255}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-9 px-3 border border-border-default hover:border-border-strong rounded-radius-md text-body-md text-text-primary bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md text-text-primary mb-1.5">
                  Kategori
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 px-3 border border-border-default hover:border-border-strong rounded-radius-md text-body-md text-text-primary bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong"
                />
              </div>

              <div>
                <label className="block text-label-md text-text-primary mb-1.5">
                  Birim
                </label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="adet, kg, lt..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-9 px-3 border border-border-default hover:border-border-strong rounded-radius-md text-body-md text-text-primary bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong placeholder:text-text-muted"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-md text-text-primary mb-1.5">
                Açıklama
              </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-border-default hover:border-border-strong rounded-radius-md text-body-md text-text-primary bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border-default flex justify-end gap-3 shrink-0">
              <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
                İptal
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <span>Kaydet</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
