import type { Answer, ChallengeCategory, CategoryScore } from "@/types";
import { mean, trendDirection } from "@/lib/utils";

// カテゴリ別重み
const CATEGORY_WEIGHTS: Record<ChallengeCategory, number> = {
  memory: 0.25,
  attention: 0.20,
  language: 0.20,
  math: 0.15,
  spatial: 0.20,
};

export function calculateRawScore(answers: Answer[]): number {
  if (answers.length === 0) return 0;

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const accuracy = correctCount / answers.length;

  // 正答率ベース + 応答速度ボーナス
  const avgTime = mean(answers.map((a) => a.responseTimeMs));
  const speedBonus = Math.max(0, 1 - avgTime / 10000) * 0.2; // 最大20%ボーナス

  return Math.round((accuracy + speedBonus) * 100);
}

export function calculateAccuracy(answers: Answer[]): number {
  if (answers.length === 0) return 0;
  return answers.filter((a) => a.isCorrect).length / answers.length;
}

export function calculateTotalScore(categoryScores: CategoryScore[]): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const cs of categoryScores) {
    const weight = CATEGORY_WEIGHTS[cs.category] ?? 0.2;
    totalWeightedScore += cs.score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
}

export function calculateCategoryTrend(
  scores: number[],
  window = 7
): { trend: "up" | "down" | "stable"; changePercent: number } {
  if (scores.length < 2) return { trend: "stable", changePercent: 0 };

  const recent = mean(scores.slice(-Math.min(window, scores.length)));
  const previous = scores.length > window
    ? mean(scores.slice(-window * 2, -window))
    : scores[0]!;

  const changePercent = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
  const trend = trendDirection(scores, window);

  return { trend, changePercent: Math.round(changePercent * 10) / 10 };
}
