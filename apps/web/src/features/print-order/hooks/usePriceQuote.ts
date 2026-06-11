// Canlı fiyat hesabı (POST /pricing/quote). Debounce'lu + son-istek-kazanır (stale yanıt yok sayılır).
// Tek kaynak: fiyat backend'de hesaplanır; sipariş anında verifyClientTotal ile yeniden doğrulanır.

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import type { PriceQuote, PrintOptionsValue } from '../types';

interface UsePriceQuoteResult {
  quote: PriceQuote | null;
  loading: boolean;
  error: string | null;
}

const DEBOUNCE_MS = 350;

export function usePriceQuote(
  productTypeKey: string,
  quantity: number,
  options: PrintOptionsValue,
): UsePriceQuoteResult {
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Son istek kazanır: her isteğe artan id verilir, yalnızca en güncel yanıt state'e yazılır.
  const requestIdRef = useRef(0);

  // Seçim/adet değişimini sabit bir bağımlılığa indir.
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Adet en az 1 olmalı');
      setQuote(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);

    const timer = setTimeout(() => {
      api
        .post<PriceQuote>('/pricing/quote', { productTypeKey, quantity, options })
        .then((res) => {
          if (requestId !== requestIdRef.current) return; // stale
          setQuote(res.data);
          setError(null);
        })
        .catch((err) => {
          if (requestId !== requestIdRef.current) return; // stale
          const msg =
            err?.response?.data?.message ?? 'Fiyat hesaplanamadı';
          setError(msg);
          setQuote(null);
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // optionsKey, options'ın içeriğini temsil eder (stringify).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTypeKey, quantity, optionsKey]);

  return { quote, loading, error };
}
