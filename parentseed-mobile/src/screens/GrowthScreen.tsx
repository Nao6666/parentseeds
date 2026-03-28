import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useEntries } from '../hooks/useEntries';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { calcStatsFromEntries, calcStreak, getWeeklySummary } from '../lib/statsUtils';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';

export default function GrowthScreen() {
  const { user } = useSupabaseAuth();
  const { entries } = useEntries(user?.id);

  const stats = useMemo(() => calcStatsFromEntries(entries), [entries]);
  const streak = useMemo(() => calcStreak(entries), [entries]);
  const weeklySummary = useMemo(() => getWeeklySummary(entries), [entries]);

  const controlPower = stats.positivity;
  const selfUnderstanding = Math.min(100, entries.length * 10);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>あなたの成長記録</Text>
          <Text style={styles.subtitle}>育児を通じて成長している自分を認めてあげましょう</Text>
        </View>

        <View style={styles.cardBody}>
          {/* Streak */}
          <View style={styles.streakContainer}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakNumber}>{streak}</Text>
            </View>
            <View>
              <Text style={styles.streakTitle}>連続記録日数</Text>
              <Text style={styles.streakDescription}>感情を記録し続けています</Text>
            </View>
          </View>

          {/* Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>感情コントロール力</Text>
              <ProgressBar value={controlPower} color={colors.primary} />
              <Text style={styles.metricDescription}>ポジティブ度を元に算出</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>自己理解度</Text>
              <ProgressBar value={selfUnderstanding} color={colors.secondary} />
              <Text style={styles.metricDescription}>記録数から算出</Text>
            </View>
          </View>

          {/* Weekly Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>今週のハイライト</Text>
            <Text style={styles.summaryText}>{weeklySummary}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
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
  cardBody: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
  },
  streakBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
  },
  streakTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.gray[900],
  },
  streakDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  metricTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[900],
  },
  metricDescription: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  summaryBox: {
    backgroundColor: colors.blue[50],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  summaryTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.blue[800],
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: fontSize.sm,
    color: colors.blue[700],
    lineHeight: 22,
  },
});
