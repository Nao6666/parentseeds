import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import {
  Smile,
  AlertTriangle,
  Zap,
  CloudRain,
  Battery,
  X,
  HeartHandshake,
} from 'lucide-react-native';
import Svg, { Line as SvgLine, Rect, Circle, G, Text as SvgText } from 'react-native-svg';
import ProgressBar from '../components/ProgressBar';
import { useEntries } from '../hooks/useEntries';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import {
  generateTimeSeriesDataFromEntries,
  calcStatsFromEntries,
} from '../lib/statsUtils';
import { emotions, emotionChartColors, emotionColors } from '../lib/constants';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  喜び: Smile,
  不安: AlertTriangle,
  怒り: Zap,
  悲しみ: CloudRain,
  疲労: Battery,
  罪悪感: X,
  愛情: HeartHandshake,
};

const periods = [
  { value: '1week', label: '1週間' },
  { value: '2weeks', label: '2週間' },
  { value: '1month', label: '1ヶ月' },
  { value: '3months', label: '3ヶ月' },
];

const chartTypes = [
  { value: 'line', label: '線' },
  { value: 'bar', label: '棒' },
];

const CHART_WIDTH = 340;
const CHART_HEIGHT = 200;
const PADDING = { top: 20, right: 10, bottom: 30, left: 30 };

