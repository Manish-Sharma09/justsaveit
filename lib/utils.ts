import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Trailing-edge debounce. Retained from the original implementation. */
export default function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
