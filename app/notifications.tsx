import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationItem {
  id: string;
  type: 'budget' | 'saving' | 'bill' | 'achievement' | 'reminder';
  title: string;
  message: string;
  time: string;
  amount?: number;
  read: boolean;
  urgent?: boolean;
}

interface CalendarEvent {
  id: string;
  type: 'bill' | 'saving' | 'budget' | 'reminder';
  title: string;
  amount?: number;
  date: string;
  completed?: boolean;
}

export default function NotificationsScreen() {
  const [selectedTab, setSelectedTab] = useState<'notifications' | 'calendar'>('notifications');

  const notifications: NotificationItem[] = [
    {
      id: '1',
      type: 'budget',
      title: 'تحذير ميزانية',
      message: 'تجاوزت 80% من ميزانية القهوة (160/200 TND)',
      time: 'الآن',
      amount: 40,
      read: false,
      urgent: true,
    },
    {
      id: '2',
      type: 'achievement',
      title: 'إنجاز جديد! 🎉',
      message: 'وصلت لهدف التوفير الأسبوعي!',
      time: 'منذ ساعة',
      read: false,
    },
    {
      id: '3',
      type: 'bill',
      title: 'تذكير فاتورة',
      message: 'فاتورة الإنترنت مستحقة خلال 3 أيام',
      time: 'منذ ساعتين',
      amount: 45,
      read: true,
    },
    {
      id: '4',
      type: 'saving',
      title: 'تذكير توفير',
      message: 'ما دخلتش مبلغ للتوفير اليوم',
      time: 'أمس',
      read: true,
    },
    {
      id: '5',
      type: 'budget',
      title: 'ميزانية جديدة',
      message: 'بدأت ميزانية شهر جوان بنجاح',
      time: 'منذ يومين',
      read: true,
    },
  ];

  const calendarEvents: CalendarEvent[] = [
    {
      id: '1',
      type: 'bill',
      title: 'فاتورة الإنترنت',
      amount: 45,
      date: '2025-06-25',
    },
    {
      id: '2',
      type: 'bill',
      title: 'فاتورة الكهرباء',
      amount: 120,
      date: '2025-06-28',
    },
    {
      id: '3',
      type: 'saving',
      title: 'هدف التوفير الشهري',
      amount: 500,
      date: '2025-06-30',
      completed: false,
    },
    {
      id: '4',
      type: 'budget',
      title: 'بداية ميزانية جديدة',
      date: '2025-07-01',
    },
    {
      id: '5',
      type: 'reminder',
      title: 'مراجعة المصاريف الأسبوعية',
      date: '2025-06-29',
    },
    {
      id: '6',
      type: 'bill',
      title: 'اشتراك نتفلكس',
      amount: 15,
      date: '2025-07-02',
    },
  ];

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} TND`;

  const getNotificationIcon = (type: string, urgent?: boolean) => {
    const icons = {
      budget: urgent ? '🚨' : '💰',
      saving: '💾',
      bill: '📄',
      achievement: '🏆',
      reminder: '⏰',
    };
    return icons[type as keyof typeof icons] || '📱';
  };

  const getNotificationColors = (type: string, urgent?: boolean) => {
    if (urgent) return { bg: '#FEF2F2', border: '#EF4444', text: '#DC2626' };
    
    const colors = {
      budget: { bg: '#F3E8FF', border: '#8B5CF6', text: '#7C3AED' },
      saving: { bg: '#DBEAFE', border: '#3B82F6', text: '#2563EB' },
      bill: { bg: '#FEF3C7', border: '#F59E0B', text: '#D97706' },
      achievement: { bg: '#D1FAE5', border: '#10B981', text: '#059669' },
      reminder: { bg: '#F3F4F6', border: '#6B7280', text: '#4B5563' },
    };
    return colors[type as keyof typeof colors] || colors.reminder;
  };

  const getEventTypeIcon = (type: string) => {
    const icons = {
      bill: '📄',
      saving: '💰',
      budget: '📊',
      reminder: '⏰',
    };
    return icons[type as keyof typeof icons] || '📅';
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      bill: '#EF4444',
      saving: '#10B981',
      budget: '#8B5CF6',
      reminder: '#6B7280',
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  const groupEventsByDate = () => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    calendarEvents.forEach(event => {
      const date = event.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(event);
    });
    return grouped;
  };

  const formatDateArabic = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'اليوم';
    if (date.toDateString() === tomorrow.toDateString()) return 'غداً';
    
    const months = [
      'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
      'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const markAsRead = (notificationId: string) => {
    Alert.alert('تم!', 'تم تمييز الإشعار كمقروء');
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert(
      'حذف الإشعار',
      'متأكد باش تحذف هالإشعار؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: () => {} }
      ]
    );
  };

  const completeEvent = (eventId: string) => {
    Alert.alert('نجح!', 'تم تمييز المهمة كمكتملة');
  };

  const renderNotifications = () => (
    <View className="flex-1">
      {/* Quick Actions */}
      <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
        <Text className="text-gray-800 font-bold text-lg mb-3">إجراءات سريعة</Text>
        <View className="flex-row justify-between">
          <TouchableOpacity 
            className="bg-purple-100 px-4 py-2 rounded-xl flex-1 mr-2"
            onPress={() => Alert.alert('تم!', 'تم تمييز جميع الإشعارات كمقروءة')}
          >
            <Text className="text-purple-600 font-semibold text-center">تمييز الكل كمقروء</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-red-100 px-4 py-2 rounded-xl flex-1 ml-2"
            onPress={() => Alert.alert('تم!', 'تم حذف جميع الإشعارات المقروءة')}
          >
            <Text className="text-red-600 font-semibold text-center">حذف المقروءة</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      {notifications.map((notification) => {
        const colors = getNotificationColors(notification.type, notification.urgent);
        
        return (
          <TouchableOpacity
            key={notification.id}
            onLongPress={() => deleteNotification(notification.id)}
            onPress={() => markAsRead(notification.id)}
            className={`rounded-xl p-4 mb-3 border ${notification.read ? 'bg-gray-50' : 'bg-white'}`}
            style={{ borderColor: colors.border }}
          >
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">
                {getNotificationIcon(notification.type, notification.urgent)}
              </Text>
              
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text 
                    className={`font-bold ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}
                    style={{ color: notification.read ? '#6B7280' : colors.text }}
                  >
                    {notification.title}
                  </Text>
                  <Text className="text-gray-500 text-sm">{notification.time}</Text>
                </View>
                
                <Text className={`${notification.read ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                  {notification.message}
                </Text>
                
                {notification.amount && (
                  <View className="bg-gray-100 rounded-lg px-3 py-1 self-start">
                    <Text className="text-gray-700 font-semibold text-sm">
                      {formatCurrency(notification.amount)}
                    </Text>
                  </View>
                )}
                
                {!notification.read && (
                  <View className="w-2 h-2 bg-blue-500 rounded-full absolute -left-2 top-2" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {notifications.length === 0 && (
        <View className="bg-white rounded-xl p-8 items-center">
          <Text className="text-6xl mb-4">🔔</Text>
          <Text className="text-gray-600 font-semibold text-lg mb-2">
            ما عندكش إشعارات
          </Text>
          <Text className="text-gray-500 text-center">
            الإشعارات الجديدة باش تظهر هنا
          </Text>
        </View>
      )}
    </View>
  );

  const renderCalendar = () => {
    const groupedEvents = groupEventsByDate();
    const sortedDates = Object.keys(groupedEvents).sort();

    return (
      <View className="flex-1">
        {/* Summary Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-white rounded-xl p-4 flex-1 mr-2 shadow-sm border border-gray-100">
            <Text className="text-2xl mb-2">📄</Text>
            <Text className="text-gray-600 text-sm">فواتير قريبة</Text>
            <Text className="text-red-600 font-bold text-lg">3</Text>
          </View>
          
          <View className="bg-white rounded-xl p-4 flex-1 mx-1 shadow-sm border border-gray-100">
            <Text className="text-2xl mb-2">🎯</Text>
            <Text className="text-gray-600 text-sm">أهداف نشطة</Text>
            <Text className="text-blue-600 font-bold text-lg">2</Text>
          </View>
          
          <View className="bg-white rounded-xl p-4 flex-1 ml-2 shadow-sm border border-gray-100">
            <Text className="text-2xl mb-2">⏰</Text>
            <Text className="text-gray-600 text-sm">تذكيرات</Text>
            <Text className="text-purple-600 font-bold text-lg">1</Text>
          </View>
        </View>

        {/* Calendar Events */}
        {sortedDates.map((date) => (
          <View key={date} className="mb-6">
            <Text className="text-gray-800 font-bold text-lg mb-3">
              📅 {formatDateArabic(date)}
            </Text>
            
            {groupedEvents[date].map((event) => (
              <View 
                key={event.id}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: getEventTypeColor(event.type) }}
                    />
                    <Text className="text-2xl mr-3">
                      {getEventTypeIcon(event.type)}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-semibold">
                        {event.title}
                      </Text>
                      {event.amount && (
                        <Text className="text-gray-600 text-sm">
                          {formatCurrency(event.amount)}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {event.type !== 'reminder' && (
                    <TouchableOpacity
                      onPress={() => completeEvent(event.id)}
                      className={`px-3 py-1 rounded-lg ${
                        event.completed ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <Text className={`text-sm font-semibold ${
                        event.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {event.completed ? 'مكتمل ✓' : 'تمييز'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

        {Object.keys(groupedEvents).length === 0 && (
          <View className="bg-white rounded-xl p-8 items-center">
            <Text className="text-6xl mb-4">📅</Text>
            <Text className="text-gray-600 font-semibold text-lg mb-2">
              ما عندكش أحداث قريبة
            </Text>
            <Text className="text-gray-500 text-center">
              الفواتير والتذكيرات باش تظهر هنا
            </Text>
          </View>
        )}
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
          {selectedTab === 'notifications' ? '🔔 الإشعارات' : '📅 التقويم'}
        </Text>

        {/* Tab Selector */}
        <View className="flex-row bg-white/20 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setSelectedTab('notifications')}
            className={`flex-1 py-2 px-4 rounded-xl ${
              selectedTab === 'notifications' ? 'bg-white/30' : ''
            }`}
          >
            <Text className={`text-center font-medium ${
              selectedTab === 'notifications' ? 'text-white' : 'text-white/80'
            }`}>
              🔔 الإشعارات ({notifications.filter(n => !n.read).length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setSelectedTab('calendar')}
            className={`flex-1 py-2 px-4 rounded-xl ${
              selectedTab === 'calendar' ? 'bg-white/30' : ''
            }`}
          >
            <Text className={`text-center font-medium ${
              selectedTab === 'calendar' ? 'text-white' : 'text-white/80'
            }`}>
              📅 التقويم ({Object.keys(groupEventsByDate()).length})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        {selectedTab === 'notifications' ? renderNotifications() : renderCalendar()}
      </ScrollView>
    </SafeAreaView>
  );
}
