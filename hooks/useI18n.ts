// hooks/useI18n.ts
import { setRTLDirection } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { useEffect } from 'react';

export function useI18nInit() {
  const { language } = useUIStore();

  useEffect(() => {
    // Set RTL direction when app loads or language changes
    setRTLDirection(language);
  }, [language]);

  return { language };
}

export function useRTL() {
  const { language, rtl } = useUIStore();
  return rtl;
}
