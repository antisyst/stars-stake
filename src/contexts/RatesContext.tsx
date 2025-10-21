import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type RatesState = {
  tonUsd: number;  
  lastUpdated: number;
  loading: boolean;
  error: string | null;
};

const RatesContext = createContext<RatesState>({
  tonUsd: 0,
  lastUpdated: 0,
  loading: true,
  error: null,
});

export const useRates = () => useContext(RatesContext);

export const RatesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [tonUsd, setTonUsd] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(0);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchOnce = async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const resp = await fetch('https://tonapi.io/v2/rates?tokens=ton&currencies=usd', { signal: ctrl.signal });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      const price = Number(json?.rates?.TON?.prices?.USD ?? 0);
      if (!Number.isFinite(price) || price <= 0) throw new Error('Invalid price');
      setTonUsd(price);
      setLastUpdated(Date.now());
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'fetch error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnce();
    timerRef.current = window.setInterval(fetchOnce, 20000) as unknown as number;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const value = useMemo(() => ({ tonUsd, lastUpdated, loading, error }), [tonUsd, lastUpdated, loading, error]);

  return <RatesContext.Provider value={value}>{children}</RatesContext.Provider>;
};