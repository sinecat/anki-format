import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOptions(options: string): string {
  // 使用正则表达式匹配 A.、B.、C.、D. 及其后面的内容，并去掉选项前的字母和点
  return options.replace(/[A-D]\.\s*/g, '').split('\n').join(' | ').replaceAll(' ','');
}
