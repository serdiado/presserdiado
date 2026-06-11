// Katalog seçeneklerini çeker (GET /catalog/product-types/:key/options). Public endpoint.
// PrintOptionsSelector'ı besler; S5 stüdyo + S6 web aynı hook'u kullanır.

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { CatalogOptions } from '../types';

interface UseCatalogOptionsResult {
  data: CatalogOptions | null;
  loading: boolean;
  error: string | null;
}

export function useCatalogOptions(productTypeKey: string): UseCatalogOptionsResult {
  const [data, setData] = useState<CatalogOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<CatalogOptions>(`/catalog/product-types/${productTypeKey}/options`)
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Katalog seçenekleri yüklenemedi:', err);
        setError('Baskı seçenekleri yüklenemedi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productTypeKey]);

  return { data, loading, error };
}
