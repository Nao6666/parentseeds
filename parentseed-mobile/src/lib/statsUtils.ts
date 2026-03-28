import { Entry, EmotionStats, TimeSeriesData } from '../types';
import { emotions, positiveEmotions, negativeEmotions } from './constants';
import { getJstDateString, getWeekRange, periodToDays, formatDateShort } from './dateUtils';

/**
 * Count emotion occurrences from entries.
 */
export const countEmotions = (entries: Entry[]): Record<string, number> => {
  const emotionCount: Record<string, number> = {};
  entries.forEach((entry) => {
    entry.emotions?.forEach((emotion) => {
      emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
    });
  });
  return emotionCount;
};

/**
 * Calculate weekly emotion statistics.
 */
export const calcStatsFromEntries = (entries: Entry[]): EmotionStats => {
  const { start: weekStartStr, end: nowStr } = getWeekRange();
  const weekEntries = entries.filter((e) => e.date >= weekStartStr && e.date <= nowStr);
  const emotionTotals = countEmotions(weekEntries);
  const total = Object.values(emotionTotals).reduce((a, b) => a + b, 0) || 1;
  const negativeTotal = negativeEmotions.reduce((sum, e) => sum + (emotionTotals[e] || 0), 0);
  const positiveTotal = positiveEmotions.reduce((sum, e) => sum + (emotionTotals[e] || 0), 0);

  return {
    stressLevel: Math.round(negativeTotal / total * 100),
    positivity: Math.round(positiveTotal / total * 100),
    emotionTotals,
  };
};

/**
 * Calculate the longest consecutive recording streak.
 */
export const calcStreak = (entries: Entry[]): number => {
  if (!entries.length) return 0;
  const days = Array.from(new Set(entries.map((e) => e.date))).sort();
  let streak = 1;
  let maxStreak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }
  return maxStreak;
};

/**
 * Generate time series data from entries for charts.
 */
export const generateTimeSeriesDataFromEntries = (
  entries: Entry[],
  period: string
): TimeSeriesData[] => {
  const daysCount = periodToDays(period);
  const today = new Date();
  const days = Array.from({ length: daysCount }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (daysCount - 1 - i));
    return getJstDateString(d);
  });
  return days.map((dayStr) => {
    const dayEntries = entries.filter((e) => e.date === dayStr);
    const emotionCounts: Record<string, number> = {};
    emotions.forEach((emotion) => {
      emotionCounts[emotion] = dayEntries.reduce(
        (acc, e) => acc + (e.emotions?.includes(emotion) ? 1 : 0),
        0
      );
    });
    return {
      date: formatDateShort(dayStr),
      fullDate: dayStr,
      ...emotionCounts,
    };
  });
};

/**
 * Generate a weekly summary string.
 */
export const getWeeklySummary = (entries: Entry[]): string => {
  const { start: weekStartStr, end: nowStr } = getWeekRange();
  const weekEntries = entries.filter((e) => e.date >= weekStartStr && e.date <= nowStr);

  if (weekEntries.length === 0) return '今週の記録がありません。';

  const emotionCount = countEmotions(weekEntries);
  const topEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const latestContent = weekEntries[0]?.content || '';
  return `今週は${weekEntries.length}件の記録があり、特に「${topEmotion}」の気持ちが多く見られました。例：「${latestContent.slice(0, 30)}...」`;
};
