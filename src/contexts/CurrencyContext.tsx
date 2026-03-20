import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { db } from '@/configs/firebaseConfig';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'RUB'
  | 'TRY'
  | 'UAH'
  | 'KZT'
  | 'UZS'
  | 'GBP'
  | 'CNY'
  | 'INR'
  | 'JPY'
  | 'KRW'
  | 'BRL'
  | 'IDR'
  | 'SAR'
  | 'AED'
  | 'THB'
  | 'PHP'
  | 'EGP'
  | 'NGN'
  | 'PLN'
  | 'CZK'
  | 'HUF'
  | 'RON'
  | 'CHF'
  | 'CAD'
  | 'HKD'
  | 'GEL'
  | 'ARS'
  | 'BDT';

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'RUB', label: 'RUB — Russian Ruble' },
  { code: 'TRY', label: 'TRY — Turkish Lira' },
  { code: 'UAH', label: 'UAH — Ukrainian Hryvnia' },
  { code: 'KZT', label: 'KZT — Kazakhstani Tenge' },
  { code: 'UZS', label: 'UZS — Uzbekistani Som' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'CNY', label: 'CNY — Chinese Yuan' },
  { code: 'INR', label: 'INR — Indian Rupee' },
  { code: 'JPY', label: 'JPY — Japanese Yen' },
  { code: 'KRW', label: 'KRW — South Korean Won' },
  { code: 'BRL', label: 'BRL — Brazilian Real' },
  { code: 'IDR', label: 'IDR — Indonesian Rupiah' },
  { code: 'SAR', label: 'SAR — Saudi Riyal' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'THB', label: 'THB — Thai Baht' },
  { code: 'PHP', label: 'PHP — Philippine Peso' },
  { code: 'EGP', label: 'EGP — Egyptian Pound' },
  { code: 'NGN', label: 'NGN — Nigerian Naira' },
  { code: 'PLN', label: 'PLN — Polish Złoty' },
  { code: 'CZK', label: 'CZK — Czech Koruna' },
  { code: 'HUF', label: 'HUF — Hungarian Forint' },
  { code: 'RON', label: 'RON — Romanian Leu' },
  { code: 'CHF', label: 'CHF — Swiss Franc' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'HKD', label: 'HKD — Hong Kong Dollar' },
  { code: 'GEL', label: 'GEL — Georgian Lari' },
  { code: 'ARS', label: 'ARS — Argentine Peso' },
  { code: 'BDT', label: 'BDT — Bangladeshi Taka' },
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
  TRY: '₺',
  UAH: '₴',
  KZT: '₸',
  UZS: "soʻm",
  GBP: '£',
  CNY: '¥',
  INR: '₹',
  JPY: '¥',
  KRW: '₩',
  BRL: 'R$',
  IDR: 'Rp',
  SAR: '﷼',
  AED: 'د.إ',
  THB: '฿',
  PHP: '₱',
  EGP: 'E£',
  NGN: '₦',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  CHF: 'CHF',
  CAD: 'CA$',
  HKD: 'HK$',
  GEL: '₾',
  ARS: '$',
  BDT: '৳',
};

const LOCALES: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  RUB: 'ru-RU',
  TRY: 'tr-TR',
  UAH: 'uk-UA',
  KZT: 'kk-KZ',
  UZS: 'uz-UZ',
  GBP: 'en-GB',
  CNY: 'zh-CN',
  INR: 'en-IN',
  JPY: 'ja-JP',
  KRW: 'ko-KR',
  BRL: 'pt-BR',
  IDR: 'id-ID',
  SAR: 'ar-SA',
  AED: 'ar-AE',
  THB: 'th-TH',
  PHP: 'fil-PH',
  EGP: 'ar-EG',
  NGN: 'en-NG',
  PLN: 'pl-PL',
  CZK: 'cs-CZ',
  HUF: 'hu-HU',
  RON: 'ro-RO',
  CHF: 'de-CH',
  CAD: 'en-CA',
  HKD: 'zh-HK',
  GEL: 'ka-GE',
  ARS: 'es-AR',
  BDT: 'bn-BD',
};

const ZERO_DECIMAL: Set<CurrencyCode> = new Set(['JPY', 'KRW', 'IDR', 'HUF', 'UZS']);

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
    const effectiveDigits = ZERO_DECIMAL.has(selected) ? 0 : digits;
    try {
      return new Intl.NumberFormat(LOCALES[selected], {
        style: 'currency',
        currency: selected,
        maximumFractionDigits: effectiveDigits,
        minimumFractionDigits: selected === 'USD' ? 2 : 0,
      }).format(value);
    } catch {
      return `${SYMBOLS[selected]}${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(effectiveDigits)}`;
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