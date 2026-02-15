import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 日付ユーティリティ
export function formatDate(date: string | Date, format: "short" | "long" | "time" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (format === "time") {
    return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  }
  if (format === "long") {
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
  }
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export function isToday(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export function getDateKey(date?: Date): string {
  const d = date ?? new Date();
  return d.toISOString().split("T")[0]!;
}

// 統計ユーティリティ
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(mean(squareDiffs));
}

export function movingAverage(values: number[], window: number): number[] {
  if (values.length < window) return [mean(values)];
  const result: number[] = [];
  for (let i = window - 1; i < values.length; i++) {
    const slice = values.slice(i - window + 1, i + 1);
    result.push(mean(slice));
  }
  return result;
}

export function trendDirection(values: number[], window = 7): "up" | "down" | "stable" {
  if (values.length < 2) return "stable";
  const ma = movingAverage(values, Math.min(window, values.length));
  if (ma.length < 2) return "stable";
  const recent = ma[ma.length - 1]!;
  const previous = ma[ma.length - 2]!;
  const change = ((recent - previous) / (previous || 1)) * 100;
  if (change > 3) return "up";
  if (change < -3) return "down";
  return "stable";
}

// スコア正規化
export function normalizeScore(raw: number, min: number, max: number): number {
  if (max === min) return 50;
  const normalized = ((raw - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

// ランダム
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

// ID生成
export function generateId(prefix = ""): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return prefix ? `${prefix}-${ts}-${rand}` : `${ts}-${rand}`;
}
