import type { DifficultyLevel, ChallengeCategory } from "@/types";

interface DifficultyProfile {
  category: ChallengeCategory;
  currentLevel: DifficultyLevel;
  recentAccuracies: number[]; // 直近5回
}

const UPGRADE_THRESHOLD = 0.8;
const DOWNGRADE_THRESHOLD = 0.4;
const MIN_ATTEMPTS = 3;

export function adjustDifficulty(profile: DifficultyProfile): DifficultyLevel {
  const { currentLevel, recentAccuracies } = profile;

  if (recentAccuracies.length < MIN_ATTEMPTS) {
    return currentLevel;
  }

  const avgAccuracy = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;

  if (avgAccuracy >= UPGRADE_THRESHOLD && currentLevel < 5) {
    return (currentLevel + 1) as DifficultyLevel;
  }

  if (avgAccuracy <= DOWNGRADE_THRESHOLD && currentLevel > 1) {
    return (currentLevel - 1) as DifficultyLevel;
  }

  return currentLevel;
}

export function getInitialDifficulty(ageGroup: string): DifficultyLevel {
  switch (ageGroup) {
    case "child": return 1;
    case "teen": return 2;
    case "adult": return 3;
    case "senior": return 2;
    default: return 2;
  }
}
