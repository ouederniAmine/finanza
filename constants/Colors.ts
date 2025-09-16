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
    // Added brand palette
    primary: '#5D4037', // rich brown
    primaryContrast: '#FEFBF6',
    surface: '#FEFBF6',
    surfaceAlt: '#F5EBE0',
    accent: '#F0A07B',
    danger: '#D32F2F',
    warning: '#FFCC80',
    success: '#10B981',
    info: '#667EEA',
    border: '#E5E7EB',
    muted: '#A1887F',
    subtle: '#F5F5F5',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Approximate dark counterparts
    primary: '#8D6E63',
    primaryContrast: '#1C1C1C',
    surface: '#1F1F1F',
    surfaceAlt: '#242424',
    accent: '#F0A07B',
    danger: '#EF5350',
    warning: '#FFA726',
    success: '#34D399',
    info: '#7B9CFF',
    border: '#2E2E2E',
    muted: '#BCAAA4',
    subtle: '#2A2A2A',
  },
};
