import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import de from '@/locales/de.json';
import it from '@/locales/it.json';
import uz from '@/locales/uz.json';
import id from '@/locales/id.json';
import es from '@/locales/es.json';
import pt from '@/locales/pt.json';
import uk from '@/locales/uk.json';
import vi from '@/locales/vi.json';
import nl from '@/locales/nl.json';
import sv from '@/locales/sv.json';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import { db } from '@/configs/firebaseConfig';
import { doc, onSnapshot, updateDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';

export type LangCode = 'en' | 'ru' | 'de' | 'it' | 'uz' | 'id' | 'es' | 'pt' | 'uk' | 'vi' | 'nl' | 'sv' | string;

export type LangItem = {
  code: LangCode;
  label: string;
  nativeLabel: string;
};

type TranslationValue =
  | string
  | TranslationObject
  | TranslationValue[];

interface TranslationObject {
  [key: string]: TranslationValue;
}

export const LANGS: LangItem[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano' },
  { code: 'uz', label: 'Uzbek', nativeLabel: "Oʻzbekcha" },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'uk', label: 'Ukrainian', nativeLabel: 'Українська' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands' },
  { code: 'sv', label: 'Swedish', nativeLabel: 'Svenska' },
];

const TRANSLATIONS: Record<string, TranslationObject> = {
  en,
  ru,
  de,
  it,
  uz,
  id,
  es,
  pt,
  uk,
  vi,
  nl,
  sv,
};

type I18nContextType = {
  lang: LangCode;
  setLang: (lang: LangCode) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  languages: LangItem[];
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initDataState = useSignal(initData.state);
  const telegramUser = initDataState?.user;
  const uid = telegramUser?.id ? String(telegramUser.id) : null;

  const detectInitial = (): LangCode => {
    const tgLang = (telegramUser?.languageCode as LangCode) ?? 'en';
    return tgLang.startsWith('ru')
      ? 'ru'
      : tgLang.startsWith('de')
      ? 'de'
      : tgLang.startsWith('it')
      ? 'it'
      : tgLang.startsWith('uz')
      ? 'uz'
      : tgLang.startsWith('id')
      ? 'id'
      : tgLang.startsWith('es')
      ? 'es'
      : tgLang.startsWith('pt')
      ? 'pt'
      : tgLang.startsWith('uk')
      ? 'uk'
      : tgLang.startsWith('vi')
      ? 'vi'
      : tgLang.startsWith('nl')
      ? 'nl'
      : tgLang.startsWith('sv')
      ? 'sv'
      : tgLang.startsWith('en')
      ? 'en'
      : tgLang;
  };

  const [lang, setLangState] = useState<LangCode>(detectInitial);

  useEffect(() => {
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(
        userRef,
        (snap) => {
          if (!snap.exists()) return;
          const data = snap.data() as any;
          const remoteLang = (data.languageCode || '').trim() as LangCode;
          if (remoteLang) {
            setLangState(remoteLang);
          }
        },
        (err) => {
          console.error('i18n: user doc snapshot error', err);
        },
      );
    } catch (e) {
      console.error('i18n: failed to subscribe to user doc', e);
    }
    return () => unsub?.();
  }, [uid]);

  useEffect(() => {
    const trySeedLanguage = async () => {
      if (!uid) return;
      const userRef = doc(db, 'users', uid);
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, { languageCode: detectInitial(), updatedAt: serverTimestamp() }, { merge: true });
          return;
        }
        const data = snap.data() as any;
        if (!data.languageCode || data.languageCode === '') {
          const tgLang = (telegramUser?.languageCode as LangCode) ?? 'en';
          const normalized = tgLang.startsWith('ru')
            ? 'ru'
            : tgLang.startsWith('de')
            ? 'de'
            : tgLang.startsWith('it')
            ? 'it'
            : tgLang.startsWith('uz')
            ? 'uz'
            : tgLang.startsWith('id')
            ? 'id'
            : tgLang.startsWith('es')
            ? 'es'
            : tgLang.startsWith('pt')
            ? 'pt'
            : tgLang.startsWith('uk')
            ? 'uk'
            : tgLang.startsWith('vi')
            ? 'vi'
            : tgLang.startsWith('nl')
            ? 'nl'
            : tgLang.startsWith('sv')
            ? 'sv'
            : tgLang.startsWith('en')
            ? 'en'
            : tgLang;
          await updateDoc(userRef, { languageCode: normalized, updatedAt: serverTimestamp() });
        }
      } catch (e) {
        console.warn('i18n: trySeedLanguage failed', e);
      }
    };
    trySeedLanguage();
  }, [uid]);

  const setLang = async (newLang: LangCode) => {
    setLangState(newLang);
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, { languageCode: newLang, updatedAt: serverTimestamp() });
    } catch (err: any) {
      try {
        await setDoc(userRef, { languageCode: newLang, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.error('i18n: failed to persist language change', e);
      }
    }
  };

  const t = (key: string, fallback?: string) => {
    const table = (TRANSLATIONS as any)[lang] ?? (TRANSLATIONS as any)['en'];
    const segments = key.split('.');
    let cur: any = table;
    for (const s of segments) {
      if (!cur) break;
      cur = cur[s];
    }
    if (typeof cur === 'string' && cur.length > 0) return cur;
    const eTable = (TRANSLATIONS as any)['en'];
    cur = key.split('.').reduce((acc: any, s: string) => (acc ? acc[s] : undefined), eTable);
    if (typeof cur === 'string' && cur.length > 0) return cur;
    return fallback ?? key;
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      languages: LANGS,
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return ctx;
};