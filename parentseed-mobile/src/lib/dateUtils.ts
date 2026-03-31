import type { ChartPeriod } from '../types';

/** JST offset in milliseconds (UTC+9) */
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Returns YYYY-MM-DD string in JST timezone.
 * Japan does not observe daylight saving time, so the offset is constant.
 */
export function getJstDateString(date = new Date()): string {
  const jst = new Date(date.getTime() + JST_OFFSET_MS);
  return jst.toISOString().slice(0, 10);
}

/** Map chart period to number of days. */
export function periodToDays(period: ChartPeriod): number {
  const map: Record<ChartPeriod, number> = {
    '1week': 7,
    '2weeks': 14,
    '1month': 30,
    '3months': 90,
  };
  return map[period];
}

/** Get the start and end dates (JST) of the current week (Sunday-based). */
export function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  return {
    start: getJstDateString(weekStart),
    end: getJstDateString(now),
  };
}

/** Format a date string for display (Japanese short format). */
export function formatDateShort(dateStr: string): string {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

/** Format a Date object to HH:MM string in Japanese locale. */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