export default function InsightsScreen() {
  const { user } = useSupabaseAuth();
  const { entries } = useEntries(user?.id);
  const [chartPeriod, setChartPeriod] = useState('2weeks');
  const [chartType, setChartType] = useState('line');

  const timeSeriesData = useMemo(
    () => generateTimeSeriesDataFromEntries(entries, chartPeriod),
    [entries, chartPeriod]
  );

  const emotionStats = useMemo(() => calcStatsFromEntries(entries), [entries]);

  // Calculate chart scales
  const maxValue = useMemo(() => {
    let max = 1;
    timeSeriesData.forEach((d) => {
      emotions.forEach((e) => {
        const val = (d[e] as number) || 0;
        if (val > max) max = val;
      });
    });
    return max;
  }, [timeSeriesData]);

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const renderChart = () => {
    if (timeSeriesData.length === 0) {
      return (
        <View style={styles.noData}>
          <Text style={styles.noDataText}>データがありません</Text>
        </View>
      );
    }

    const xStep = plotWidth / Math.max(timeSeriesData.length - 1, 1);

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={Math.max(CHART_WIDTH, timeSeriesData.length * 30)} height={CHART_HEIGHT}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = PADDING.top + plotHeight * (1 - ratio);
            return (
              <G key={ratio}>
                <SvgLine
                  x1={PADDING.left}
                  y1={y}
                  x2={PADDING.left + plotWidth}
                  y2={y}
                  stroke={colors.gray[200]}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <SvgText x={2} y={y + 4} fontSize={10} fill={colors.gray[400]}>
                  {Math.round(maxValue * ratio)}
                </SvgText>
              </G>
            );
          })}

          {/* Data */}
          {emotions.map((emotion) => {
            const color = emotionChartColors[emotion];
            const points = timeSeriesData.map((d, i) => ({
              x: PADDING.left + i * xStep,
              y: PADDING.top + plotHeight * (1 - ((d[emotion] as number) || 0) / maxValue),
            }));

            if (chartType === 'bar') {
              const barWidth = xStep / (emotions.length + 1);
              const emotionIndex = emotions.indexOf(emotion);
              return points.map((p, i) => {
                const barHeight = plotHeight - (p.y - PADDING.top);
                return (
                  <Rect
                    key={`${emotion}-${i}`}
                    x={p.x - (emotions.length * barWidth) / 2 + emotionIndex * barWidth}
                    y={p.y}
                    width={barWidth * 0.8}
                    height={Math.max(0, barHeight)}
                    fill={color}
                    opacity={0.8}
                    rx={2}
                  />
                );
              });
            }

            // Line chart
            const pathData = points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ');

            return (
              <G key={emotion}>
                <SvgLine
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={0}
                  stroke="none"
                />
                {/* Path as connected lines */}
                {points.map((p, i) => {
                  if (i === 0) return null;
                  const prev = points[i - 1];
                  return (
                    <SvgLine
                      key={`${emotion}-line-${i}`}
                      x1={prev.x}
                      y1={prev.y}
                      x2={p.x}
                      y2={p.y}
                      stroke={color}
                      strokeWidth={2}
                    />
                  );
                })}
                {points.map((p, i) => (
                  <Circle key={`${emotion}-dot-${i}`} cx={p.x} cy={p.y} r={3} fill={color} />
                ))}
              </G>
            );
          })}

          {/* X axis labels */}
          {timeSeriesData.map((d, i) => {
            // Show every N labels to avoid overlap
            const showEvery = Math.max(1, Math.floor(timeSeriesData.length / 7));
            if (i % showEvery !== 0) return null;
            return (
              <SvgText
                key={i}
                x={PADDING.left + i * xStep}
                y={CHART_HEIGHT - 5}
                fontSize={9}
                fill={colors.gray[500]}
                textAnchor="middle"
              >
                {d.date}
              </SvgText>
            );
          })}
        </Svg>
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Chart Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <TrendingUp size={20} color={colors.secondary} />
            <Text style={styles.title}>感情の変化</Text>
          </View>
          <Text style={styles.subtitle}>感情の変化パターンを確認できます</Text>
        </View>
        <View style={styles.cardBody}>
          {/* Period selector */}
          <View style={styles.selectorRow}>
            {periods.map((p) => (
              <Pressable
                key={p.value}
                style={[styles.selectorBtn, chartPeriod === p.value && styles.selectorBtnActive]}
                onPress={() => setChartPeriod(p.value)}
              >
                <Text
                  style={[
                    styles.selectorText,
                    chartPeriod === p.value && styles.selectorTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {/* Chart type selector */}
          <View style={styles.selectorRow}>
            {chartTypes.map((t) => (
              <Pressable
                key={t.value}
                style={[styles.selectorBtn, chartType === t.value && styles.selectorBtnActive]}
                onPress={() => setChartType(t.value)}
              >
                <Text
                  style={[
                    styles.selectorText,
                    chartType === t.value && styles.selectorTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {emotions.map((e) => (
              <View key={e} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: emotionChartColors[e] }]} />
                <Text style={styles.legendText}>{e}</Text>
              </View>
            ))}
          </View>

          {/* Chart */}
          {renderChart()}
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>ストレスレベル</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statLabel}>現在のレベル</Text>
            <Text style={styles.statValue}>{emotionStats.stressLevel}%</Text>
          </View>
          <ProgressBar value={emotionStats.stressLevel} color={colors.red[500]} />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>ポジティブ度</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statLabel}>今週の平均</Text>
            <Text style={styles.statValue}>{emotionStats.positivity}%</Text>
          </View>
          <ProgressBar value={emotionStats.positivity} color={colors.green[500]} />
        </View>
      </View>

      {/* Emotion Distribution */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>感情の分布</Text>
          <Text style={styles.subtitle}>今週記録された感情の内訳</Text>
        </View>
        <View style={styles.distributionGrid}>
          {emotions.map((emotion) => {
            const IconComponent = iconMap[emotion];
            const count = emotionStats.emotionTotals?.[emotion] ?? 0;
            const colorSet = emotionColors[emotion];
            return (
              <View key={emotion} style={styles.distributionItem}>
                <View style={[styles.distributionIcon, { backgroundColor: colorSet.bg }]}>
                  {IconComponent && <IconComponent size={20} color={colorSet.text} />}
                </View>
                <Text style={styles.distributionLabel}>{emotion}</Text>
                <Text style={styles.distributionCount}>{count}回</Text>
              </View>
            );
          })}
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
    gap: spacing.lg,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: 2,
  },
  cardBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectorBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectorBtnActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  selectorText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },
  selectorTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },
  noData: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.gray[900],
  },
  statValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  statValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[700],
  },
  distributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.md,
  },
  distributionItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
  },
  distributionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  distributionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[800],
  },
  distributionCount: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[700],
  },
});
