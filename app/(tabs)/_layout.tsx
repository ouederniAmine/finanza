import { HapticTab } from '@/components/HapticTab';
import { PlusButton } from '@/components/PlusButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { Tabs } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

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

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#687076',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderTopWidth: 0,
              paddingBottom: 20,
              height: 90,
            },
            default: {
              backgroundColor: '#ffffff',
              borderTopWidth: 0,
              paddingBottom: 10,
              height: 80,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 8,
            },
          }),
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
          style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 110 : 100,
            right: 20,
            zIndex: 9999,
            elevation: 9999,
          }}
        >
          <PlusButton />
        </View>
      )}
    </View>
  );
});

export default TabLayout;
