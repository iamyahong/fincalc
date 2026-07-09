import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

export function formatPercent(value: number, decimals = 2): string {
  return value.toFixed(decimals) + "%";
}
