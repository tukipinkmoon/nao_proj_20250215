import { describe, it, expect } from "vitest";
import {
  mean,
  standardDeviation,
  movingAverage,
  trendDirection,
  normalizeScore,
  shuffleArray,
  generateId,
} from "@/lib/utils";

// ============================================================
// mean()
// ============================================================
describe("mean", () => {
  it("returns 0 for an empty array", () => {
    expect(mean([])).toBe(0);
  });

  it("calculates the average of [10, 20, 30]", () => {
    expect(mean([10, 20, 30])).toBe(20);
  });

  it("handles negative numbers correctly", () => {
    expect(mean([-10, 0, 10])).toBe(0);
  });
});

// ============================================================
// standardDeviation()
// ============================================================
describe("standardDeviation", () => {
  it("returns 0 for a single-element array", () => {
    expect(standardDeviation([42])).toBe(0);
  });

  it("calculates standard deviation of [2,4,4,4,5,5,7,9]", () => {
    const result = standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
    // Population std dev = 2.0
    expect(result).toBeCloseTo(2.0, 1);
  });
});

// ============================================================
// movingAverage()
// ============================================================
describe("movingAverage", () => {
  it("computes moving average with window=3 for [1,2,3,4,5]", () => {
    const result = movingAverage([1, 2, 3, 4, 5], 3);
    expect(result).toEqual([2, 3, 4]);
  });

  it("returns [mean(values)] when array length < window", () => {
    const result = movingAverage([5, 10], 5);
    expect(result).toEqual([7.5]);
  });
});

// ============================================================
// trendDirection()
// ============================================================
describe("trendDirection", () => {
  it("detects upward trend", () => {
    // Steadily increasing values
    const values = [10, 12, 14, 16, 18, 20, 25, 30];
    expect(trendDirection(values, 3)).toBe("up");
  });

  it("detects downward trend", () => {
    // Steadily decreasing values
    const values = [30, 25, 20, 18, 16, 14, 12, 8];
    expect(trendDirection(values, 3)).toBe("down");
  });

  it("detects stable trend", () => {
    // Flat values
    const values = [50, 50, 50, 50, 50, 50, 50, 50];
    expect(trendDirection(values, 3)).toBe("stable");
  });
});

// ============================================================
// normalizeScore()
// ============================================================
describe("normalizeScore", () => {
  it("normalizes to 0-100 range", () => {
    expect(normalizeScore(50, 0, 100)).toBe(50);
    expect(normalizeScore(75, 0, 100)).toBe(75);
  });

  it("returns 50 when min equals max", () => {
    expect(normalizeScore(10, 10, 10)).toBe(50);
  });

  it("clamps boundary values correctly", () => {
    // Below min should clamp to 0
    expect(normalizeScore(-10, 0, 100)).toBe(0);
    // Above max should clamp to 100
    expect(normalizeScore(150, 0, 100)).toBe(100);
  });
});

// ============================================================
// shuffleArray()
// ============================================================
describe("shuffleArray", () => {
  it("preserves array length", () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffleArray(original);
    expect(result).toHaveLength(original.length);
  });

  it("preserves all elements", () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffleArray(original);
    expect(result.sort()).toEqual(original.sort());
  });
});

// ============================================================
// generateId()
// ============================================================
describe("generateId", () => {
  it("generates an ID with the given prefix", () => {
    const id = generateId("test");
    expect(id).toMatch(/^test-/);
  });

  it("generates unique IDs on consecutive calls", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});
