import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface WelcomeSlide {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  illustration: React.ReactNode;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Modern 3D Money Illustration - Ultra Clean
  const MoneyIllustration = () => (
    <View style={styles.illustrationContainer}>
      {/* Stack of bills with gradient effect */}
      <View style={[styles.modernBill, { backgroundColor: '#4ADA64', transform: [{ rotate: '-5deg' }], top: 40, left: 30, zIndex: 3 }]} />
      <View style={[styles.modernBill, { backgroundColor: '#FF6B8A', transform: [{ rotate: '10deg' }], top: 60, left: 50, zIndex: 2 }]} />
      <View style={[styles.modernBill, { backgroundColor: '#4FC3F7', transform: [{ rotate: '-2deg' }], top: 80, left: 40, zIndex: 1 }]} />
      
      {/* Floating coins with 3D effect */}
      <View style={[styles.modernCoin, { backgroundColor: '#FFD54F', top: 20, right: 40, transform: [{ scale: 1.2 }] }]}>
        <View style={styles.coinInner} />
      </View>
      <View style={[styles.modernCoin, { backgroundColor: '#FF8A65', top: 100, right: 60, transform: [{ scale: 0.8 }] }]}>
        <View style={styles.coinInner} />
      </View>
      
      {/* Subtle glow effects */}
      <View style={[styles.glowEffect, { top: 45, left: 45 }]} />
    </View>
  );

  // Ultra Modern Investing Chart Illustration
  const InvestingIllustration = () => (
    <View style={styles.illustrationContainer}>
      {/* Modern phone mockup */}
      <View style={styles.phoneMockup}>
        <View style={styles.phoneScreen}>
          <View style={styles.statusBar} />
          <Text style={styles.phoneTitle}>Invest</Text>
          <Text style={styles.phoneAmount}>$32,379.22</Text>
          <Text style={styles.phoneSubtext}>+12.3% today</Text>
          
          {/* Chart bars in phone */}
          <View style={styles.chartContainer}>
            <View style={[styles.miniBar, { height: 20, backgroundColor: '#4ADA64' }]} />
            <View style={[styles.miniBar, { height: 35, backgroundColor: '#36C5F0' }]} />
            <View style={[styles.miniBar, { height: 28, backgroundColor: '#FF6B8A' }]} />
            <View style={[styles.miniBar, { height: 42, backgroundColor: '#4ADA64' }]} />
          </View>
        </View>
      </View>
      
      {/* Floating geometric shapes */}
      <View style={[styles.floatingShape, { backgroundColor: '#FFD54F', top: 30, right: 20, borderRadius: 8 }]} />
      <View style={[styles.floatingShape, { backgroundColor: '#FF8A65', bottom: 40, left: 20, borderRadius: 50 }]} />
      <View style={[styles.floatingShape, { backgroundColor: '#4FC3F7', top: 80, right: 50, borderRadius: 15, transform: [{ rotate: '45deg' }] }]} />
    </View>
  );

  // Ultra Modern Spending Control Illustration  
  const SpendingIllustration = () => (
    <View style={styles.illustrationContainer}>
      {/* Modern credit cards stack */}
      <View style={[styles.modernCard, { backgroundColor: '#667EEA', transform: [{ rotate: '-8deg' }], top: 50, left: 40, zIndex: 3 }]}>
        <View style={styles.cardChip} />
        <View style={styles.cardStripe} />
      </View>
      <View style={[styles.modernCard, { backgroundColor: '#764BA2', transform: [{ rotate: '5deg' }], top: 70, left: 60, zIndex: 2 }]}>
        <View style={styles.cardChip} />
      </View>
      
      {/* Modern coin with golden effect */}
      <View style={[styles.modernCoin, { backgroundColor: '#FFD54F', top: 30, right: 30, transform: [{ scale: 1.1 }] }]}>
        <View style={styles.coinInner} />
        <Text style={styles.coinSymbol}>$</Text>
      </View>
      
      {/* Lightning effect for "pays off" */}
      <View style={[styles.lightningBolt, { top: 100, right: 50 }]} />
      
      {/* Floating particles */}
      <View style={[styles.particle, { top: 40, left: 20, backgroundColor: '#4ADA64' }]} />
      <View style={[styles.particle, { bottom: 50, right: 20, backgroundColor: '#FF6B8A' }]} />
    </View>
  );

  // Ultra Modern Security Illustration
  const SecurityIllustration = () => (
    <View style={styles.illustrationContainer}>
      {/* Modern 3D lock */}
      <View style={styles.modernLock}>
        <View style={styles.lockBody} />
        <View style={styles.lockShackle} />
        <View style={styles.lockKeyhole} />
      </View>
      
      {/* Security rings with gradient */}
      <View style={[styles.securityRing, { width: 120, height: 120, borderColor: '#4ADA64', opacity: 0.3 }]} />
      <View style={[styles.securityRing, { width: 160, height: 160, borderColor: '#36C5F0', opacity: 0.2 }]} />
      <View style={[styles.securityRing, { width: 200, height: 200, borderColor: '#FF6B8A', opacity: 0.1 }]} />
      
      {/* Canadian flag inspired elements */}
      <View style={[styles.flagElement, { backgroundColor: '#FF6B6B', top: 20, right: 30 }]} />
      <View style={[styles.flagElement, { backgroundColor: '#FF6B6B', bottom: 30, left: 30 }]} />
      
      {/* Subtle glow around lock */}
      <View style={[styles.lockGlow]} />
    </View>
  );

  const welcomeSlides: WelcomeSlide[] = [
    {
      id: '1',
      title: 'Do money right',
      subtitle: 'Grow and manage your money — all in one place.',
      backgroundColor: '#F8F9FA',
      illustration: <MoneyIllustration />,
    },
    {
      id: '2', 
      title: 'Investing\nmade simple',
      subtitle: 'Trade stocks, ETFs and crypto, or put your investments on autopilot.',
      backgroundColor: '#F8F9FA',
      illustration: <InvestingIllustration />,
    },
    {
      id: '3',
      title: 'Spending that\npays off',
      subtitle: 'Automatically earn stock and crypto rewards for everyday spending.',
      backgroundColor: '#F8F9FA',
      illustration: <SpendingIllustration />,
    },
    {
      id: '4',
      title: 'Trusted by millions\nof Canadians',
      subtitle: 'We use state-of-the-art encryption to keep your data and money safe.',
      backgroundColor: '#F8F9FA',
      illustration: <SecurityIllustration />,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Fixed content area with swipeable carousel */}
      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={welcomeSlides}
          renderItem={({ item, index }) => (
            <Animated.View
              style={[
                styles.slideContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.slideContent}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.illustrationWrapper}>
                  {item.illustration}
                </View>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </Animated.View>
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
          }}
          style={styles.carousel}
        />
      </View>

      {/* Fixed bottom section */}
      <View style={styles.fixedBottomContainer}>
        <View style={styles.pagination}>
          {welcomeSlides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.paginationDot,
                i === currentIndex ? styles.paginationDotActive : styles.paginationDotInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.persistentButtonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() => router.push('/auth/sign-up')}
          >
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.signInButton]}
            onPress={() => router.push('/auth/sign-in')}
          >
            <Text style={styles.signInButtonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main layout styles
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flex: 1,
  },
  carousel: {
    flex: 1,
  },
  slideContainer: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingBottom: 200, // Space for fixed bottom section
    paddingHorizontal: 24,
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8F9FA',
    paddingTop: 32,
    paddingBottom: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  illustrationWrapper: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  illustrationContainer: {
    width: 280,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modern Money illustration styles
  modernBill: {
    width: 80,
    height: 50,
    borderRadius: 12,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modernCoin: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  coinSymbol: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.3)',
  },
  glowEffect: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Modern Phone mockup styles
  phoneMockup: {
    width: 140,
    height: 280,
    backgroundColor: '#1a1a1a',
    borderRadius: 28,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
  },
  statusBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 12,
    width: '60%',
  },
  phoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  phoneAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  phoneSubtext: {
    fontSize: 12,
    color: '#4ADA64',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 50,
  },
  miniBar: {
    width: 12,
    borderRadius: 6,
  },
  floatingShape: {
    position: 'absolute',
    width: 24,
    height: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Modern Card styles
  modernCard: {
    width: 90,
    height: 60,
    borderRadius: 16,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    justifyContent: 'space-between',
    padding: 8,
  },
  cardChip: {
    width: 16,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  cardStripe: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 1,
  },
  lightningBolt: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFD54F',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Modern Security Lock styles
  modernLock: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lockBody: {
    width: 50,
    height: 40,
    backgroundColor: '#4ADA64',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  lockShackle: {
    position: 'absolute',
    top: -15,
    width: 35,
    height: 35,
    borderWidth: 5,
    borderColor: '#4ADA64',
    borderRadius: 17.5,
    borderBottomColor: 'transparent',
  },
  lockKeyhole: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 4,
    top: 30,
  },
  securityRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: 'solid',
  },
  flagElement: {
    position: 'absolute',
    width: 20,
    height: 15,
    opacity: 0.6,
  },
  lockGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(74, 218, 100, 0.1)',
  },

  // Content styles - Ultra clean typography
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 34,
    letterSpacing: -0.3,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
    fontWeight: '400',
    marginTop: 24,
  },

  // Navigation and button styles
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 40,
    justifyContent: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#000',
  },
  paginationDotInactive: {
    backgroundColor: '#D1D5DB',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 48,
    height: 56,
    marginHorizontal: 24,
  },
  persistentButtonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#000',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  signInButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
