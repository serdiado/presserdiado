import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, PackageSearch, AlertCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ProductFormModal } from '../components/ProductFormModal';
import { ExcelImportModal } from '../components/ExcelImportModal';
import type { Product } from '../types';

export function UrunListelerim() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Çoklu seçim
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming response is { data: Product[], total: number } based on service.ts
      const res = await api.get('/products');
      const data = res.data.data || res.data; // fallback if it's direct array
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Ürünler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [products, search]);

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (p: Product) => {
    setDeletingProduct(p);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      toast.success('Ürün silindi');
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Ürün silinemedi');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const allSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      if (filteredProducts.every((p) => prev.has(p.id))) {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.delete(p.id));
        return next;
      }
      const next = new Set(prev);
      filteredProducts.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    try {
      const res = await api.delete('/products/bulk', { data: { ids } });
      toast.success(`${res.data.deleted} ürün silindi`);
      clearSelection();
      setIsBulkDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Bulk delete error', err);
      toast.error('Ürünler silinemedi');
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-heading-xl text-text-primary">Ürün Listelerim</h1>
          <div className="w-32 h-9 bg-slate-200 animate-pulse rounded-md" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-panel rounded-md border border-border-default animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-danger mb-4" />
        <p className="text-body-md text-text-secondary mb-4">{error}</p>
        <Button variant="secondary" onClick={fetchProducts} leftIcon={<RefreshCw size={16} />}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <h1 className="text-heading-xl text-text-primary">Ürün Listelerim</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<FileSpreadsheet size={16} />}
            onClick={() => setIsImportOpen(true)}
          >
            Excel'den İçe Aktar
          </Button>
          <Button variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={handleAddClick}>
            Ürün Ekle
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        // Empty State
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-dashed border-border-strong rounded-xl p-8">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
            <PackageSearch size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-heading-md text-text-primary mb-1">Henüz ürün eklenmedi</h3>
          <p className="text-body-sm text-text-secondary mb-6 max-w-sm text-center">
            Müşterilerinize sunacağınız ürünleri buradan ekleyebilir, fiyat ve stok kodlarıyla yönetebilirsiniz.
          </p>
          <Button variant="primary" size="md" onClick={handleAddClick}>
            İlk Ürününü Ekle
          </Button>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="relative w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="İsim, SKU veya kategori ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-border-default hover:border-border-strong bg-white text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-strong"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-body-sm text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary cursor-pointer"
                  checked={allSelected}
                  onChange={toggleAll}
                />
                Tümünü Seç
              </label>
              <div className="text-body-sm text-text-secondary">
                Toplam {filteredProducts.length} ürün
              </div>
            </div>
          </div>

          {/* Seçim aksiyon bar'ı */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mb-4 shrink-0 bg-surface-subtle border border-border-default rounded-radius-md px-4 py-2">
              <span className="text-body-sm text-text-primary">
                {selectedIds.size} öğe seçildi
              </span>
              <button
                onClick={clearSelection}
                className="text-body-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Seçimi Temizle
              </button>
              <div className="ml-auto">
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 size={14} />}
                  onClick={() => setIsBulkDeleteOpen(true)}
                >
                  Seçilenleri Sil
                </Button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-auto">
            <div className="space-y-2">
              {filteredProducts.map((product) => {
                const selected = selectedIds.has(product.id);
                return (
                <div
                  key={product.id}
                  className={`group flex items-center justify-between border p-4 rounded-md transition-colors ${
                    selected
                      ? 'bg-surface-subtle border-border-strong'
                      : 'bg-white border-border-default hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      className={`w-4 h-4 accent-primary cursor-pointer shrink-0 transition-opacity ${
                        selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      checked={selected}
                      onChange={() => toggleSelect(product.id)}
                    />
                    <div className="w-24 shrink-0">
                      <span className="font-mono text-body-xs text-text-muted bg-slate-50 px-2 py-1 rounded">
                        {product.sku}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-heading-sm text-text-primary truncate">
                          {product.name}
                        </h4>
                        {product.category && (
                          <span className="text-body-xs text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded border border-border-default shrink-0">
                            {product.category}
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-body-xs text-text-muted truncate mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 ml-4">
                    <div className="text-right w-24">
                      {product.price !== null && product.price !== undefined ? (
                        <div className="text-heading-sm text-text-primary">
                          {Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </div>
                      ) : (
                        <span className="text-body-xs text-text-muted">-</span>
                      )}
                      {product.unit && (
                        <div className="text-[10px] text-text-muted mt-0.5">/ {product.unit}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger-subtle rounded transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}

              {filteredProducts.length === 0 && search && (
                <div className="text-center py-12 text-body-md text-text-secondary">
                  Aramanızla eşleşen ürün bulunamadı.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={editingProduct}
        onSave={fetchProducts}
      />

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={fetchProducts}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Ürünü Sil"
        description={
          deletingProduct
            ? `"${deletingProduct.name}" ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : ''
        }
        confirmLabel="Sil"
        cancelLabel="Vazgeç"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />

      <ConfirmModal
        isOpen={isBulkDeleteOpen}
        title="Seçilenleri Sil"
        description={`${selectedIds.size} ürün silinecek. Bu işlem geri alınamaz.`}
        confirmLabel="Sil"
        cancelLabel="Vazgeç"
        confirmVariant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setIsBulkDeleteOpen(false)}
      />
    </div>
  );
}
