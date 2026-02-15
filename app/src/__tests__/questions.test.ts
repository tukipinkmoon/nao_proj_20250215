import { describe, it, expect } from "vitest";
import {
  generateCardMatchQuestions,
  generateWordMemoryQuestions,
  generateStroopQuestions,
  generateMentalMathQuestions,
  generateAnagramQuestions,
  generateQuestions,
} from "@/lib/game-engine/questions";

// ============================================================
// generateCardMatchQuestions()
// ============================================================
describe("generateCardMatchQuestions", () => {
  it("generates 3 pairs for difficulty 1", () => {
    const questions = generateCardMatchQuestions(1);
    expect(questions).toHaveLength(1);
    const meta = questions[0]!.metadata as { pairCount: number; cards: string[] };
    expect(meta.pairCount).toBe(3);
    expect(meta.cards).toHaveLength(6); // 3 pairs = 6 cards
  });

  it("generates 10 pairs for difficulty 5", () => {
    const questions = generateCardMatchQuestions(5);
    expect(questions).toHaveLength(1);
    const meta = questions[0]!.metadata as { pairCount: number; cards: string[] };
    expect(meta.pairCount).toBe(10);
    expect(meta.cards).toHaveLength(20); // 10 pairs = 20 cards
  });
});

// ============================================================
// generateWordMemoryQuestions()
// ============================================================
describe("generateWordMemoryQuestions", () => {
  it("returns 2 questions (memorize + recall phases)", () => {
    const questions = generateWordMemoryQuestions(1);
    expect(questions).toHaveLength(2);
    const phases = questions.map(
      (q) => (q.metadata as { phase: string }).phase
    );
    expect(phases).toContain("memorize");
    expect(phases).toContain("recall");
  });
});

// ============================================================
// generateStroopQuestions()
// ============================================================
describe("generateStroopQuestions", () => {
  it("generates 5 questions for difficulty 1", () => {
    const questions = generateStroopQuestions(1);
    expect(questions).toHaveLength(5);
  });

  it("generates 15 questions for difficulty 5", () => {
    const questions = generateStroopQuestions(5);
    expect(questions).toHaveLength(15);
  });
});

// ============================================================
// generateMentalMathQuestions()
// ============================================================
describe("generateMentalMathQuestions", () => {
  it("all questions have options and a correctAnswer", () => {
    const questions = generateMentalMathQuestions(3);
    for (const q of questions) {
      expect(q.options).toBeDefined();
      expect(q.options!.length).toBeGreaterThanOrEqual(1);
      expect(q.correctAnswer).toBeDefined();
      // The correct answer should be included in options
      expect(q.options).toContain(q.correctAnswer as string);
    }
  });
});

// ============================================================
// generateAnagramQuestions()
// ============================================================
describe("generateAnagramQuestions", () => {
  it("each question has a correctAnswer", () => {
    const questions = generateAnagramQuestions(2);
    for (const q of questions) {
      expect(q.correctAnswer).toBeDefined();
      expect(typeof q.correctAnswer).toBe("string");
      expect((q.correctAnswer as string).length).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// generateQuestions() - main dispatcher
// ============================================================
describe("generateQuestions", () => {
  it("dispatches to card-match generator", () => {
    const questions = generateQuestions("card-match", 2);
    expect(questions).toHaveLength(1);
    expect(questions[0]!.type).toBe("card-match");
  });

  it("dispatches to stroop generator", () => {
    const questions = generateQuestions("stroop", 1);
    expect(questions).toHaveLength(5);
    expect(questions[0]!.type).toBe("stroop");
  });

  it("falls back to mental-math for unknown type", () => {
    // "puzzle" is not explicitly handled, so it should fall back to mental-math
    const questions = generateQuestions("puzzle", 1);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0]!.type).toBe("mental-math");
  });
});
