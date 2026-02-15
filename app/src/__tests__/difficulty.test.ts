import { describe, it, expect } from "vitest";
import { adjustDifficulty, getInitialDifficulty } from "@/lib/game-engine/difficulty";

// ============================================================
// adjustDifficulty()
// ============================================================
describe("adjustDifficulty", () => {
  it("increases difficulty when accuracy >= 80%", () => {
    const result = adjustDifficulty({
      category: "memory",
      currentLevel: 3,
      recentAccuracies: [0.9, 0.85, 0.9, 0.8, 0.95],
    });
    expect(result).toBe(4);
  });

  it("decreases difficulty when accuracy <= 40%", () => {
    const result = adjustDifficulty({
      category: "math",
      currentLevel: 3,
      recentAccuracies: [0.3, 0.2, 0.4, 0.35, 0.25],
    });
    expect(result).toBe(2);
  });

  it("maintains difficulty when accuracy is between 40% and 80%", () => {
    const result = adjustDifficulty({
      category: "attention",
      currentLevel: 3,
      recentAccuracies: [0.6, 0.5, 0.7, 0.55, 0.65],
    });
    expect(result).toBe(3);
  });

  it("does not exceed level 5 (upper bound)", () => {
    const result = adjustDifficulty({
      category: "memory",
      currentLevel: 5,
      recentAccuracies: [0.9, 0.95, 0.85, 0.9, 0.88],
    });
    expect(result).toBe(5);
  });

  it("does not go below level 1 (lower bound)", () => {
    const result = adjustDifficulty({
      category: "language",
      currentLevel: 1,
      recentAccuracies: [0.1, 0.2, 0.3, 0.15, 0.25],
    });
    expect(result).toBe(1);
  });

  it("maintains current level when fewer than 3 attempts", () => {
    const result = adjustDifficulty({
      category: "spatial",
      currentLevel: 3,
      recentAccuracies: [0.9, 0.95],
    });
    expect(result).toBe(3);
  });

  it("maintains current level with exactly 0 attempts", () => {
    const result = adjustDifficulty({
      category: "math",
      currentLevel: 4,
      recentAccuracies: [],
    });
    expect(result).toBe(4);
  });
});

// ============================================================
// getInitialDifficulty()
// ============================================================
describe("getInitialDifficulty", () => {
  it("returns 1 for child", () => {
    expect(getInitialDifficulty("child")).toBe(1);
  });

  it("returns 2 for teen", () => {
    expect(getInitialDifficulty("teen")).toBe(2);
  });

  it("returns 3 for adult", () => {
    expect(getInitialDifficulty("adult")).toBe(3);
  });

  it("returns 2 for senior", () => {
    expect(getInitialDifficulty("senior")).toBe(2);
  });
});
