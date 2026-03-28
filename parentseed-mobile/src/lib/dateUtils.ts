/**
 * Returns YYYY-MM-DD string in JST timezone.
 */
export const getJstDateString = (date = new Date()): string => {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
};

/**
 * Convert chart period string to number of days.
 */
export const periodToDays = (period: string): number => {
  switch (period) {
    case '1week':
      return 7;
    case '2weeks':
      return 14;
    case '1month':
      return 30;
    case '3months':
      return 90;
    default:
      return 14;
  }
};

/**
 * Get the start and end dates of the current week (Sunday-based).
 */
export const getWeekRange = (): { start: string; end: string } => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  return {
    start: getJstDateString(weekStart),
    end: getJstDateString(now),
  };
};

/**
 * Format a date string for display (Japanese short format).
 */
export const formatDateShort = (dateStr: string): string => {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
};

/**
 * Format a Date object to HH:MM string.
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
