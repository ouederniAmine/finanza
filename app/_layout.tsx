import { PrismaProvider } from '@/components/PrismaProvider';
import { AuthProvider } from '@/components/AuthProvider';
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
import { useEffect, useMemo, useState, useRef } from 'react';
import 'react-native-reanimated';
import { View, Text } from 'react-native';
import '../global.css';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const bypassAuth = process.env.EXPO_PUBLIC_BYPASS_CLERK === '1';
const clerkTimeoutMs = Number(process.env.EXPO_PUBLIC_CLERK_TIMEOUT_MS || 8000);
if (!publishableKey && !bypassAuth) {
  throw new Error('Missing Publishable Key. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY or EXPO_PUBLIC_BYPASS_CLERK=1');
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

interface OfflineBannerProps {
  reason: string;
  onRetry?: () => void;
  onContinueOffline?: () => void;
  attempt?: number;
  nextDelayMs?: number | null;
}

function OfflineBanner({ reason, onRetry, onContinueOffline, attempt, nextDelayMs }: OfflineBannerProps) {
  return (
    <View style={{ position: 'absolute', top: 44, left: 0, right: 0, alignItems: 'center', zIndex: 100 }}>
      <View style={{ backgroundColor: '#754E51', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 28, flexDirection: 'row', gap: 16, alignItems: 'center', maxWidth: '94%' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
          Auth offline: {reason}
          {typeof attempt === 'number' && (
            <> (try {attempt}{nextDelayMs ? ` – retry in ${Math.round(nextDelayMs/1000)}s` : ''})</>
          )}
        </Text>
        {onRetry && (
          <Text onPress={onRetry} style={{ color: '#ECE0D6', fontSize: 12, textDecorationLine: 'underline' }}>Retry</Text>
        )}
        {onContinueOffline && (
          <Text onPress={onContinueOffline} style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>Continue Offline</Text>
        )}
      </View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { language } = useUIStore();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

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

  const content = (
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
  );

  if (bypassAuth) {
    console.warn('[Auth] BYPASS mode enabled – running without Clerk.');
    return content;
  }

  const [timedOut, setTimedOut] = useState(false);
  const [retryToken, setRetryToken] = useState(0); // re-mount key for ClerkProvider
  const [clerkReady, setClerkReady] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [nextDelayMs, setNextDelayMs] = useState<number | null>(null);

  // Backoff config
  const MAX_AUTO_ATTEMPTS = 5;
  const baseDelay = 2000; // 2s initial
  const backoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Primary timeout watcher for first load / retried loads
  useEffect(() => {
    if (offlineMode) return; // skip if we are offline intentionally
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled && !clerkReady) {
        setTimedOut(true);
        console.warn('[Clerk] Timeout after', clerkTimeoutMs, 'ms – showing offline banner');
      }
    }, clerkTimeoutMs);
    return () => { cancelled = true; clearTimeout(t); };
  }, [retryToken, clerkReady, clerkTimeoutMs, offlineMode]);

  // Automatic backoff retries (exponential) until MAX_AUTO_ATTEMPTS then suggest offline mode
  useEffect(() => {
    if (offlineMode || clerkReady) return;
    if (!timedOut) return; // only start after first timeout
    if (attempt >= MAX_AUTO_ATTEMPTS) {
      setNextDelayMs(null);
      return; // stop auto retries
    }
    const delay = Math.min(baseDelay * Math.pow(2, attempt), 30000);
    setNextDelayMs(delay);
    backoffTimerRef.current && clearTimeout(backoffTimerRef.current);
    backoffTimerRef.current = setTimeout(() => {
      setAttempt(a => a + 1);
      setRetryToken(x => x + 1); // remount ClerkProvider
      setTimedOut(false);
      console.log(`[Clerk Retry] Auto attempt #${attempt + 1} after ${delay}ms`);
    }, delay);
    return () => { if (backoffTimerRef.current) clearTimeout(backoffTimerRef.current); };
  }, [attempt, timedOut, offlineMode, clerkReady]);

  // Lazy watcher component to detect Clerk coming online after timeout
  function ClerkLoadWatcher() {
    try {
      // Importing inside component to avoid issues if Clerk not initialized
      const { useAuth } = require('@clerk/clerk-expo');
      const { isLoaded } = useAuth();
      useEffect(() => {
        if (isLoaded) {
          setClerkReady(true);
          setTimedOut(false); // hide banner
          setOfflineMode(false);
          setAttempt(0);
        }
      }, [isLoaded]);
    } catch (e) {
      // ignore
    }
    return null;
  }

  const handleRetry = () => {
    setTimedOut(false);
    setAttempt(a => a + 1);
    setRetryToken(x => x + 1);
  };

  const handleContinueOffline = () => {
    console.warn('[Auth] Proceeding in OFFLINE MODE – Clerk disabled for this session');
    setOfflineMode(true);
    setTimedOut(false);
  };

  // Content wrapper used both online and offline
  const appShell = <AuthProvider>{content}</AuthProvider>;

  // OFFLINE MODE: skip Clerk entirely
  if (offlineMode) {
    return (
      <>
        {appShell}
        {(!clerkReady) && (
          <OfflineBanner
            reason={attempt >= MAX_AUTO_ATTEMPTS ? 'offline mode (manual)' : 'offline mode'}
          />
        )}
      </>
    );
  }

  return (
    <>
      <ClerkProvider
        key={retryToken}
        tokenCache={tokenCache}
        publishableKey={publishableKey!}
        localization={clerkLocalization}
      >
        <ClerkLoadWatcher />
        {appShell}
      </ClerkProvider>
      {timedOut && !clerkReady && (
        <OfflineBanner
          reason="timeout"
          onRetry={attempt < MAX_AUTO_ATTEMPTS ? handleRetry : undefined}
          onContinueOffline={handleContinueOffline}
          attempt={attempt + 1} // human-readable attempt count
          nextDelayMs={attempt < MAX_AUTO_ATTEMPTS ? nextDelayMs : null}
        />
      )}
    </>
  );
}
