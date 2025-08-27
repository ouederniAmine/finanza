# 🌍 Localization Guide

This guide covers internationalization (i18n) implementation, translation management, and cultural considerations for the Finanza app.

## 📋 Overview

Finanza supports multiple languages with special focus on Tunisian dialect and cultural context:

- **🇹🇳 Tunisian Dialect** (`tn`) - Primary language
- **🇸🇦 Arabic** (`ar`) - Standard Arabic support
- **🇫🇷 French** (`fr`) - Secondary language in Tunisia
- **🇺🇸 English** (`en`) - International support

## 🏗️ Architecture

### File Structure
```
lib/
├── locales/
│   ├── tn.json          # Tunisian dialect (primary)
│   ├── ar.json          # Standard Arabic
│   ├── fr.json          # French
│   └── en.json          # English
├── i18n.ts              # Internationalization setup
└── types.ts             # Translation type definitions
```

### Implementation
```typescript
// lib/i18n.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

type SupportedLanguage = 'tn' | 'ar' | 'fr' | 'en';
type TranslationKey = keyof typeof import('./locales/tn.json');

interface TranslationFunction {
  (key: string, params?: Record<string, string | number>): string;
}

class I18nManager {
  private currentLanguage: SupportedLanguage = 'tn';
  private translations: Record<string, any> = {};
  private fallbackLanguage: SupportedLanguage = 'en';

  async initialize() {
    // Load saved language preference
    const savedLanguage = await AsyncStorage.getItem('user_language');
    if (savedLanguage && this.isSupported(savedLanguage)) {
      this.currentLanguage = savedLanguage as SupportedLanguage;
    }
    
    // Load translations for current language
    await this.loadTranslations(this.currentLanguage);
  }

  async setLanguage(language: SupportedLanguage) {
    this.currentLanguage = language;
    await AsyncStorage.setItem('user_language', language);
    await this.loadTranslations(language);
  }

  private async loadTranslations(language: SupportedLanguage) {
    try {
      switch (language) {
        case 'tn':
          this.translations = require('./locales/tn.json');
          break;
        case 'ar':
          this.translations = require('./locales/ar.json');
          break;
        case 'fr':
          this.translations = require('./locales/fr.json');
          break;
        case 'en':
          this.translations = require('./locales/en.json');
          break;
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${language}, using fallback`);
      this.translations = require('./locales/en.json');
    }
  }

  translate: TranslationFunction = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value = this.translations;

    // Navigate through nested object
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    if (typeof value !== 'string') {
      console.warn(`Translation missing for key: ${key}`);
      return key; // Return key if translation not found
    }

    // Replace parameters
    if (params) {
      return Object.entries(params).reduce((text, [param, val]) => {
        return text.replace(new RegExp(`{${param}}`, 'g'), String(val));
      }, value);
    }

    return value;
  };

  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  isRTL(): boolean {
    return ['ar'].includes(this.currentLanguage);
  }

  getTextAlign(): 'left' | 'right' | 'center' {
    return this.isRTL() ? 'right' : 'left';
  }

  private isSupported(language: string): boolean {
    return ['tn', 'ar', 'fr', 'en'].includes(language);
  }
}

