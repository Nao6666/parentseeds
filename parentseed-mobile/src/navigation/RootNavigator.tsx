import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useNotifications } from '../hooks/useNotifications';
import { colors } from '../theme/colors';

export default function RootNavigator() {
  const { user, loading } = useSupabaseAuth();

  // Register for push notifications when user is authenticated
  useNotifications(user?.id);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
});
