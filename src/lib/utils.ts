import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null, opts?: Intl.DateTimeFormatOptions) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
    ...opts,
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style:    'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
