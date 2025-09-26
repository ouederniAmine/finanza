/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Purple theme palette
    primary: '#7C3AED', // rich purple
    primaryContrast: '#F8F5FF',
    surface: '#F8F5FF',
    surfaceAlt: '#EDE9FE',
    accent: '#A855F7',
    danger: '#DC2626',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
    border: '#E5E7EB',
    muted: '#8B5CF6',
    subtle: '#F3F0FF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Purple dark theme counterparts
    primary: '#9333EA',
    primaryContrast: '#1A0B2E',
    surface: '#1F1A2E',
    surfaceAlt: '#2A1D47',
    accent: '#A855F7',
    danger: '#EF4444',
    warning: '#F59E0B',
    success: '#34D399',
    info: '#60A5FA',
    border: '#2E2E2E',
    muted: '#8B5CF6',
    subtle: '#2A1D47',
  },
};
