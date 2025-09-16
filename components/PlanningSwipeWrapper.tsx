import React, { ReactNode, useRef } from 'react';
import { PanResponder, GestureResponderEvent, PanResponderGestureState, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

interface Props { children: ReactNode }

const order = ['/planning/budgets','/planning/debts','/planning/savings'];

export const PlanningSwipeWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const startX = useRef(0);
  const isSwiping = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 8,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        startX.current = e.nativeEvent.pageX;
        isSwiping.current = false;
      },
      onPanResponderMove: (_, gesture: PanResponderGestureState) => {
        if (!isSwiping.current && Math.abs(gesture.dx) > 25) {
          isSwiping.current = true;
        }
      },
      onPanResponderRelease: (_, gesture: PanResponderGestureState) => {
        if (!isSwiping.current) return;
        const threshold = 60; // min distance
        if (gesture.dx < -threshold) {
          // swipe left -> next
          navigateRelative(1);
        } else if (gesture.dx > threshold) {
          // swipe right -> previous
            navigateRelative(-1);
        }
      }
    })
  ).current;

  const navigateRelative = (delta: number) => {
    const currentIndex = order.findIndex(p => pathname?.startsWith(p));
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + delta;
    if (nextIndex < 0 || nextIndex >= order.length) return;
    router.replace(order[nextIndex] as any);
  };

  return <View {...panResponder.panHandlers} style={{ flex: 1, backgroundColor: '#EAD9C9' }}>{children}</View>;
};

export default PlanningSwipeWrapper;
