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
        style={{ justifyContent: 'center', alignItems: 'center' }}
        activeOpacity={0.8}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 20,
            backgroundColor: '#754E51',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 30, fontWeight: '700', color: '#FFFFFF', marginTop: -2 }}>+</Text>
        </View>
      </TouchableOpacity>

      <AddTransactionDrawerPerfect
        visible={showTransactionDrawer}
        onClose={() => setShowTransactionDrawer(false)}
      />
    </>
  );
};
