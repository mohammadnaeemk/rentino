import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatJalali } from "./format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Jalali date alias for legacy call sites (kept to avoid breaking imports). */
export function formatDate(date: string | Date): string {
  return formatJalali(date, "medium");
}
