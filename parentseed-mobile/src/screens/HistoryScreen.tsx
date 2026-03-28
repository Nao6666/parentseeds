import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import EntryCard from '../components/EntryCard';
import { useEntries } from '../hooks/useEntries';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { colors } from '../theme/colors';
import { fontSize, spacing } from '../theme/spacing';
import type { Entry } from '../types';

export default function HistoryScreen() {
  const { user } = useSupabaseAuth();
  const { entries, loading, deleteEntry, refresh } = useEntries(user?.id);

  const renderItem = ({ item }: { item: Entry }) => (
    <EntryCard entry={item} onDelete={deleteEntry} />
  );

  if (loading && entries.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>感情の記録</Text>
        <Text style={styles.subtitle}>これまでの感情の変化を振り返ってみましょう</Text>
      </View>
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>まだ記録がありません</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: 4,
  },
  list: {
    padding: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['4xl'],
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
  },
});
