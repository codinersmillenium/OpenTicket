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

export function formatDay(date: any): string {
  return new Date(Number(date)).toLocaleDateString('id-ID', {
    weekday: 'long'
  })
}

export function dateStringToUnix(dateStr: string, inMilliseconds: boolean = false): number {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format, must be YYYY-MM-DD");
  }

  return inMilliseconds ? date.getTime() : Math.floor(date.getTime() / 1000);
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  var opt: any = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }
  return new Intl.NumberFormat('id-ID', opt).format(amount)
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
