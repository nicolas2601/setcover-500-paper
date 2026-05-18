import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
    .format(value)
    .replace('COP', '$');
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}
