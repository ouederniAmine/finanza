// components/LanguageSelector.tsx
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SupportedLanguage, getLanguageDisplayName, getTextAlign, t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface LanguageSelectorProps {
  showTitle?: boolean;
  horizontal?: boolean;
}

export function LanguageSelector({ showTitle = true, horizontal = false }: LanguageSelectorProps) {
  const { language, setLanguage } = useUIStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const languages: { code: SupportedLanguage; flag: string }[] = [
    { code: 'tn', flag: '🇹🇳' },
    { code: 'en', flag: '🇺🇸' },
    { code: 'fr', flag: '🇫🇷' },
  ];

  const textAlign = getTextAlign(language);

  return (
    <ThemedView style={styles.container}>
      {showTitle && (
        <ThemedText style={[styles.title, { textAlign }]}>
          {t('settings.language', language)}
        </ThemedText>
      )}
      
      <View style={[styles.languageGrid, horizontal && styles.horizontalGrid]}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageOption,
              language === lang.code && { 
                backgroundColor: colors.tint,
                borderColor: colors.tint,
              },
              horizontal && styles.horizontalOption,
            ]}
            onPress={() => setLanguage(lang.code)}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text
              style={[
                styles.languageText,
                language === lang.code && { color: 'white' },
                { textAlign }
              ]}
            >
              {getLanguageDisplayName(lang.code, language)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  languageGrid: {
    gap: 12,
  },
  horizontalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  horizontalOption: {
    flex: 1,
    marginHorizontal: 4,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});
