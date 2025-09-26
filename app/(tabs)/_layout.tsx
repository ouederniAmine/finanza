import { HapticTab } from '@/components/HapticTab';
import { PlusButton } from '@/components/PlusButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { Tabs } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, I18nManager, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabLayout = React.memo(() => {
  const colorScheme = useColorScheme();
  const { language } = useUIStore();
  const [currentRoute, setCurrentRoute] = useState('index');

  useEffect(() => {
    console.log('📱 TABS LAYOUT: Tabs loaded successfully');
  }, []);

  const handleStateChange = useCallback((e: any) => {
    const state = e.data.state;
    if (state) {
      const routeName = state.routes[state.index]?.name;
      if (routeName && routeName !== currentRoute) {
        setCurrentRoute(routeName);
      }
    }
  }, [currentRoute]);

  // Use theme based on current color scheme
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const forceLTR = true; // we are enforcing LTR per request
  const directionStyle = { writingDirection: forceLTR ? 'ltr' : (I18nManager.isRTL ? 'rtl' : 'ltr') } as const;
  if (__DEV__) {
  console.log('[Tabs RTL Debug]', { deviceRTL: I18nManager.isRTL, appliedDirection: directionStyle.writingDirection });
  }

  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const horizontalMargin = 24; // space to edges on small screens
  const maxBarWidth = 346;
  const barWidth = Math.min(maxBarWidth, screenWidth - horizontalMargin);
  // Slightly taller bar so labels don't get clipped
  const barHeight = 82;
  const barBottom = Math.max(28, insets.bottom + 12); // raise bar considering safe area
  const plusSize = 56; // from PlusButton
  const plusVerticalGap = 18; // larger gap so plus clearly au dessus
  const rtlLangs = ['ar', 'he', 'fa', 'ur'];
  const isRtlLang = rtlLangs.includes(language as any);
  const plusSideOffset = 14; // inset from bar edge

  return (
    <View style={{ flex: 1, ...directionStyle }}>
  {/** Plus button side will be determined inside its own render block below. */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: colorScheme === 'dark' ? '#C4B5FD' : theme.muted,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarShowLabel: true,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 2,
            },
            tabBarItemStyle: {
              paddingTop: 6,
              paddingBottom: 4,
            },
            tabBarStyle: {
              position: 'absolute',
              bottom: barBottom,
              width: barWidth,
              height: barHeight,
              left: (screenWidth - barWidth) / 2, // precise centering
              backgroundColor: theme.surfaceAlt,
              borderRadius: 25,
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingHorizontal: 12,
              paddingTop: 8,
              paddingBottom: 8,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.16,
              shadowRadius: 14,
              elevation: 12,
              borderWidth: 1,
              borderColor: 'rgba(124,58,237,0.15)',
              borderTopWidth: 0,
              overflow: 'visible',
            },
        }}
        screenListeners={{
          state: handleStateChange,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('navigation.home', language),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="planning"
          options={{
            title: t('navigation.planning', language),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: t('navigation.calendar', language),
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol 
                size={28} 
                name="calendar" 
                color={color}
                style={{ 
                  opacity: focused ? 1 : 0.8,
                  transform: focused ? [{ scale: 1.05 }] : [{ scale: 1 }] 
                }}
              />
            ),
            tabBarAccessibilityLabel: t('navigation.calendar', language),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: t('navigation.analytics', language),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('navigation.settings', language),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null, // This makes it not show in the tab bar
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            href: null, // This makes it not show in the tab bar
          }}
        />
        <Tabs.Screen
          name="add-transaction"
          options={{
            href: null, // This makes it not show in the tab bar
          }}
        />
      </Tabs>
      
      {/* Plus button - only show on home tab, positioned on the right */}
      {currentRoute === 'index' && (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            bottom: barBottom + barHeight + plusVerticalGap,
            width: barWidth,
            left: (screenWidth - barWidth) / 2,
            zIndex: 10000,
            elevation: 10000,
          }}
        >
          <View style={{ position: 'relative', height: plusSize }}>
            <View style={[{ position: 'absolute', top: 0 }, isRtlLang ? { left: plusSideOffset } : { right: plusSideOffset }]}>
              <PlusButton />
            </View>
          </View>
        </View>
      )}
    </View>
  );
});

export default TabLayout;
