import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRating(value: number | null | undefined): string {
  if (value == null) return 'Sin calificaciones'
  return value.toFixed(1)
}

export function getRatingLabel(value: number): string {
  if (value >= 4.5) return 'Excelente'
  if (value >= 3.5) return 'Bueno'
  if (value >= 2.5) return 'Regular'
  if (value >= 1.5) return 'Malo'
  return 'Muy malo'
}

export function getRatingColor(value: number): string {
  if (value >= 4.5) return 'text-green-600'
  if (value >= 3.5) return 'text-blue-600'
  if (value >= 2.5) return 'text-yellow-600'
  if (value >= 1.5) return 'text-orange-600'
  return 'text-red-600'
}

export function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function isValidPucvEmail(email: string): boolean {
  return email.endsWith('@pucv.cl') || email.endsWith('@alu.ucv.cl')
}
