import { useClerkPrismaSync } from '@/hooks/useClerkPrismaSync';
import React, { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface PrismaProviderProps {
  children: ReactNode;
}

export function PrismaProvider({ children }: PrismaProviderProps) {
  const { isLoading, error, prismaUser } = useClerkPrismaSync();

  // Show loading state during initial sync
  if (isLoading && !prismaUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Syncing your account...</Text>
      </View>
    );
  }

  // Show error state if sync failed
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
          Error syncing account: {error}
        </Text>
        <Text style={{ textAlign: 'center', color: 'gray' }}>
          Please check your internet connection and try again.
        </Text>
      </View>
    );
  }

  // Render children once sync is complete
  return <>{children}</>;
}
