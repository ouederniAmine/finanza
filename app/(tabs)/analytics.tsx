import { Colors } from '@/constants/Colors';
import { t } from '@/lib/i18n';
import { AnalyticsData, AnalyticsService } from '@/lib/services/analytics.service';
import { useUIStore } from '@/lib/store';
import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, I18nManager, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { user } = useUser();
  const { language } = useUIStore();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [mode, setMode] = useState<'expenses' | 'income'>('expenses');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRTL = useMemo(() => ['tn', 'ar', 'he', 'fa', 'ur'].includes(language as any) || I18nManager.isRTL, [language]);
  // Keep selection state hook BEFORE any conditional returns to preserve hook order across renders
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Palettes (non-hook) used in effects and render
  const expensePalette = ['#F43F5E', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#A855F7'];
  const incomePalette = ['#22C55E', '#06B6D4', '#8B5CF6', '#A855F7', '#3B82F6'];

  useEffect(() => {
    if (user?.id) {
      loadAnalyticsData();
    }
  }, [user?.id, language]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.getAnalyticsData(user!.id, language);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
      // Set fallback data
      setAnalyticsData({
        spendingByCategory: [
          { category: 'Food', amount: 450, percentage: 36, icon: '🍽️', color: '#EF4444' },
          { category: 'Transport', amount: 300, percentage: 24, icon: '🚗', color: '#F59E0B' },
          { category: 'Coffee', amount: 200, percentage: 16, icon: '☕', color: '#8B5CF6' },
        ],
        monthlyTrends: [
          { month: 'Jan', income: 2500, expenses: 1800, savings: 700 },
          { month: 'Feb', income: 2500, expenses: 1900, savings: 600 },
          { month: 'Mar', income: 2700, expenses: 1850, savings: 850 },
        ],
        totalExpenses: 950,
        currentMonth: { month: 'Mar', income: 2700, expenses: 1850, savings: 850 }
      });
    } finally {
      setLoading(false);
    }
  };
  
  const theme = Colors.light; // could switch on color scheme
  const formatCurrency = (amount: number) => `${amount.toLocaleString()} TND`;

  // Update selectedIndex when mode or data changes (hook placed before early returns)
  useEffect(() => {
    if (!analyticsData) return;
    const expenseCats = (analyticsData.spendingByCategory || []).map((c, i) => ({
      category: c.category,
      amount: c.amount,
      percentage: c.percentage,
      icon: c.icon,
      color: c.color || expensePalette[i % expensePalette.length],
    }));
    const incomeTotal = analyticsData.currentMonth?.income || 0;
    const incomesFallback = [
      { category: t('categories.salary', language) || 'Salary', amount: incomeTotal * 0.6, icon: '💼', color: incomePalette[0] },
      { category: t('categories.freelance', language) || 'Freelance', amount: incomeTotal * 0.25, icon: '🧑‍💻', color: incomePalette[1] },
      { category: t('categories.gift', language) || 'Gift', amount: incomeTotal * 0.15, icon: '🎁', color: incomePalette[2] },
    ];
    const incomesCats = incomesFallback.map((c, i) => ({ ...c, color: c.color || incomePalette[i % incomePalette.length] }));
    const cats = mode === 'expenses' ? expenseCats : incomesCats;
    if (!cats.length) { setSelectedIndex(0); return; }
    const maxIdx = cats.reduce((best, v, i, arr) => (v.amount > arr[best].amount ? i : best), 0);
    setSelectedIndex(maxIdx);
  }, [mode, analyticsData, language]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#7F56D9" />
        <Text className="text-gray-600 mt-4">Loading analytics...</Text>
      </SafeAreaView>
    );
  }

  if (!analyticsData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">No analytics data available</Text>
      </SafeAreaView>
    );
  }

  const { spendingByCategory, monthlyTrends, totalExpenses, currentMonth } = analyticsData;

  // Build data sets for expenses and income
  type Cat = { category: string; amount: number; percentage?: number; color?: string; icon?: string };

  const expensesCats: Cat[] = (spendingByCategory || []).map((c, i) => ({
    category: c.category,
    amount: c.amount,
    percentage: c.percentage,
    icon: c.icon,
    color: c.color || expensePalette[i % expensePalette.length],
  }));

  const incomeTotal = currentMonth?.income || 0;
  const incomesFallback: Cat[] = [
    { category: t('categories.salary', language) || 'Salary', amount: incomeTotal * 0.6, icon: '💼', color: incomePalette[0] },
    { category: t('categories.freelance', language) || 'Freelance', amount: incomeTotal * 0.25, icon: '🧑‍💻', color: incomePalette[1] },
    { category: t('categories.gift', language) || 'Gift', amount: incomeTotal * 0.15, icon: '🎁', color: incomePalette[2] },
  ];
  const incomesCats: Cat[] = incomesFallback.map((c, i) => ({ ...c, color: c.color || incomePalette[i % incomePalette.length] }));

  const categories: Cat[] = mode === 'expenses' ? expensesCats : incomesCats;
  const totalAmount = categories.reduce((s, c) => s + (c.amount || 0), 0) || 1;
  const withPct = categories.map((c) => ({ ...c, percentage: c.percentage ?? Math.round((c.amount / totalAmount) * 1000) / 10 }));
  // selection state now handled by the effect above
  
  const periods = [
    { id: 'weekly', label: 'أسبوعي' },
    { id: 'monthly', label: 'شهري' },
    { id: 'yearly', label: 'سنوي' },
  ];

  const insights = [
    {
      type: 'warning',
      icon: '⚠️',
      title: 'إنفاق عالي على القهوة',
      description: 'صرفت 40% زيادة على القهوة مقارنة بالشهر الماضي',
      action: 'حط حد أقصى',
    },
    {
      type: 'success',
      icon: '📈',
      title: 'تحسن في التوفير',
      description: 'الإدخار تاعك زاد 15% هالشهر! أحسنت!',
      action: 'شوف الأهداف',
    },
    {
      type: 'info',
      icon: '🔄',
      title: 'فاتورة ثابتة',
      description: 'فاتورة الإنترنت نفس المبلغ كل شهر، تحب نعملها تلقائية؟',
      action: 'اعمل تلقائي',
    },
  ];

  const getInsightColors = (type: string) => {
    switch (type) {
      case 'warning': return { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' };
      case 'success': return { bg: '#D1FAE5', border: '#10B981', text: '#065F46' };
      case 'info': return { bg: '#DBEAFE', border: '#3B82F6', text: '#1E3A8A' };
      default: return { bg: '#F3F4F6', border: '#6B7280', text: '#374151' };
    }
  };

  // Donut math helpers
  const toRadians = (deg: number) => (Math.PI / 180) * deg;
  // Describe a ring segment between outer radius R and inner radius r
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => ({
    x: cx + r * Math.cos(toRadians(angleDeg)),
    y: cy + r * Math.sin(toRadians(angleDeg)),
  });
  const describeRingSegment = (
    cx: number,
    cy: number,
    rOuter: number,
    rInner: number,
    startAngle: number,
    endAngle: number
  ) => {
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
    const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
    const p3 = polarToCartesian(cx, cy, rInner, endAngle);
    const p4 = polarToCartesian(cx, cy, rInner, startAngle);
    // Outer arc (sweep=1), line to inner, inner arc (sweep=0), close
    return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y} Z`;
  };

  const renderPieChart = () => {
    const W = Math.min(screenWidth - 40, 340);
    const size = Math.max(240, W);
    const radius = size / 2 - 8;
    const innerRadius = radius * 0.58;
    const cx = size / 2;
    const cy = size / 2;

    const gap = 3; // degrees between slices for visual separation
    let startAngle = -90; // start at top
    const paths = withPct.map((c, i) => {
      const fullSweep = (c.amount / totalAmount) * 360;
      const sweep = Math.max(0, fullSweep - gap);
      const segStart = startAngle + gap / 2;
      const segEnd = segStart + sweep;
      const d = describeRingSegment(cx, cy, radius, innerRadius, segStart, segEnd);
      startAngle += fullSweep;
      const isSelected = i === selectedIndex;
      const offsetMag = isSelected ? 6 : 0;
      const mid = (segStart + segEnd) / 2;
      const offsetX = Math.cos(toRadians(mid)) * offsetMag;
      const offsetY = Math.sin(toRadians(mid)) * offsetMag;
      const scale = isSelected ? 1.05 : 1;
      return { d, color: c.color!, i, offsetX, offsetY, scale };
    });

    return (
      <View style={{ alignItems: 'center', marginBottom: 20, paddingVertical: 8 }}>
        <View style={{ 
          width: size, 
          height: size,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3
        }}>
          <Svg width={size} height={size}>
            <G>
              {paths.map((p) => (
                <G key={p.i} transform={`translate(${p.offsetX}, ${p.offsetY}) scale(${p.scale})`}>
                  <Path 
                    d={p.d} 
                    fill={p.color} 
                    opacity={p.i === selectedIndex ? 1 : 0.85} 
                    onPress={() => setSelectedIndex(p.i)} 
                  />
                </G>
              ))}
              {/* Clean inner circle */}
              <Circle cx={cx} cy={cy} r={innerRadius} fill="#FEFEFE" stroke="#F1F5F9" strokeWidth={0.5} />
            </G>
          </Svg>
          {/* Center content with better typography */}
          <View style={{ 
            position: 'absolute', 
            left: 0, 
            top: 0, 
            width: size, 
            height: size, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Text style={{ 
              color: '#64748B', 
              fontSize: 11, 
              fontWeight: '500',
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              {mode === 'expenses' ? t('dashboard.expenses', language) : t('dashboard.income', language)}
            </Text>
            <Text style={{ 
              color: '#0F172A', 
              fontSize: 22, 
              fontWeight: '900',
              marginBottom: 2
            }}>
              {formatCurrency(totalAmount)}
            </Text>
            <Text style={{ 
              color: theme.primary, 
              fontSize: 13, 
              fontWeight: '600'
            }}>
              {withPct[selectedIndex]?.category} • {withPct[selectedIndex]?.percentage}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTrendChart = () => {
    const maxValue = Math.max(...monthlyTrends.map(d => Math.max(d.income, d.expenses, d.savings)));
    
    return (
      <View className="bg-white rounded-xl p-4 mb-6">
        <Text className="text-gray-800 font-bold text-lg mb-4">الاتجاه الشهري</Text>
        
        <View className="h-48">
          {/* Chart area */}
          <View className="flex-1 relative">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percentage) => (
              <View
                key={percentage}
                className="absolute w-full border-t border-gray-200"
                style={{ bottom: `${percentage}%` }}
              />
            ))}
            
            {/* Data bars */}
            <View className="flex-row items-end justify-between h-full px-2">
              {monthlyTrends.map((data, index) => {
                const incomeHeight = (data.income / maxValue) * 100;
                const expenseHeight = (data.expenses / maxValue) * 100;
                const savingsHeight = (data.savings / maxValue) * 100;
                
                return (
                  <View key={index} className="flex-1 items-center mx-1">
                    <View className="w-full flex-row justify-between items-end h-full">
                      <View 
                        className="bg-green-500 rounded-t w-2"
                        style={{ height: `${incomeHeight}%` }}
                      />
                      <View 
                        className="bg-red-500 rounded-t w-2"
                        style={{ height: `${expenseHeight}%` }}
                      />
                      <View 
                        className="bg-blue-500 rounded-t w-2"
                        style={{ height: `${savingsHeight}%` }}
                      />
                    </View>
                    <Text className="text-gray-600 text-xs mt-2 text-center">
                      {data.month}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Legend */}
        <View className="flex-row justify-center space-x-4 mt-4">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-green-500 rounded mr-2" />
            <Text className="text-gray-600 text-sm">دخل</Text>
          </View>
          <View className="flex-row items-center mx-4">
            <View className="w-3 h-3 bg-red-500 rounded mr-2" />
            <Text className="text-gray-600 text-sm">مصاريف</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-blue-500 rounded mr-2" />
            <Text className="text-gray-600 text-sm">توفير</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LinearGradient 
        colors={[Colors.light.primary, '#9E77ED', '#7C3AED']} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }} 
        className="px-6 py-6"
      >
        <Text className="text-white text-2xl font-bold mb-5" style={{ letterSpacing: 0.3 }}>
          📊 {t('dashboard.analytics', language)}
        </Text>

        {/* Enhanced Mode Selector */}
        <View className="flex-row rounded-2xl p-1" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3
        }}>
          {[
            { id: 'expenses', label: t('dashboard.expenses', language) },
            { id: 'income', label: t('dashboard.income', language) },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setMode(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-xl ${mode === tab.id ? '' : ''}`}
              style={{
                backgroundColor: mode === tab.id ? '#FFFFFF' : 'transparent',
                shadowColor: mode === tab.id ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: mode === tab.id ? 0.1 : 0,
                shadowRadius: mode === tab.id ? 4 : 0,
                elevation: mode === tab.id ? 2 : 0
              }}
            >
              <Text className={`text-center font-bold text-base`} style={{
                color: mode === tab.id ? Colors.light.primary : 'rgba(255, 255, 255, 0.9)'
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-5" showsVerticalScrollIndicator={false}>
        {/* Enhanced Donut Card */}
        <View className="bg-white rounded-3xl p-6 mb-5" style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
          borderWidth: 0.5,
          borderColor: '#F1F5F9'
        }}>
          {renderPieChart()}
        </View>

        {/* Category List */}
        <View className="bg-white rounded-2xl p-1 mb-6" style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 2,
          borderWidth: 0.5,
          borderColor: '#F1F5F9'
        }}>
          {withPct.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <TouchableOpacity
                key={`${item.category}-${idx}`}
                onPress={() => setSelectedIndex(idx)}
                className={`flex-row items-center justify-between mx-2 my-1 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  backgroundColor: isSelected ? '#F8F5FF' : 'transparent',
                  borderWidth: isSelected ? 1 : 0,
                  borderColor: isSelected ? theme.primary + '20' : 'transparent'
                }}
              >
                <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`} style={{ flex: 1 }}>
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center" 
                    style={{ 
                      backgroundColor: item.color + '15',
                      marginStart: isRTL ? 12 : 0, 
                      marginEnd: isRTL ? 0 : 12,
                      borderWidth: 2,
                      borderColor: item.color
                    }} 
                  >
                    <View 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text 
                      className="text-gray-900 font-semibold text-base" 
                      style={{ 
                        textAlign: isRTL ? 'right' : 'left',
                        marginBottom: 2
                      }}
                    >
                      {item.icon ? `${item.icon} ` : ''}{item.category}
                    </Text>
                    <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <View 
                        className="h-1.5 rounded-full" 
                        style={{ 
                          backgroundColor: item.color + '20',
                          width: 60,
                          marginEnd: isRTL ? 0 : 8,
                          marginStart: isRTL ? 8 : 0
                        }}
                      >
                        <View 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            backgroundColor: item.color,
                            width: `${item.percentage}%`
                          }} 
                        />
                      </View>
                      <Text className="text-gray-500 text-xs font-medium">
                        {item.percentage}%
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end', minWidth: 100 }}>
                  <Text className="text-gray-900 font-bold text-lg">{formatCurrency(item.amount)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Smart Insights */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-4 px-1">💡 {t('insights.title', language) || 'Smart Insights'}</Text>
          
          {/* Prediction Card */}
          <View className="rounded-2xl p-5 mb-4" style={{ 
            backgroundColor: '#F8F5FF',
            borderWidth: 1,
            borderColor: '#E0E7FF',
            shadowColor: '#7C3AED',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2
          }}>
            <View className="flex-row items-start mb-3">
              <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                <Text className="text-lg">🔮</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text className="text-purple-900 font-bold text-base mb-1">
                  {t('insights.prediction', language) || 'Next Month Prediction'}
                </Text>
                <Text className="text-purple-700 text-sm leading-5">
                  Based on your spending habits, you're likely to spend <Text className="font-bold">1,950 TND</Text> next month
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Tip Card */}
          <View className="rounded-2xl p-5" style={{ 
            backgroundColor: '#F0FDF4',
            borderWidth: 1,
            borderColor: '#BBF7D0',
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 1
          }}>
            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                <Text className="text-lg">💚</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text className="text-green-900 font-bold text-base mb-1">
                  {t('insights.savings_tip', language) || 'Savings Opportunity'}
                </Text>
                <Text className="text-green-700 text-sm leading-5 mb-3">
                  You can save up to <Text className="font-bold">150 TND</Text> by reducing your coffee expenses by 30%
                </Text>
                <TouchableOpacity 
                  className="self-start px-4 py-2 rounded-lg"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Text className="text-white font-semibold text-sm">
                    {t('insights.set_budget', language) || 'Set Budget Goal'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
