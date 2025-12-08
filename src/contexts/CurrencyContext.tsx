import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { db } from '@/configs/firebaseConfig';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'RUB'
  | 'INR'
  | 'BRL'
  | 'IDR'
  | 'TRY'
  | 'UAH'
  | 'KZT';

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'RUB', label: 'RUB — Russian Ruble' },
  { code: 'INR', label: 'INR — Indian Rupee' },
  { code: 'BRL', label: 'BRL — Brazilian Real' },
  { code: 'IDR', label: 'IDR — Indonesian Rupiah' },
  { code: 'TRY', label: 'TRY — Turkish Lira' },
  { code: 'UAH', label: 'UAH — Ukrainian Hryvnia' },
  { code: 'KZT', label: 'KZT — Kazakhstani Tenge' },
];

type CurrencyState = {
  selected: CurrencyCode;
  setSelected: (c: CurrencyCode) => Promise<void>;
  rates: Record<string, number>;
  lastUpdated: number | null;
  loading: boolean;
  error: string | null;
  convertUsdToSelected: (usd: number) => number;
  formatFromUsd: (usd: number, digits?: number) => string;
  symbolFor: (c?: CurrencyCode) => string;
};

const CurrencyContext = createContext<CurrencyState | null>(null);

const SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
  INR: '₹',
  BRL: 'R$',
  IDR: 'Rp',
  TRY: '₺',
  UAH: '₴',
  KZT: '₸',
};

const LOCALES: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  RUB: 'ru-RU',
  INR: 'en-IN',
  BRL: 'pt-BR',
  IDR: 'id-ID',
  TRY: 'tr-TR',
  UAH: 'uk-UA',
  KZT: 'kk-KZ',
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

export const CurrencyProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, uid } = useAppData();
  const initial = ((user?.defaultCurrency ?? 'USD') as CurrencyCode) ?? 'USD';
  const [selected, setSelectedLocal] = useState<CurrencyCode>(initial);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const v = (user?.defaultCurrency ?? 'USD') as CurrencyCode;
    if (v !== selected) setSelectedLocal(v);
  }, [user?.defaultCurrency]);

  const fetchRates = async () => {
    setLoading(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const resp = await fetch('https://open.er-api.com/v6/latest/USD', { signal: ctrl.signal });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      if (json?.result !== 'success') throw new Error('Rates fetch failed');
      const fetchedRates = json.rates ?? {};
      fetchedRates.USD = 1;
      setRates(fetchedRates);
      setLastUpdated(Date.now());
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Fetch error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    timerRef.current = window.setInterval(fetchRates, 60_000) as unknown as number;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const setSelected = async (c: CurrencyCode) => {
    setSelectedLocal(c);
    if (!uid) return;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { defaultCurrency: c, updatedAt: serverTimestamp() });
    } catch (e) {
      console.error('Failed to persist currency to Firestore', e);
    }
  };

  const convertUsdToSelected = (usd: number) => {
    const rate = typeof rates[selected] === 'number' && rates[selected] > 0 ? rates[selected] : 1;
    return usd * rate;
  };

  const formatFromUsd = (usd: number, digits = 2) => {
    const value = convertUsdToSelected(usd);
    try {
      return new Intl.NumberFormat(LOCALES[selected], {
        style: 'currency',
        currency: selected,
        maximumFractionDigits: digits,
        minimumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${SYMBOLS[selected]}${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(digits)}`;
    }
  };

  const symbolFor = (c?: CurrencyCode) => SYMBOLS[c ?? selected];

  const value = useMemo(
    () => ({
      selected,
      setSelected,
      rates,
      lastUpdated,
      loading,
      error,
      convertUsdToSelected,
      formatFromUsd,
      symbolFor,
    }),
    [selected, rates, lastUpdated, loading, error]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};