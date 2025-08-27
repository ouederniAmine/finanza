import { AnalyticsData, AnalyticsService } from '@/lib/services/analytics.service';
import { useUIStore } from '@/lib/store';
import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { user } = useUser();
  const { language } = useUIStore();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  
  const formatCurrency = (amount: number) => `${amount.toLocaleString()} TND`;

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

  const renderPieChart = () => {
    return (
      <View className="items-center mb-6">
        <View className="relative w-48 h-48 items-center justify-center">
          {/* Simple pie chart representation with colored segments */}
          <View className="w-48 h-48 rounded-full bg-gray-200 relative overflow-hidden">
            {/* Simplified pie segments as colored arcs */}
            {spendingByCategory.map((item, index) => (
              <View
                key={index}
                className="absolute w-6 h-24 opacity-80"
                style={{
                  backgroundColor: item.color,
                  transform: [
                    { rotate: `${index * 60}deg` },
                  ],
                  left: '50%',
                  top: '25%',
                  marginLeft: -12,
                }}
              />
            ))}
          </View>
          
          {/* Center circle with total */}
          <View className="absolute w-24 h-24 bg-white rounded-full items-center justify-center shadow-lg">
            <Text className="text-gray-800 font-bold text-lg">
              {formatCurrency(totalExpenses)}
            </Text>
            <Text className="text-gray-500 text-xs">المجموع</Text>
          </View>
        </View>

        {/* Legend */}
        <View className="w-full mt-4">
          {spendingByCategory.map((item) => (
            <View key={item.category} className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center flex-1">
                <View 
                  className="w-4 h-4 rounded mr-3"
                  style={{ backgroundColor: item.color }}
                />
                <Text className="text-gray-700 mr-2">{item.icon}</Text>
                <Text className="text-gray-700 font-medium">{item.category}</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-800 font-bold">{formatCurrency(item.amount)}</Text>
                <Text className="text-gray-500 text-sm">{item.percentage}%</Text>
              </View>
            </View>
          ))}
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
      {/* Header */}
      <LinearGradient
        colors={['#7F56D9', '#9E77ED']}
        className="px-6 py-6"
      >
        <Text className="text-white text-2xl font-bold mb-4">
          📊 التقارير والتحليلات
        </Text>

        {/* Period Selector */}
        <View className="flex-row bg-white/20 rounded-xl p-1">
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              onPress={() => setSelectedPeriod(period.id)}
              className={`flex-1 py-2 px-4 rounded-xl ${
                selectedPeriod === period.id ? 'bg-white/30' : ''
              }`}
            >
              <Text className={`text-center font-medium ${
                selectedPeriod === period.id ? 'text-white' : 'text-white/80'
              }`}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* Monthly Summary */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-gray-800 text-xl font-bold mb-4">
            📋 تقرير شهر جوان 2025
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">💰 إجمالي الدخل</Text>
              <Text className="text-green-600 font-bold text-lg">
                {formatCurrency(currentMonth.income)}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">💸 إجمالي المصاريف</Text>
              <Text className="text-red-600 font-bold text-lg">
                {formatCurrency(currentMonth.expenses)}
              </Text>
            </View>
            
            <View className="border-t border-gray-200 pt-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-800 font-semibold">💚 صافي التوفير</Text>
                <Text className="text-blue-600 font-bold text-xl">
                  {formatCurrency(currentMonth.savings)}
                </Text>
              </View>
            </View>

            <View className="bg-gray-50 rounded-xl p-4 mt-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">📈 أكبر مصروف</Text>
                <Text className="text-gray-800 font-semibold">
                  {spendingByCategory[0] ? 
                    `${spendingByCategory[0].category} (${formatCurrency(spendingByCategory[0].amount)})` 
                    : 'لا توجد بيانات'}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">📉 أقل مصروف</Text>
                <Text className="text-gray-800 font-semibold">
                  {spendingByCategory[spendingByCategory.length - 1] ? 
                    `${spendingByCategory[spendingByCategory.length - 1].category} (${formatCurrency(spendingByCategory[spendingByCategory.length - 1].amount)})` 
                    : 'لا توجد بيانات'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">⭐ التقييم</Text>
                <Text className="text-green-600 font-semibold">
                  {currentMonth.savings > 0 ? '"شهر ممتاز!"' : '"راقب مصاريفك"'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Spending Breakdown */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-gray-800 text-xl font-bold mb-4">
            🥧 توزيع المصاريف
          </Text>
          {renderPieChart()}
        </View>

        {/* Trend Analysis */}
        {renderTrendChart()}

        {/* Financial Insights */}
        <View className="mb-6">
          <Text className="text-gray-800 text-xl font-bold mb-4">
            💡 رؤى مالية ذكية
          </Text>
          
          {insights.map((insight, index) => {
            const colors = getInsightColors(insight.type);
            
            return (
              <View 
                key={index}
                className="rounded-xl p-4 mb-3 border"
                style={{ 
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-start">
                  <Text className="text-2xl mr-3">{insight.icon}</Text>
                  <View className="flex-1">
                    <Text 
                      className="font-bold text-lg mb-1"
                      style={{ color: colors.text }}
                    >
                      {insight.title}
                    </Text>
                    <Text 
                      className="text-sm mb-3"
                      style={{ color: colors.text }}
                    >
                      {insight.description}
                    </Text>
                    <TouchableOpacity 
                      className="self-start px-4 py-2 rounded-xl"
                      style={{ backgroundColor: colors.border }}
                    >
                      <Text className="text-white font-semibold text-sm">
                        {insight.action}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Predictions */}
        <View className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border border-purple-200">
          <Text className="text-gray-800 text-xl font-bold mb-4">
            🔮 توقعات الشهر الجاي
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">📊</Text>
              <Text className="text-gray-700 flex-1">
                بناء على عاداتك، متوقع تصرف <Text className="font-bold">1,950 TND</Text> الشهر الجاي
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🎯</Text>
              <Text className="text-gray-700 flex-1">
                راح توصل لهدف <Text className="font-bold">سفر دبي</Text> في <Text className="font-bold">أكتوبر 2025</Text>
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">⚠️</Text>
              <Text className="text-gray-700 flex-1">
                انتبه! قاعد تتجه لتجاوز ميزانية <Text className="font-bold text-red-600">القهوة</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="bg-white rounded-xl p-4 w-[48%] mb-3 shadow-sm border border-gray-100">
            <Text className="text-2xl mb-2">📱</Text>
            <Text className="text-gray-600 text-sm">معاملات هالشهر</Text>
            <Text className="text-gray-800 font-bold text-xl">127</Text>
          </View>
          
          <View className="bg-white rounded-xl p-4 w-[48%] mb-3 shadow-sm border border-gray-100">
            <Text className="text-2xl mb-2">📈</Text>
            <Text className="text-gray-600 text-sm">متوسط يومي</Text>
            <Text className="text-gray-800 font-bold text-xl">67 TND</Text>
          </View>
          
          <View className="bg-white rounded-xl p-4 w-[48%] mb-3 shadow-sm border border-gray-100">
            <Text className="text-2xl mb-2">🎯</Text>
            <Text className="text-gray-600 text-sm">أهداف محققة</Text>
            <Text className="text-gray-800 font-bold text-xl">2/4</Text>
          </View>
          
          <View className="bg-white rounded-xl p-4 w-[48%] mb-3 shadow-sm border border-gray-100">
            <Text className="text-2xl mb-2">🔥</Text>
            <Text className="text-gray-600 text-sm">أيام متتالية</Text>
            <Text className="text-gray-800 font-bold text-xl">15</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
