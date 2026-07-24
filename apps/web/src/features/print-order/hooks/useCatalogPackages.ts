// Paket kuralları (GET /catalog/product-types/:key/packages). Public endpoint.
// Ürün detay sayfası, seçili komboya uyan geçerli adet listesini bundan türetir.

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { CatalogPackage, PrintOptionsValue } from '../types';

interface UseCatalogPackagesResult {
  packages: CatalogPackage[] | null;
  loading: boolean;
  error: string | null;
}

export function useCatalogPackages(productTypeKey: string): UseCatalogPackagesResult {
  const [packages, setPackages] = useState<CatalogPackage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<{ packages: CatalogPackage[] }>(`/catalog/product-types/${productTypeKey}/packages`)
      .then((res) => {
        if (!cancelled) setPackages(res.data.packages);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Paket listesi yüklenemedi:', err);
        setError('Adet seçenekleri yüklenemedi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productTypeKey]);

  return { packages, loading, error };
}

// Paket kuralı kolonu -> seçim alanı eşlemesi (pricing service RULE_MATCH_COLUMNS aynası).
const PACKAGE_MATCH: Array<[keyof CatalogPackage, keyof PrintOptionsValue]> = [
  ['sizeKey', 'size'],
  ['paperTypeKey', 'paperType'],
  ['paperWeightKey', 'paperWeight'],
  ['colorModeKey', 'colorMode'],
  ['coatingKey', 'coating'],
  ['bindingKey', 'binding'],
];

// Seçili komboya uyan paketlerin adetleri (artan, tekilleştirilmiş).
// Paketin DOLU olan her kriteri seçimle birebir uyuşmalı (NULL = kritere bakma).
export function validQuantities(
  packages: CatalogPackage[] | null,
  selection: PrintOptionsValue,
): number[] {
  if (!packages) return [];
  const result = new Set<number>();
  for (const pkg of packages) {
    let matches = true;
    for (const [pkgKey, selKey] of PACKAGE_MATCH) {
      const pkgVal = pkg[pkgKey];
      if (pkgVal == null) continue;
      if (pkgVal !== selection[selKey]) {
        matches = false;
        break;
      }
    }
    if (matches) result.add(pkg.quantity);
  }
  return [...result].sort((a, b) => a - b);
}
