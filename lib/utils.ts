import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names into a single string, 
 * using clsx for conditional classes and tailwind-merge for de-duplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 