export const i18n = new I18nManager();
export const t = i18n.translate;
export const getLanguage = () => i18n.getLanguage();
export const setLanguage = (lang: SupportedLanguage) => i18n.setLanguage(lang);
export const isRTL = () => i18n.isRTL();
export const getTextAlign = () => i18n.getTextAlign();
```

## 📝 Translation File Structure

### Hierarchical Organization
```json
{
  "navigation": {
    "home": "الدار",
    "transactions": "المعاملات",
    "budgets": "الميزانيات",
    "savings": "التوفير",
    "profile": "البروفايل"
  },
  "auth": {
    "sign_in_title": "أهلا وسهلا مرة أخرى!",
    "sign_in_subtitle": "ادخل لحسابك باش تكمل رحلتك المالية",
    "email_label": "الإيميل",
    "password_label": "كلمة السر",
    "login_button": "دخول"
  },
  "transactions": {
    "add_new": "زيد معاملة جديدة",
    "categories": {
      "food": "ماكلة",
      "transportation": "مواصلات",
      "entertainment": "فرجة"
    }
  }
}
```

### Dynamic Content Support
```json
{
  "savings": {
    "goal_progress": "وصلت {percentage}% من هدفك",
    "remaining_amount": "باقي {amount} {currency}",
    "time_left": "باقي {days} يوم"
  },
  "budget": {
    "spent_of_budget": "صرفت {spent} من {total}",
    "over_budget": "جزت الميزانية بـ {amount}!"
  }
}
```

## 🇹🇳 Tunisian Dialect Guidelines

### Cultural Context
The Tunisian dialect (`tn`) is the primary language and requires special cultural considerations:

#### Financial Terms
```json
{
  "money_terms": {
    "money": "فلوس",           // Informal: "flousse"
    "cash": "كاش",            // Borrowed from French "cash"
    "salary": "معاش",         // Formal salary
    "income": "دخل",          // General income
    "expense": "مصروف",       // Something spent
    "budget": "ميزانية",      // Budget planning
    "savings": "توفير",       // Money saved
    "debt": "دين"            // Debt/loan
  },
  
  "informal_expressions": {
    "broke": "فايق",          // Completely out of money
    "expensive": "غالي برشة",  // Very expensive
    "cheap": "رخيص",         // Cheap/affordable
    "waste_money": "بذر فلوس", // Wasting money
    "tight_budget": "الوضع صعيب" // Financial situation is difficult
  }
}
```

#### Common Phrases
```json
{
  "common_phrases": {
    "welcome_back": "مرحبا بيك مرة أخرى",
    "good_morning": "صباح الخير",
    "good_evening": "مساك خير",
    "thank_you": "يعطيك الصحة",
    "please": "من فضلك",
    "excuse_me": "سامحني",
    "no_problem": "ماكاين باس",
    "lets_go": "يالله",
    "well_done": "برافو",
    "be_careful": "احذر"
  }
}
```

#### Numbers and Currency
```json
{
  "numbers": {
    "currency_symbol": "دت",
    "currency_full": "دينار تونسي",
    "thousand": "ألف",
    "million": "مليون",
    "decimal_separator": ".",
    "thousands_separator": ","
  },
  
  "time_expressions": {
    "today": "اليوم",
    "yesterday": "أمس",
    "tomorrow": "غدوة",
    "this_week": "هذا الأسبوع",
    "this_month": "هذا الشهر",
    "last_month": "الشهر الماضي"
  }
}
```

## 🔧 Usage Examples

### Basic Translation
```typescript
import { t } from '../lib/i18n';

function WelcomeScreen() {
  return (
    <View>
      <Text>{t('auth.sign_in_title')}</Text>
      <Text>{t('auth.sign_in_subtitle')}</Text>
    </View>
  );
}
```

### Dynamic Content
```typescript
function BudgetOverview({ spent, total, currency }: Props) {
  const spentPercentage = Math.round((spent / total) * 100);
  
  return (
    <Text>
      {t('budget.spent_of_budget', { 
        spent: formatCurrency(spent, currency),
        total: formatCurrency(total, currency)
      })}
    </Text>
  );
}
```

### Conditional Text Based on Language
```typescript
import { getLanguage, t, isRTL } from '../lib/i18n';

function CurrencyDisplay({ amount }: Props) {
  const language = getLanguage();
  const isArabic = isRTL();
  
  const formattedAmount = language === 'tn' 
    ? `${amount} دت` 
    : formatCurrency(amount, 'TND');
    
  return (
    <Text style={{ textAlign: isArabic ? 'right' : 'left' }}>
      {formattedAmount}
    </Text>
  );
}
```

### Language Switcher Component
```typescript
import { setLanguage, getLanguage } from '../lib/i18n';

