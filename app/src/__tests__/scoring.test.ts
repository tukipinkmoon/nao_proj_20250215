import { describe, it, expect } from "vitest";
import {
  calculateRawScore,
  calculateAccuracy,
  calculateTotalScore,
  calculateCategoryTrend,
} from "@/lib/game-engine/scoring";
import type { Answer, CategoryScore } from "@/types";

// ============================================================
// Helper: create Answer objects
// ============================================================
function makeAnswer(overrides: Partial<Answer> = {}): Answer {
  return {
    questionId: "q1",
    userAnswer: "a",
    isCorrect: true,
    responseTimeMs: 2000,
    answeredAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================
// calculateRawScore()
// ============================================================
describe("calculateRawScore", () => {
  it("returns a high score for all correct answers with fast response", () => {
    const answers: Answer[] = [
      makeAnswer({ isCorrect: true, responseTimeMs: 1000 }),
      makeAnswer({ isCorrect: true, responseTimeMs: 1500 }),
      makeAnswer({ isCorrect: true, responseTimeMs: 1200 }),
    ];
    const score = calculateRawScore(answers);
    // accuracy = 1.0, speedBonus > 0 => score should be > 100
    expect(score).toBeGreaterThanOrEqual(100);
  });

  it("returns a score near 0 for all incorrect answers", () => {
    const answers: Answer[] = [
      makeAnswer({ isCorrect: false, responseTimeMs: 5000 }),
      makeAnswer({ isCorrect: false, responseTimeMs: 6000 }),
      makeAnswer({ isCorrect: false, responseTimeMs: 7000 }),
    ];
    const score = calculateRawScore(answers);
    // accuracy = 0, so score based only on speed bonus (small)
    expect(score).toBeLessThanOrEqual(20);
  });

  it("returns 0 for an empty answers array", () => {
    expect(calculateRawScore([])).toBe(0);
  });
});

// ============================================================
// calculateAccuracy()
// ============================================================
describe("calculateAccuracy", () => {
  it("returns 0.6 for 3 correct out of 5", () => {
    const answers: Answer[] = [
      makeAnswer({ isCorrect: true }),
      makeAnswer({ isCorrect: true }),
      makeAnswer({ isCorrect: true }),
      makeAnswer({ isCorrect: false }),
      makeAnswer({ isCorrect: false }),
    ];
    expect(calculateAccuracy(answers)).toBeCloseTo(0.6);
  });

  it("returns 1 for all correct answers", () => {
    const answers: Answer[] = [
      makeAnswer({ isCorrect: true }),
      makeAnswer({ isCorrect: true }),
      makeAnswer({ isCorrect: true }),
    ];
    expect(calculateAccuracy(answers)).toBe(1);
  });

  it("returns 0 for an empty answers array", () => {
    expect(calculateAccuracy([])).toBe(0);
  });
});

// ============================================================
// calculateTotalScore()
// ============================================================
describe("calculateTotalScore", () => {
  it("calculates weighted average correctly", () => {
    const categoryScores: CategoryScore[] = [
      { category: "memory", score: 80, trend: "up", changePercent: 5 },
      { category: "attention", score: 60, trend: "stable", changePercent: 0 },
      { category: "language", score: 70, trend: "down", changePercent: -3 },
      { category: "math", score: 90, trend: "up", changePercent: 10 },
      { category: "spatial", score: 50, trend: "stable", changePercent: 0 },
    ];
    const result = calculateTotalScore(categoryScores);
    // Weights: memory=0.25, attention=0.20, language=0.20, math=0.15, spatial=0.20
    // Weighted sum = 80*0.25 + 60*0.20 + 70*0.20 + 90*0.15 + 50*0.20 = 20 + 12 + 14 + 13.5 + 10 = 69.5
    // Total weight = 1.0
    // Result = 69.5 / 1.0 = 69.5 => Math.round => 70
    expect(result).toBe(70);
  });

  it("returns 0 for an empty category scores array", () => {
    expect(calculateTotalScore([])).toBe(0);
  });

  it("handles a single category correctly", () => {
    const categoryScores: CategoryScore[] = [
      { category: "memory", score: 85, trend: "up", changePercent: 2 },
    ];
    const result = calculateTotalScore(categoryScores);
    // 85 * 0.25 / 0.25 = 85
    expect(result).toBe(85);
  });
});

// ============================================================
// calculateCategoryTrend()
// ============================================================
describe("calculateCategoryTrend", () => {
  it("detects upward trend for increasing scores", () => {
    const scores = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
    const result = calculateCategoryTrend(scores, 3);
    expect(result.trend).toBe("up");
    expect(result.changePercent).toBeGreaterThan(0);
  });

  it("detects downward trend for decreasing scores", () => {
    const scores = [90, 85, 80, 75, 70, 65, 60, 55, 50, 40];
    const result = calculateCategoryTrend(scores, 3);
    expect(result.trend).toBe("down");
    expect(result.changePercent).toBeLessThan(0);
  });

  it("detects stable trend for flat scores", () => {
    const scores = [50, 50, 50, 50, 50, 50, 50, 50];
    const result = calculateCategoryTrend(scores, 3);
    expect(result.trend).toBe("stable");
    expect(result.changePercent).toBe(0);
  });
});
