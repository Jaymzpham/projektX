import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const statusColors: Record<string, string> = {
  GREEN: 'bg-green-100 text-green-700',
  YELLOW: 'bg-yellow-100 text-yellow-700',
  RED: 'bg-red-100 text-red-700',
  DONE: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  NOT_STARTED: 'bg-gray-100 text-gray-600',
  BLOCKED: 'bg-red-100 text-red-700',
  OPEN: 'bg-orange-100 text-orange-700',
  MITIGATED: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  RESOLVED: 'bg-green-100 text-green-700',
}

export const statusLabels: Record<string, string> = {
  GREEN: 'Grön',
  YELLOW: 'Gul',
  RED: 'Röd',
  DONE: 'Klar',
  IN_PROGRESS: 'Pågående',
  NOT_STARTED: 'Ej startad',
  BLOCKED: 'Blockerad',
  OPEN: 'Öppen',
  MITIGATED: 'Mitigerad',
  CLOSED: 'Stängd',
  RESOLVED: 'Löst',
}

export const impactColors: Record<string, string> = {
  HIGH: 'text-red-600 font-semibold',
  MEDIUM: 'text-yellow-600 font-semibold',
  LOW: 'text-green-600',
}
