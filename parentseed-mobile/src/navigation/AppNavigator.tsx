import React, { useCallback } from 'react';
import { Pressable, Alert, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  MessageCircle,
  Calendar,
  Brain,
  MessageSquare,
  TrendingUp,
  LogOut,
} from 'lucide-react-native';
import RecordScreen from '../screens/RecordScreen';
import HistoryScreen from '../screens/HistoryScreen';
import InsightsScreen from '../screens/InsightsScreen';
import CounselorScreen from '../screens/CounselorScreen';
import GrowthScreen from '../screens/GrowthScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { colors } from '../theme/colors';
import type { AppTabParamList, AppStackParamList } from '../types';

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

function CounselorHeaderTitle() {
  return (
    <View>
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.gray[900] }}>
        AIカウンセラー
      </Text>
      <Text style={{ fontSize: 12, color: colors.gray[500] }}>
        24時間いつでも相談できます
      </Text>
    </View>
  );
}

function MainTabs() {
  const { signOut } = useSupabaseAuth();

  const handleSignOut = useCallback(() => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'ログアウト', onPress: () => signOut() },
    ]);
  }, [signOut]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[200],
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: colors.gray[900],
        },
        headerRight: () => (
          <Pressable onPress={handleSignOut} style={{ marginRight: 16 }} hitSlop={8}>
            <LogOut size={22} color={colors.gray[500]} />
          </Pressable>
        ),
      }}
    >
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{
          title: '記録',
          headerTitle: 'ParentSeed',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: '履歴',
          headerTitle: 'ParentSeed',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: '分析',
          headerTitle: 'ParentSeed',
          tabBarIcon: ({ color, size }) => <Brain size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Counselor"
        component={CounselorScreen}
        options={{
          title: '相談',
          headerTitle: CounselorHeaderTitle,
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Growth"
        component={GrowthScreen}
        options={{
          title: '成長',
          headerTitle: 'ParentSeed',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{
          title: 'アカウント削除',
          headerTintColor: colors.red[600],
          headerBackTitle: '戻る',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
