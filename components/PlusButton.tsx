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
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#7F56D9',
            }}
          >
            +
          </Text>
        </View>
      </TouchableOpacity>

      <AddTransactionDrawerPerfect
        visible={showTransactionDrawer}
        onClose={() => setShowTransactionDrawer(false)}
      />
    </>
  );
};
