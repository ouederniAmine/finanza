import { PrismaProvider } from '@/components/PrismaProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useI18nInit } from '@/hooks/useI18n';
import { useUIStore } from '@/lib/store';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { enUS, frFR } from '@clerk/localizations';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';
import '../global.css';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Route tracker component to log current route
function RouteTracker() {
  const pathname = usePathname();
  
  useEffect(() => {
    console.log('🚀 CURRENT ROUTE:', pathname);
  }, [pathname]);
  
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { language } = useUIStore();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize i18n and RTL
  useI18nInit();

  // Create custom Tunisian localization based on French
  const customTunisianLocalization = useMemo(() => ({
    // Basic form elements
    formButtonPrimary: 'متابعة',
    formButtonReset: 'إعادة تعيين',
    dividerText: 'أو',
    footerActionLink__signIn: 'تسجيل الدخول',
    footerActionLink__signUp: 'إنشاء حساب',
    
    // Sign in translations
    signIn: {
      start: {
        title: 'تسجيل الدخول إلى {{applicationName}}',
        subtitle: 'للمتابعة إلى {{applicationName}}',
      },
      emailCode: {
        title: 'تحقق من بريدك الإلكتروني',
        subtitle: 'لمتابعة الوصول إلى {{applicationName}}',
      },
    },
    
    // Sign up translations
    signUp: {
      start: {
        title: 'إنشاء حسابك',
        subtitle: 'للمتابعة إلى {{applicationName}}',
      },
      emailCode: {
        title: 'تحقق من بريدك الإلكتروني',
        subtitle: 'للمتابعة إلى {{applicationName}}',
      },
    },
    
    // User profile translations
    userProfile: {
      navbar: {
        title: 'الملف الشخصي',
        description: 'إدارة معلومات حسابك',
      },
    },
    
    // Common form fields
    formFieldLabel__emailAddress: 'البريد الإلكتروني',
    formFieldLabel__password: 'كلمة المرور',
    formFieldLabel__firstName: 'الاسم الأول',
    formFieldLabel__lastName: 'اسم العائلة',
    
    // OAuth providers
    socialButtonsBlockButton__google: 'متابعة مع Google',
    socialButtonsBlockButton__facebook: 'متابعة مع Facebook',
    
    // Common actions
    signOut: 'تسجيل الخروج',
    'Manage account': 'إدارة الحساب',
  }), []);

  // Get appropriate Clerk localization
  const clerkLocalization = useMemo(() => {
    switch (language) {
      case 'fr':
        return frFR;
      case 'tn':
        return customTunisianLocalization;
      case 'en':
      default:
        return enUS;
    }
  }, [language, customTunisianLocalization]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider 
      tokenCache={tokenCache} 
      publishableKey={publishableKey}
      localization={clerkLocalization}
    >
      <QueryClientProvider client={queryClient}>
        <PrismaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RouteTracker />
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="intro" options={{ headerShown: false, statusBarStyle: 'dark', statusBarBackgroundColor: 'transparent' }} />
              <Stack.Screen name="oauth-native-callback" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="transactions" options={{ headerShown: false }} />
              <Stack.Screen name="analytics" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="dark" />
          </ThemeProvider>
        </PrismaProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
