import type { Entry, EmotionStats, TimeSeriesDataPoint, ChartPeriod, EmotionType } from '../types';
import { emotions, positiveEmotions, negativeEmotions } from './constants';
import { getJstDateString, getWeekRange, periodToDays, formatDateShort } from './dateUtils';

/** Count emotion occurrences from entries. */
export function countEmotions(entries: Entry[]): Partial<Record<EmotionType, number>> {
  const counts: Partial<Record<EmotionType, number>> = {};
  for (const entry of entries) {
    for (const emotion of entry.emotions) {
      counts[emotion] = (counts[emotion] ?? 0) + 1;
    }
  }
  return counts;
}

/** Calculate weekly emotion statistics. */
export function calcStatsFromEntries(entries: Entry[]): EmotionStats {
  const { start, end } = getWeekRange();
  const weekEntries = entries.filter((e) => e.date >= start && e.date <= end);
  const emotionTotals = countEmotions(weekEntries);

  const total = Object.values(emotionTotals).reduce((a, b) => a + (b ?? 0), 0);
  if (total === 0) {
    return { stressLevel: 0, positivity: 0, emotionTotals };
  }

  const negativeTotal = negativeEmotions.reduce((sum, e) => sum + (emotionTotals[e] ?? 0), 0);
  const positiveTotal = positiveEmotions.reduce((sum, e) => sum + (emotionTotals[e] ?? 0), 0);

  return {
    stressLevel: Math.round((negativeTotal / total) * 100),
    positivity: Math.round((positiveTotal / total) * 100),
    emotionTotals,
  };
}

/** Calculate the longest consecutive recording streak in days. */
export function calcStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;

  const uniqueDays = Array.from(new Set(entries.map((e) => e.date))).sort();
  let streak = 1;
  let maxStreak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (Math.abs(diffDays - 1) < 0.01) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }

  return maxStreak;
}

/** Generate time-series data from entries for charts. */
export function generateTimeSeriesData(
  entries: Entry[],
  period: ChartPeriod,
): TimeSeriesDataPoint[] {
  const daysCount = periodToDays(period);
  const today = new Date();

  return Array.from({ length: daysCount }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const dayStr = getJstDateString(d);
    const dayEntries = entries.filter((e) => e.date === dayStr);

    const emotionCounts: Record<string, number> = {};
    for (const emotion of emotions) {
      emotionCounts[emotion] = dayEntries.reduce(
        (acc, e) => acc + (e.emotions.includes(emotion) ? 1 : 0),
        0,
      );
    }

    return {
      date: formatDateShort(dayStr),
      fullDate: dayStr,
      ...emotionCounts,
    };
  });
}

/** Generate a weekly summary text. */
export function getWeeklySummary(entries: Entry[]): string {
  const { start, end } = getWeekRange();
  const weekEntries = entries.filter((e) => e.date >= start && e.date <= end);

  if (weekEntries.length === 0) return '今週の記録がありません。';

  const emotionCount = countEmotions(weekEntries);
  const topEmotion = Object.entries(emotionCount)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]?.[0] ?? '';
  const latestContent = weekEntries[0]?.content ?? '';
  const preview = latestContent.length > 30 ? `${latestContent.slice(0, 30)}...` : latestContent;

  return `今週は${weekEntries.length}件の記録があり、特に「${topEmotion}」の気持ちが多く見られました。例：「${preview}」`;
}
