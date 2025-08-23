import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: any): string {
  return new Date(Number(date)).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export function dateStringToUnix(dateStr: string, inMilliseconds: boolean = false): number {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format, must be YYYY-MM-DD");
  }

  return inMilliseconds ? date.getTime() : Math.floor(date.getTime() / 1000);
}
