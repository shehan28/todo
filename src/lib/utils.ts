import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatString: string = 'MMM dd, yyyy'): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) {
    return 'Invalid date';
  }
  
  return format(parsedDate, formatString);
}

export function isOverdue(date: string): boolean {
  const dueDate = new Date(date);
  const today = new Date();
  
  // Reset time part for both dates for accurate comparison
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}