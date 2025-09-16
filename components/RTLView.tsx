// components/RTLView.tsx
import { getTextDirection } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface RTLViewProps extends ViewProps {
  children: React.ReactNode;
}

export function RTLView({ children, style, ...props }: RTLViewProps) {
  const { language } = useUIStore();
  const direction = getTextDirection(language);

  return (
    <View 
      style={[
        { writingDirection: direction as any } as any,
        style as any
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

// RTL-aware Text component
import { Text, TextProps } from 'react-native';

interface RTLTextProps extends TextProps {
  children: React.ReactNode;
}

export function RTLText({ children, style, ...props }: RTLTextProps) {
  const { language } = useUIStore();
  const textAlign = getTextDirection(language) === 'rtl' ? 'right' : 'left';

  return (
    <Text 
      style={[
        { textAlign, writingDirection: textAlign === 'right' ? 'rtl' : 'ltr' } as any,
        style as any
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
}
