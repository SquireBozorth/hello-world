import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  if (isYesterday(dateObj)) return 'Yesterday';

  return format(dateObj, 'MMM d, yyyy');
}

export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'h:mm a');
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getDateRangeForWeek(date: Date = new Date()): { start: string; end: string } {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6); // End of week (Saturday)
  end.setHours(23, 59, 59, 999);

  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
}

export function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(format(date, 'yyyy-MM-dd'));
  }

  return dates;
}
