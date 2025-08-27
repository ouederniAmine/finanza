import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { getTextAlign } from '../lib/i18n';
import { useUIStore } from '../lib/store';

const { width, height } = Dimensions.get('window');
const HAS_SEEN_INTRO_KEY = 'has_seen_intro';

interface IntroSlide {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  illustration: React.ReactNode;
}

export default function IntroScreen() {
  const { language } = useUIStore();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const slides: IntroSlide[] = [
    {
      id: '1',
      title: 'Do money right',
      subtitle: 'Grow and manage your money — all in one place.',
      backgroundColor: '#FFFFFF',
      illustration: <MoneyIllustration />,
    },
    {
      id: '2', 
      title: 'Investing made simple',
      subtitle: 'Trade stocks, ETFs, and crypto, or put your investments on autopilot.',
      backgroundColor: '#FFFFFF',
      illustration: <InvestingIllustration />,
    },
    {
      id: '3',
      title: 'Spending that pays off',
      subtitle: 'Automatically earn stock and crypto rewards for everyday spending.',
      backgroundColor: '#FFFFFF',
      illustration: <SpendingIllustration />,
    },
    {
      id: '4',
      title: 'Trusted by millions of Canadians',
      subtitle: 'We use state-of-the-art encryption to keep your data and money safe.',
      backgroundColor: '#FFFFFF',
      illustration: <SecurityIllustration />,
    },
  ];

  const renderSlide = ({ item, index }: { item: IntroSlide; index: number }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.slideBackground, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.slideContent}>
          <View style={styles.illustrationContainer}>
            {item.illustration}
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { textAlign: getTextAlign(language) }]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { textAlign: getTextAlign(language) }]}>
              {item.subtitle}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handleSignUp = async () => {
    await AsyncStorage.setItem(HAS_SEEN_INTRO_KEY, 'true');
    router.push('/auth/welcome');
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem(HAS_SEEN_INTRO_KEY, 'true');
    router.push('/auth/welcome');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        />
        
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { 
                  backgroundColor: currentIndex === index ? '#1A1A1A' : '#E0E0E0',
                  width: currentIndex === index ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>
              Sign up
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// Illustration Components - Matching the exact design from the image
function MoneyIllustration() {
  return (
    <View style={styles.illustration}>
      {/* Geometric shapes representing money management */}
      <View style={styles.geometricContainer}>
        {/* Green money/bill shape */}
        <View style={[styles.moneyBill, { 
          position: 'absolute', 
          top: 20, 
          left: 30,
          backgroundColor: '#4CAF50',
          transform: [{ rotate: '-15deg' }]
        }]} />
        
        {/* Orange/gradient circle */}
        <View style={[styles.gradientCircle, { 
          position: 'absolute', 
          top: 40, 
          right: 20,
          backgroundColor: '#FF9500',
        }]} />
        
        {/* Blue coin */}
        <View style={[styles.coin, { 
          position: 'absolute', 
          bottom: 60, 
          left: 20,
          backgroundColor: '#2196F3',
        }]} />
        
        {/* Gold coin */}
        <View style={[styles.coin, { 
          position: 'absolute', 
          bottom: 30, 
          right: 40,
          backgroundColor: '#FFD700',
        }]} />
        
        {/* Pink circle */}
        <View style={[styles.smallCircle, { 
          position: 'absolute', 
          top: 100, 
          left: 10,
          backgroundColor: '#E91E63',
        }]} />
        
        {/* Credit card */}
        <View style={[styles.creditCard, { 
          position: 'absolute', 
          top: 80, 
          right: 30,
          backgroundColor: '#F5F5F5',
          transform: [{ rotate: '20deg' }]
        }]} />
      </View>
    </View>
  );
}

function InvestingIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.phoneContainer}>
        {/* Phone mockup */}
        <View style={styles.phone}>
          <View style={styles.phoneScreen}>
            <View style={styles.investmentInterface}>
              <Text style={styles.investmentTitle}>Invest</Text>
              <Text style={styles.investmentAmount}>$32,379.22</Text>
              <Text style={styles.investmentGain}>+2 last 7 days</Text>
              
              {/* Portfolio items */}
              <View style={styles.portfolioItems}>
                <View style={styles.portfolioItem}>
                  <View style={[styles.stockIcon, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.stockSymbol}>AAPL</Text>
                  <Text style={styles.stockPrice}>$142.56</Text>
                </View>
                <View style={styles.portfolioItem}>
                  <View style={[styles.stockIcon, { backgroundColor: '#2196F3' }]} />
                  <Text style={styles.stockSymbol}>MSFT</Text>
                  <Text style={styles.stockPrice}>$284.91</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Floating elements */}
        <View style={[styles.floatingElement, { 
          position: 'absolute', 
          top: 20, 
          left: 20,
          backgroundColor: '#FFD700',
        }]} />
        <View style={[styles.floatingElement, { 
          position: 'absolute', 
          bottom: 40, 
          right: 10,
          backgroundColor: '#FF5722',
        }]} />
      </View>
    </View>
  );
}

function SpendingIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.spendingContainer}>
        {/* Credit cards stack */}
        <View style={styles.cardsStack}>
          <View style={[styles.creditCardLarge, { 
            backgroundColor: '#1A1A1A',
            transform: [{ rotate: '-5deg' }],
            zIndex: 3 
          }]}>
            <View style={styles.cardChip} />
          </View>
          <View style={[styles.creditCardLarge, { 
            backgroundColor: '#FFD700',
            transform: [{ rotate: '2deg' }],
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 2 
          }]} />
        </View>
        
        {/* Rewards/coins */}
        <View style={[styles.rewardCoin, { 
          position: 'absolute', 
          top: 30, 
          right: 20,
          backgroundColor: '#FFD700',
        }]} />
        <View style={[styles.rewardCoin, { 
          position: 'absolute', 
          bottom: 40, 
          left: 30,
          backgroundColor: '#4CAF50',
        }]} />
        
        {/* 3D cube */}
        <View style={[styles.cube3D, { 
          position: 'absolute', 
          top: 80, 
          right: 40,
        }]} />
      </View>
    </View>
  );
}

function SecurityIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.securityContainer}>
        {/* Main security lock */}
        <View style={styles.securityLock}>
          <View style={styles.lockBody}>
            <View style={styles.lockShackle} />
            <View style={styles.lockCenter}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          </View>
        </View>
        
        {/* Shield elements */}
        <View style={[styles.shieldElement, { 
          position: 'absolute', 
          top: 20, 
          left: 20,
          backgroundColor: '#4CAF50',
        }]} />
        <View style={[styles.shieldElement, { 
          position: 'absolute', 
          bottom: 30, 
          right: 25,
          backgroundColor: '#2196F3',
        }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  slideBackground: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  textContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    lineHeight: 26,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDD',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  signUpButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loginButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Illustration styles
  illustration: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Money illustration
  geometricContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  moneyBill: {
    width: 80,
    height: 40,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coin: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  smallCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  creditCard: {
    width: 60,
    height: 38,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Investing illustration
  phoneContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phone: {
    width: 180,
    height: 320,
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 16,
  },
  investmentInterface: {
    flex: 1,
  },
  investmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  investmentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  investmentGain: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 20,
  },
  portfolioItems: {
    gap: 12,
  },
  portfolioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  stockIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  stockSymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
  },
  stockPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  floatingElement: {
    width: 30,
    height: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Spending illustration
  spendingContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsStack: {
    position: 'relative',
    width: 160,
    height: 100,
  },
  creditCardLarge: {
    width: 160,
    height: 100,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardChip: {
    width: 24,
    height: 18,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  rewardCoin: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cube3D: {
    width: 35,
    height: 35,
    backgroundColor: '#9C27B0',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Security illustration
  securityContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityLock: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBody: {
    width: 120,
    height: 140,
    backgroundColor: '#FFD700',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  lockShackle: {
    position: 'absolute',
    top: -25,
    width: 60,
    height: 50,
    borderWidth: 8,
    borderColor: '#FFD700',
    borderRadius: 30,
    borderBottomWidth: 0,
  },
  lockCenter: {
    width: 40,
    height: 40,
    backgroundColor: '#FFA000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 20,
  },
  shieldElement: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
