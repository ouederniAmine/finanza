import { formatCurrency, getCurrency, getTextAlign, t } from '@/lib/i18n';
import { DashboardService } from '@/lib/services';
import type { DashboardData } from '@/lib/services/dashboard.service';
import { useUIStore } from '@/lib/store';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Polyline, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  amount: number;
  description: string;
  category: string;
  date: string;
  icon: string;
}

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  icon: string;
  color: string;
}

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const { language } = useUIStore();
  const { user: clerkUser } = useUser();
  const textAlign = getTextAlign(language);
  const currency = getCurrency(language);
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const hasInitiallyLoaded = useRef(false);

  // Load dashboard data
  useEffect(() => {
    if (clerkUser?.id && !hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
      loadDashboardData();
    }
  }, [clerkUser?.id]);

  // TODO: Add focus effect later with better logic to prevent infinite loops
  // For now, users can use pull-to-refresh to get fresh data

  const loadDashboardData = async () => {
    if (!clerkUser?.id) return;
    
    // Prevent multiple simultaneous calls
    if (loading) {
      console.log('⚠️ Already loading, skipping duplicate call');
      return;
    }
    
    console.log('🔄 Starting to load dashboard data for user:', clerkUser.id);
    
    setLoading(true);
    
    try {
      const data = await DashboardService.getDashboardData(clerkUser.id, language);
      console.log('✅ Dashboard data loaded successfully');
      setDashboardData(data);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      
      // Set fallback data to prevent stuck loading
      setDashboardData({
        user: { totalBalance: 0, income: 0, expenses: 0, monthlyIncome: 0, initialBalance: 0 },
        recentTransactions: [],
        goals: [],
        chartData: {
          monthlyIncomeExpenses: { income: [], expenses: [] },
          savingsOverTime: [],
          topExpenseCategories: [],
          weeklyExpenses: []
        }
      });
      
      Alert.alert(
        t('dashboard.error', language),
        t('dashboard.error_loading_data', language),
        [{ text: t('dashboard.ok', language) }]
      );
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading || !dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.userName}>{t('dashboard.loading', language)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { user, recentTransactions, goals, chartData: dashboardChartData } = dashboardData;

  // Create chart data array for the existing chart display logic
  const chartData = [
    {
      id: 0,
      title: t('dashboard.weekly_expenses', language),
      type: 'line',
      data: dashboardChartData.weeklyExpenses || [
        { label: t('days.sun', language) || 'Sun', value: 0 },
        { label: t('days.mon', language) || 'Mon', value: 0 },
        { label: t('days.tue', language) || 'Tue', value: 0 },
        { label: t('days.wed', language) || 'Wed', value: 0 },
        { label: t('days.thu', language) || 'Thu', value: 0 },
        { label: t('days.fri', language) || 'Fri', value: 0 },
        { label: t('days.sat', language) || 'Sat', value: 0 },
      ],
      color: '#667EEA',
    },
    {
      id: 1,
      title: t('dashboard.monthly_income_vs_expenses', language),
      type: 'multiline',
      data: {
        income: dashboardChartData.monthlyIncomeExpenses.income,
        expenses: dashboardChartData.monthlyIncomeExpenses.expenses,
      },
      colors: {
        income: '#4ECDC4',
        expenses: '#FF6B6B',
      },
    },
    {
      id: 2,
      title: t('dashboard.savings_over_time', language),
      type: 'line',
      data: dashboardChartData.savingsOverTime,
      color: '#10B981',
    },
    {
      id: 3,
      title: t('dashboard.top_expense_categories', language),
      type: 'donut',
      data: dashboardChartData.topExpenseCategories,
      totalAmount: dashboardChartData.topExpenseCategories.reduce((sum, item) => sum + item.value, 0),
    },
  ];

  const getTransactionColor = (type: string) => {
    return type === 'income' ? '#4ECDC4' : '#FF6B6B';
  };

  const renderLineChart = (data: any[], color: string) => {
    const maxAmount = Math.max(...data.map(d => d.value));
    const minAmount = Math.min(...data.map(d => d.value));
    const chartHeight = 180;
    const chartWidth = 320; // Increased width to use more space
    const leftMargin = 50; // Optimized for Y-axis labels
    const bottomMargin = 30; // Optimized for X-axis labels
    const topMargin = 15;
    const rightMargin = 15;
    
    const plotWidth = chartWidth - leftMargin - rightMargin;
    const plotHeight = chartHeight - topMargin - bottomMargin;
    const pointWidth = plotWidth / (data.length - 1);

    // Calculate Y-axis scale with padding
    const yRange = maxAmount - minAmount || 1; // Prevent division by zero
    const yPadding = yRange * 0.1; // 10% padding
    const adjustedMin = minAmount - yPadding;
    const adjustedMax = maxAmount + yPadding;
    const adjustedRange = adjustedMax - adjustedMin;
    const yScale = plotHeight / adjustedRange;

    const points = data.map((item, index) => {
      const x = leftMargin + index * pointWidth;
      const y = topMargin + plotHeight - ((item.value - adjustedMin) * yScale);
      return `${x},${y}`;
    }).join(' ');

    // Generate Y-axis labels
    const yLabels = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const value = adjustedMin + (adjustedRange * i / steps);
      const y = topMargin + plotHeight - ((value - adjustedMin) * yScale);
      yLabels.push({ value: Math.round(value), y });
    }

    return (
      <View style={[styles.lineChartContainer, { width: '100%' }]}>
        <View style={{ position: 'relative', width: '100%', alignItems: 'center' , marginLeft :-10}}>
          <Svg height={chartHeight} width={chartWidth} style={{ alignSelf: 'center', marginLeft: -10 }}>
            <Defs>
              <SvgLinearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
              </SvgLinearGradient>
            </Defs>
            
            {/* Grid lines */}
            {yLabels.map((label, index) => (
              <Polyline
                key={`grid-${index}`}
                points={`${leftMargin},${label.y} ${leftMargin + plotWidth},${label.y}`}
                stroke="#F3F4F6"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Y-axis */}
            <Polyline
              points={`${leftMargin},${topMargin} ${leftMargin},${topMargin + plotHeight}`}
              stroke="#9CA3AF"
              strokeWidth="1.5"
            />
            
            {/* X-axis */}
            <Polyline
              points={`${leftMargin},${topMargin + plotHeight} ${leftMargin + plotWidth},${topMargin + plotHeight}`}
              stroke="#9CA3AF"
              strokeWidth="1.5"
            />
            
            {/* Area under curve */}
            <Polyline
              points={`${leftMargin},${topMargin + plotHeight} ${points} ${leftMargin + plotWidth},${topMargin + plotHeight}`}
              fill={`url(#gradient-${color.replace('#', '')})`}
              stroke="none"
            />
            
            {/* Main line */}
            <Polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = leftMargin + index * pointWidth;
              const y = topMargin + plotHeight - ((item.value - adjustedMin) * yScale);
              return (
                <Circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#FFFFFF"
                  stroke={color}
                  strokeWidth="2"
                />
              );
            })}
          </Svg>
          
          {/* Y-axis labels - positioned outside the SVG */}
          {yLabels.map((label, index) => (
            <Text 
              key={`y-${index}`} 
              style={[
                styles.yAxisLabel, 
                { 
                  position: 'absolute',
                  top: label.y - 7,
                  left:-25,
                  width: leftMargin - 5,
                  textAlign: 'right',
                }
              ]}
            >
              {Math.round(label.value)}
            </Text>
          ))}
          
          {/* X-axis labels - positioned outside the SVG */}
          {data.map((item, index) => (
            <Text 
              key={`x-${index}`} 
              style={[
                styles.xAxisLabel,
                { 
                  position: 'absolute',
                  left: leftMargin + index * pointWidth - 35,
                  top: chartHeight - bottomMargin + 15,
                  width: 24,
                  textAlign: 'center',
                }
              ]}
            >
              {item.label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderMultiLineChart = (incomeData: any[], expenseData: any[], colors: any) => {
    const allValues = [...incomeData.map(d => d.value), ...expenseData.map(d => d.value)];
    const maxAmount = Math.max(...allValues);
    const minAmount = Math.min(...allValues);
    const chartHeight = 200;
    const chartWidth = 320; // Increased width to use more space
    const leftMargin = 50; // Optimized for Y-axis labels
    const bottomMargin = 50; // Extra space for legend and X-axis
    const topMargin = 15;
    const rightMargin = 15;
    
    const plotWidth = chartWidth - leftMargin - rightMargin;
    const plotHeight = chartHeight - topMargin - bottomMargin;
    const pointWidth = plotWidth / (incomeData.length - 1);

    // Calculate Y-axis scale with padding
    const yRange = maxAmount - minAmount || 1; // Prevent division by zero
    const yPadding = yRange * 0.1; // 10% padding
    const adjustedMin = minAmount - yPadding;
    const adjustedMax = maxAmount + yPadding;
    const adjustedRange = adjustedMax - adjustedMin;
    const yScale = plotHeight / adjustedRange;

    const incomePoints = incomeData.map((item, index) => {
      const x = leftMargin + index * pointWidth;
      const y = topMargin + plotHeight - ((item.value - adjustedMin) * yScale);
      return `${x},${y}`;
    }).join(' ');

    const expensePoints = expenseData.map((item, index) => {
      const x = leftMargin + index * pointWidth;
      const y = topMargin + plotHeight - ((item.value - adjustedMin) * yScale);
      return `${x},${y}`;
    }).join(' ');

    // Generate Y-axis labels
    const yLabels = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const value = adjustedMin + (adjustedRange * i / steps);
      const y = topMargin + plotHeight - ((value - adjustedMin) * yScale);
      yLabels.push({ value: Math.round(value), y });
    }

    return (
      <View style={[styles.multiLineChartContainer, { width: '100%' }]}>
        <View style={{ position: 'relative', width: '100%', alignItems: 'center', marginLeft: -10 }}>
          <Svg height={chartHeight} width={chartWidth} >
            <Defs>
              <SvgLinearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={colors.income} stopOpacity="0.2" />
                <Stop offset="100%" stopColor={colors.income} stopOpacity="0.05" />
              </SvgLinearGradient>
              <SvgLinearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={colors.expenses} stopOpacity="0.2" />
                <Stop offset="100%" stopColor={colors.expenses} stopOpacity="0.05" />
              </SvgLinearGradient>
            </Defs>
            
            {/* Grid lines */}
            {yLabels.map((label, index) => (
              <Polyline
                key={`grid-${index}`}
                points={`${leftMargin},${label.y} ${leftMargin + plotWidth},${label.y}`}
                stroke="#F3F4F6"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Y-axis */}
            <Polyline
              points={`${leftMargin},${topMargin} ${leftMargin},${topMargin + plotHeight}`}
              stroke="#9CA3AF"
              strokeWidth="1.5"
            />
            
            {/* X-axis */}
            <Polyline
              points={`${leftMargin},${topMargin + plotHeight} ${leftMargin + plotWidth},${topMargin + plotHeight}`}
              stroke="#9CA3AF"
              strokeWidth="1.5"
            />
            
            {/* Income area */}
            <Polyline
              points={`${leftMargin},${topMargin + plotHeight} ${incomePoints} ${leftMargin + plotWidth},${topMargin + plotHeight}`}
              fill="url(#incomeGradient)"
              stroke="none"
            />
            
            {/* Expense area */}
            <Polyline
              points={`${leftMargin},${topMargin + plotHeight} ${expensePoints} ${leftMargin + plotWidth},${topMargin + plotHeight}`}
              fill="url(#expenseGradient)"
              stroke="none"
            />
            
            {/* Income Line */}
            <Polyline
              points={incomePoints}
              fill="none"
              stroke={colors.income}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Expense Line */}
            <Polyline
              points={expensePoints}
              fill="none"
              stroke={colors.expenses}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Income Points */}
            {incomeData.map((item, index) => {
              const x = leftMargin + index * pointWidth;
              const y = topMargin + plotHeight - ((item.value - adjustedMin) * yScale);
              return (
                <Circle
                  key={`income-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#FFFFFF"
                  stroke={colors.income}
                  strokeWidth="2"
                />
              );
            })}
            
            {/* Expense Points */}
            {expenseData.map((item, index) => {
              const x = leftMargin + index * pointWidth;
              const y = topMargin + plotHeight - ((item.value - adjustedMin) * yScale);
              return (
                <Circle
                  key={`expense-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#FFFFFF"
                  stroke={colors.expenses}
                  strokeWidth="2"
                />
              );
            })}
          </Svg>
          
          {/* Y-axis labels - positioned outside the SVG */}
          {yLabels.map((label, index) => (
            <Text 
              key={`y-${index}`} 
              style={[
                styles.yAxisLabel, 
                { 
                  position: 'absolute',
                  top: label.y - 7,
                  left: -7,
                  width: leftMargin- 25,
                  textAlign: 'right',
                }
              ]}
            >
              {Math.round(label.value)}
            </Text>
          ))}
          
          {/* X-axis labels - positioned outside the SVG */}
          {incomeData.map((item, index) => (
            <Text 
              key={`x-${index}`} 
              style={[
                styles.xAxisLabel,
                { 
                  position: 'absolute',
                  left: leftMargin + index * pointWidth - 32,
                  top: chartHeight - bottomMargin + 10,
                  width: 24,
                  textAlign: 'center',
                }
              ]}
            >
              {item.label}
            </Text>
          ))}
        </View>
        
        {/* Legend */}
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
            <Text style={styles.legendText}>{t('dashboard.income', language)}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.expenses }]} />
            <Text style={styles.legendText}>{t('dashboard.expenses', language)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDonutChart = (data: any[], totalAmount: number) => {
    const size = 120; // Reduced size to make chart smaller
    const strokeWidth = 10; // Reduced stroke width
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const center = size / 2;

    let accumulatedPercentage = 0;

    return (
      <View style={styles.donutContainer}>
        {/* Chart and center text container */}
        <View style={{ position: 'relative', alignItems: 'center', marginBottom: 20 }}>
          <Svg width={size} height={size}>
            {/* Background circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#F3F4F6"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            
            {/* Data segments */}
            {data.map((item, index) => {
              const percentage = (item.value / totalAmount) * 100;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = circumference - (accumulatedPercentage / 100) * circumference;
              
              accumulatedPercentage += percentage;

              return (
                <Circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${center} ${center})`}
                />
              );
            })}
          </Svg>
          
          <View style={styles.donutCenter}>
            <Text style={styles.donutAmount}>{formatCurrency(totalAmount, currency, language)}</Text>
            <Text style={styles.donutSubtext}>{t('dashboard.total', language)}</Text>
          </View>
        </View>
        
        {/* Legend container */}
        <View style={styles.donutLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.donutLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.donutLegendText} numberOfLines={1}>{item.label}</Text>
              <Text style={styles.donutLegendValue}>
                {formatCurrency(item.value, currency, language)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.morning_greeting', language);
    if (hour < 18) return t('dashboard.afternoon_greeting', language);
    return t('dashboard.evening_greeting', language);
  };

  const getChartCardColor = (index: number) => {
    const colors = ['#F0F4FF', '#FFF5F5', '#F0FDF4', '#FFFBEB'];
    return colors[index] || '#FFFFFF';
  };

  const getChartIconColor = (index: number) => {
    const colors = ['#667EEA', '#FF6B6B', '#10B981', '#F59E0B'];
    return colors[index] || '#667EEA';
  };

  const getChartIcon = (index: number) => {
    const icons = ['📊', '📈', '💰', '🎯'];
    return icons[index] || '📊';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { flexDirection: language === 'tn' ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.greeting, { textAlign }]}>{getGreeting()}</Text>
            <Text style={[styles.userName, { textAlign }]}>{clerkUser?.fullName || t('dashboard.user_name', language)}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceLabel, { textAlign }]}>
            {t('dashboard.total_balance', language)}
          </Text>
          <Text style={[styles.balanceAmount, { textAlign }]}>
            {formatCurrency(user.totalBalance, currency, language)}
          </Text>
          {(user.monthlyIncome || user.initialBalance || 0) > 0 && (
            <Text style={[styles.balanceBreakdown, { textAlign }]}>
              {t('dashboard.balance_breakdown', language)}: {formatCurrency(user.initialBalance || 0, currency, language)} + {formatCurrency(user.monthlyIncome || 0, currency, language)} + {formatCurrency((user.income || 0) - (user.expenses || 0), currency, language)}
            </Text>
          )}
        </View>

        {/* Income & Expense Cards */}
        <View style={styles.cardRow}>
          <View style={[styles.card, styles.incomeCard]}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📈</Text>
            </View>
            <Text style={styles.cardLabel}>{t('dashboard.income', language)}</Text>
            <Text style={styles.cardAmount}>{formatCurrency(user.income, currency, language)}</Text>
          </View>
          
          <View style={[styles.card, styles.expenseCard]}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📉</Text>
            </View>
            <Text style={styles.cardLabel}>{t('dashboard.expenses', language)}</Text>
            <Text style={styles.cardAmount}>{formatCurrency(user.expenses, currency, language)}</Text>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { textAlign }]}>
              {t('dashboard.analytics', language)}
            </Text>
            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodButtonText}>{t('dashboard.monthly', language)}</Text>
              <Text style={styles.chevronDown}>▼</Text>
            </TouchableOpacity>
          </View>
          
          {/* Chart Tabs */}
          <View style={styles.chartTabs}>
            {chartData.map((chart, index) => (
              <TouchableOpacity
                key={chart.id}
                style={[
                  styles.chartTab,
                  currentChartIndex === index && styles.activeChartTab
                ]}
                onPress={() => setCurrentChartIndex(index)}
              >
                <Text style={[
                  styles.chartTabText,
                  currentChartIndex === index && styles.activeChartTabText
                ]}>
                  {chart.title.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Chart Content */}
          <View style={[styles.chartCard, { backgroundColor: getChartCardColor(currentChartIndex) }]}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{chartData[currentChartIndex].title}</Text>
              <View style={[styles.chartIcon, { backgroundColor: getChartIconColor(currentChartIndex) }]}>
                <Text style={styles.chartIconText}>{getChartIcon(currentChartIndex)}</Text>
              </View>
            </View>
            
            <View style={styles.chartContent}>
              {currentChartIndex === 0 && renderLineChart(chartData[0].data as any[], chartData[0].color || '#667EEA')}
              {currentChartIndex === 1 && renderMultiLineChart(
                (chartData[1].data as any).income, 
                (chartData[1].data as any).expenses, 
                chartData[1].colors || { income: '#4ECDC4', expenses: '#FF6B6B' }
              )}
              {currentChartIndex === 2 && renderLineChart(chartData[2].data as any[], chartData[2].color || '#10B981')}
              {currentChartIndex === 3 && renderDonutChart(chartData[3].data as any[], chartData[3].totalAmount || 0)}
            </View>
          </View>
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { textAlign }]}>
              {t('dashboard.goals', language)}
            </Text>
            <TouchableOpacity onPress={() => router.push('/goals')}>
              <Text style={styles.viewAllText}>{t('dashboard.view_all', language)}</Text>
            </TouchableOpacity>
          </View>
          
          {goals.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>🎯</Text>
              <Text style={styles.emptyStateTitle}>
                {t('dashboard.no_goals_title', language)}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {t('dashboard.no_goals_subtitle', language)}
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/goals')}
              >
                <Text style={styles.emptyStateButtonText}>
                  {t('dashboard.add_goal', language)}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.goalsScroll}>
              {goals.slice(0, 3).map((goal, index) => {
                const progress = (goal.current / goal.target) * 100;
                return (
                  <View key={goal.id} style={[styles.goalCard, index === 0 && styles.firstGoalCard]}>
                    <View style={styles.goalHeader}>
                      <Text style={styles.goalIcon}>{goal.icon}</Text>
                      <Text style={styles.goalName}>{goal.name}</Text>
                    </View>
                    
                    <Text style={styles.goalAmount}>
                      {formatCurrency(goal.current, currency, language)}
                    </Text>
                    <Text style={styles.goalTarget}>
                      {t('dashboard.of', language)} {formatCurrency(goal.target, currency, language)}
                    </Text>
                    
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${Math.min(progress, 100)}%`, 
                              backgroundColor: goal.color 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { textAlign }]}>
              {t('dashboard.recent_transactions', language)}
            </Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.viewAllText}>{t('dashboard.view_all', language)}</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>💸</Text>
              <Text style={styles.emptyStateTitle}>
                {t('dashboard.no_transactions_title', language)}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {t('dashboard.no_transactions_subtitle', language)}
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/add-transaction')}
              >
                <Text style={styles.emptyStateButtonText}>
                  {t('dashboard.add_transaction', language)}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.transactionsContainer}>
              {recentTransactions.slice(0, 3).map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View 
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: `${getTransactionColor(transaction.type)}15` }
                      ]}
                    >
                      <Text style={styles.transactionEmoji}>{transaction.icon}</Text>
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription}>{transaction.description}</Text>
                      <Text style={styles.transactionMeta}>
                        {transaction.category} • {transaction.date}
                      </Text>
                    </View>
                  </View>
                  
                  <Text 
                    style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(transaction.type) }
                    ]}
                  >
                    {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount, currency, language)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FAFBFC',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  balanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FAFBFC',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  balanceBreakdown: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  card: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardIconText: {
    fontSize: 18,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  chevronDown: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 200,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 10,
  },
  chartLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  goalsScroll: {
    marginBottom: 0,
  },
  goalCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  firstGoalCard: {
    marginLeft: 0,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  goalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalTarget: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    gap: 8,
  },
  chartIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  donutContainer: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
    // Removed fixed height and absolute positioning to let content flow naturally
  },
  donutCenter: {
    position: 'absolute',
    top: 35, // Better centered positioning
    left: '50%',
    transform: [{ translateX: -130 }], // Centered transform
    alignItems: 'center',
    justifyContent: 'center',
    width: 100, // Increased width for better text space
    height: 60, // Increased height for better text space
  },
  donutAmount: {
    fontSize: 17, // Much larger for prominence
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 22,
  },
  donutSubtext: {
    fontSize: 14, // Larger subtext
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  donutLegend: {
    width: '100%',
    paddingHorizontal: 10,
    // Removed marginTop since we're using proper container structure now
  },
  donutLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  donutLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4, // Reduced padding
    paddingHorizontal: 4,
    marginBottom: 2, // Reduced margin
    width: '100%',
  },
  donutLegendText: {
    fontSize: 12,
    color: '#1F2937',
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  donutLegendValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 65,
    textAlign: 'right',
  },
  chartScrollView: {
    marginHorizontal: -20,
    marginBottom: 8,
  },
  chartScrollContainer: {
    paddingHorizontal: 20,
  },
  chartSlide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
  },
  lineChartContainer: {
    alignItems: 'center',
    width: '100%',
  },
  multiLineChartContainer: {
    alignItems: 'center',
    width: '100%',
  },
  chartTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  chartTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeChartTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeChartTabText: {
    color: '#1F2937',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    // Removed minHeight to let content determine card size
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  chartIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartIconText: {
    fontSize: 16,
  },
  chartContent: {
    alignItems: 'center',
  },
  yAxisLabels: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'right',
    width: 50,
  },
  xAxisLabels: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    width: 30,
  },
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: '#667EEA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
