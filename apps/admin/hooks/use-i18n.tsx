'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { translations, Locale, getNestedTranslation, Translation } from '@/lib/i18n/translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: Translation;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'app_locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const text = getNestedTranslation(translations[locale], key);
    if (params) {
      return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
        return result.replace(`{${paramKey}}`, String(paramValue));
      }, text);
    }
    return text;
  }, [locale]);

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    translations: translations[locale]
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
