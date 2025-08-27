// lib/i18n.ts
import { I18nManager } from 'react-native';

// Import translation files
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import tnTranslations from './locales/tn.json';

export type SupportedLanguage = 'en' | 'fr' | 'tn';

export const translations = {
  en: enTranslations,
  fr: frTranslations,
  tn: tnTranslations,
};

// RTL Languages
const RTL_LANGUAGES = ['tn'];

export const isRTL = (language: SupportedLanguage): boolean => {
  return RTL_LANGUAGES.includes(language);
};

export const setRTLDirection = (language: SupportedLanguage): void => {
  const shouldBeRTL = isRTL(language);
  
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    
    // Note: In production, you might want to reload the app
    // to ensure RTL changes take effect properly
    if (__DEV__) {
      console.log(`RTL direction set to: ${shouldBeRTL ? 'RTL' : 'LTR'} for language: ${language}`);
    }
  }
};

export const t = (key: string, language: SupportedLanguage = 'en'): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  // Fallback to English if translation not found
  if (value === undefined && language !== 'en') {
    let fallbackValue: any = translations.en;
    for (const k of keys) {
      fallbackValue = fallbackValue?.[k];
      if (fallbackValue === undefined) break;
    }
    value = fallbackValue;
  }
  
  return value || key;
};

export const formatCurrency = (
  amount: number, 
  currency: 'TND' | 'USD' | 'EUR', 
  language: SupportedLanguage = 'en'
): string => {
  // Always format as TND with Tunisian formatting
  // Check if amount has decimal places
  const hasDecimals = amount % 1 !== 0;
  
  if (hasDecimals) {
    // Format with comma as decimal separator and space as thousand separator
    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 1000); // Up to 3 decimal places for TND
    
    // Format integer part with spaces as thousand separators
    const formattedInteger = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    // Remove trailing zeros from decimal part
    let decimalString = decimalPart.toString();
    while (decimalString.length > 1 && decimalString.endsWith('0')) {
      decimalString = decimalString.slice(0, -1);
    }
    
    return `${formattedInteger},${decimalString} DT`;
  } else {
    // Format whole numbers with spaces as thousand separators
    const formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formattedAmount} DT`;
  }
};

export const getCurrency = (language: SupportedLanguage = 'en'): 'TND' | 'USD' | 'EUR' => {
  // Always return TND as requested by user
  return 'TND';
};

export const formatDate = (
  date: string | Date, 
  language: SupportedLanguage = 'en'
): string => {
  const d = new Date(date);
  
  const locales = {
    en: 'en-US',
    fr: 'fr-FR',
    tn: 'ar-TN',
  };
  
  return d.toLocaleDateString(locales[language], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatNumber = (
  number: number, 
  language: SupportedLanguage = 'en'
): string => {
  const locales = {
    en: 'en-US',
    fr: 'fr-FR',
    tn: 'ar-TN',
  };
  
  return new Intl.NumberFormat(locales[language]).format(number);
};

// Language display names
export const getLanguageDisplayName = (language: SupportedLanguage, currentLanguage: SupportedLanguage = 'en'): string => {
  return t(`languages.${language}`, currentLanguage);
};

// Get text direction for styling
export const getTextDirection = (language: SupportedLanguage): 'ltr' | 'rtl' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

// Get text alignment for the language
export const getTextAlign = (language: SupportedLanguage): 'left' | 'right' | 'center' => {
  return isRTL(language) ? 'right' : 'left';
};
