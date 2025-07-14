import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomHexColor(): string {
  const hue = Math.floor(Math.random() * 360);      // any hue
  const saturation = Math.floor(Math.random() * 30) + 50; // 50% to 80%
  const lightness = Math.floor(Math.random() * 20) + 30;  // 30% to 50% (moderate-dark)

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}