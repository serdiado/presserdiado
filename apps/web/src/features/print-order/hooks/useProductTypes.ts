// Vitrin ürün listesi (GET /catalog/product-types). Public endpoint; StorefrontPage grid'i besler.

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { CatalogProductType } from '../types';

interface UseProductTypesResult {
  data: CatalogProductType[] | null;
  loading: boolean;
  error: string | null;
}

export function useProductTypes(): UseProductTypesResult {
  const [data, setData] = useState<CatalogProductType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ productTypes: CatalogProductType[] }>('/catalog/product-types')
      .then((res) => {
        if (!cancelled) setData(res.data.productTypes);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Ürün listesi yüklenemedi:', err);
        setError('Ürünler yüklenemedi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