function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState(getLanguage());
  
  const languages = [
    { code: 'tn', name: 'تونسي', flag: '🇹🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];
  
  const handleLanguageChange = async (langCode: string) => {
    await setLanguage(langCode as SupportedLanguage);
    setCurrentLang(langCode);
    // Trigger app re-render or navigation
  };
  
  return (
    <View style={styles.container}>
      {languages.map(lang => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageOption,
            currentLang === lang.code && styles.selected
          ]}
          onPress={() => handleLanguageChange(lang.code)}
        >
          <Text style={styles.flag}>{lang.flag}</Text>
          <Text style={styles.name}>{lang.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

## 📱 Platform-Specific Considerations

### Text Direction (RTL Support)
```typescript
import { isRTL, getTextAlign } from '../lib/i18n';

function ThemedText({ children, style, ...props }: Props) {
  const textAlign = getTextAlign();
  const isRightToLeft = isRTL();
  
  return (
    <Text
      style={[
        {
          textAlign,
          writingDirection: isRightToLeft ? 'rtl' : 'ltr',
        },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
```

### Input Field Alignment
```typescript
function ThemedTextInput({ style, ...props }: Props) {
  const textAlign = getTextAlign();
  
  return (
    <TextInput
      style={[
        {
          textAlign,
        },
        style
      ]}
      {...props}
    />
  );
}
```

## 🎨 Cultural Design Considerations

### Color Preferences
```typescript
// Tunisian cultural color preferences
const culturalColors = {
  // Traditional Tunisian colors
  tunisianRed: '#CE1126',    // Flag red
  tunisianWhite: '#FFFFFF',   // Flag white
  
  // Financial contexts
  success: '#28A745',         // Green for positive/income
  danger: '#DC3545',          // Red for negative/debt
  warning: '#FFC107',         // Yellow for warnings
  
  // Cultural meanings in Tunisia
  prosperity: '#FFD700',      // Gold represents wealth
  trust: '#007BFF',          // Blue represents trust
  growth: '#28A745',         // Green represents growth
};
```

### Number Formatting
```typescript
function formatCurrency(
  amount: number, 
  currency: string = 'TND',
  language: SupportedLanguage = getLanguage()
): string {
  switch (language) {
    case 'tn':
      // Tunisian format: "150.500 دت"
      return `${amount.toLocaleString('ar-TN')} دت`;
      
    case 'ar':
      // Arabic format: "150.500 د.ت"
      return `${amount.toLocaleString('ar-TN')} د.ت`;
      
    case 'fr':
      // French format: "150 500,00 DT"
      return `${amount.toLocaleString('fr-TN')} DT`;
      
    case 'en':
      // English format: "TND 150,500.00"
      return `TND ${amount.toLocaleString('en-US')}`;
      
    default:
      return `${amount} ${currency}`;
  }
}
```

### Date Formatting
```typescript
function formatDate(
  date: Date,
  language: SupportedLanguage = getLanguage()
): string {
  switch (language) {
    case 'tn':
    case 'ar':
      // Arabic/Tunisian format: "١٥ يناير ٢٠٢٤"
      return date.toLocaleDateString('ar-TN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
    case 'fr':
      // French format: "15 janvier 2024"
      return date.toLocaleDateString('fr-TN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
    case 'en':
      // English format: "January 15, 2024"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
    default:
      return date.toLocaleDateString();
  }
}
```

## ✅ Translation Best Practices

### 1. Consistency
- Use consistent terminology across the app
- Maintain the same tone and formality level
- Create a glossary of financial terms

### 2. Context Awareness
- Consider the user's emotional state (stress about money)
- Use encouraging and supportive language
- Avoid technical jargon

### 3. Cultural Sensitivity
- Respect religious considerations (Islamic finance principles)
- Consider family-oriented financial planning
- Use familiar cultural references

### 4. Technical Implementation
```typescript
// Good: Hierarchical keys
t('budget.alerts.over_limit')

// Avoid: Flat keys
t('budget_alert_over_limit')

// Good: Parameterized strings
t('savings.progress', { amount: 500, goal: 1000 })

// Avoid: String concatenation
t('savings.you_saved') + ' ' + amount + ' ' + t('currency.tnd')
```

## 🔍 Testing Translations

### Translation Validation
```typescript
// Test helper for missing translations
export function validateTranslations() {
  const languages = ['tn', 'ar', 'fr', 'en'];
  const baseTranslations = require('./locales/en.json');
  
  languages.forEach(lang => {
    const translations = require(`./locales/${lang}.json`);
    const missing = findMissingKeys(baseTranslations, translations);
    
    if (missing.length > 0) {
      console.warn(`Missing translations in ${lang}:`, missing);
    }
  });
}

function findMissingKeys(base: any, target: any, prefix = ''): string[] {
  const missing: string[] = [];
  
  Object.keys(base).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (!(key in target)) {
      missing.push(fullKey);
    } else if (typeof base[key] === 'object' && base[key] !== null) {
      missing.push(...findMissingKeys(base[key], target[key], fullKey));
    }
  });
  
  return missing;
}
```

### Manual Testing Checklist
- [ ] All screen titles are translated
- [ ] Error messages appear in correct language
- [ ] Currency formatting is appropriate
- [ ] Date formatting follows cultural norms
- [ ] Text direction (RTL) works for Arabic
- [ ] Long text doesn't break UI layout
- [ ] Cultural expressions feel natural
- [ ] No offensive or inappropriate content

## 📚 Resources

### Translation Tools
- **Google Translate**: For initial drafts (requires human review)
- **DeepL**: Better quality for European languages
- **Native Speakers**: Essential for Tunisian dialect accuracy

### Cultural Resources
- [Tunisian Arabic Dictionary](https://www.arabic-dictionary.net/tunisian)
- [Tunisia Cultural Guide](https://www.commisceo-global.com/resources/country-guides/tunisia-guide)
- [Islamic Finance Principles](https://www.investopedia.com/terms/i/islamic-banking.asp)

### Technical Resources
- [React Native i18n](https://github.com/AlexanderZaytsev/react-native-i18n)
- [Unicode CLDR](https://cldr.unicode.org/) - For number/date formatting
- [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)

---

For questions about translations or to contribute new language support, please refer to our [contribution guidelines](../README.md#contributing) or contact our localization team.
