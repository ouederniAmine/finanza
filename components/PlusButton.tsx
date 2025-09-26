import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useCallback, useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AddTransactionDrawerPerfect from './AddTransactionDrawerPerfect';

interface PlusButtonProps {
  onPress?: () => void;
}

export const PlusButton = ({ onPress }: PlusButtonProps) => {
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      setShowTransactionDrawer(true);
    }
  }, [onPress]);

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        style={{ justifyContent: 'center', alignItems: 'center' }}
        activeOpacity={0.8}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 20,
            backgroundColor: theme.primary,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 18,
            elevation: 12,
            borderWidth: 1,
            borderColor: 'rgba(248,245,255,0.3)',
          }}
        >
          <Text style={{ fontSize: 30, fontWeight: '800', color: theme.primaryContrast, marginTop: -2 }}>+</Text>
        </View>
      </TouchableOpacity>

      <AddTransactionDrawerPerfect
        visible={showTransactionDrawer}
        onClose={() => setShowTransactionDrawer(false)}
      />
    </>
  );
};
