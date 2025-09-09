import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function PlanningLayout() {
  const colorScheme = useColorScheme();
  const { language } = useUIStore();

  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#687076',
        tabBarIndicatorStyle: {
          backgroundColor: '#10B981',
          height: 3,
        },
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarPressColor: 'rgba(16, 185, 129, 0.1)',
      }}
    >
      <MaterialTopTabs.Screen
        name="budgets"
        options={{
          title: t('navigation.budgets', language),
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={20} name="chart.pie.fill" color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="debts"
        options={{
          title: t('navigation.debts', language),
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={20} name="creditcard.fill" color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="savings"
        options={{
          title: t('navigation.savings', language),
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={20} name="target" color={color} />
          ),
        }}
      />
    </MaterialTopTabs>
  );
}
