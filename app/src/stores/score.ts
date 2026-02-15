import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  Score,
  DailyScore,
  CategoryScore,
  ChallengeCategory,
} from "@/types";

interface ScoreState {
  scores: Score[];
  dailyScores: DailyScore[];
  categoryScores: CategoryScore[];
  streakCount: number;
  bestStreak: number;

  // Actions
  addScore: (score: Score) => void;
  setScores: (scores: Score[]) => void;
  setDailyScores: (dailyScores: DailyScore[]) => void;
  setCategoryScores: (categoryScores: CategoryScore[]) => void;
  updateStreak: (count: number) => void;

  // Computed
  getDailyScores: (days: number) => DailyScore[];
  getCategoryTrend: (category: ChallengeCategory) => CategoryScore | null;
  getWeeklyAverage: () => number;
  getLatestScore: () => Score | null;
  getScoresByCategory: (category: ChallengeCategory) => Score[];
  getTotalScoreForDate: (date: string) => number;
}

export const useScoreStore = create<ScoreState>()(
  devtools(
    persist(
      (set, get) => ({
        scores: [],
        dailyScores: [],
        categoryScores: [],
        streakCount: 0,
        bestStreak: 0,

        addScore: (score) =>
          set((state) => {
            const scores = [...state.scores, score];

            // Update daily scores aggregation
            const dateStr = score.completedAt.slice(0, 10); // YYYY-MM-DD
            const existingDaily = state.dailyScores.find(
              (d) => d.date === dateStr
            );

            let dailyScores: DailyScore[];
            if (existingDaily) {
              dailyScores = state.dailyScores.map((d) =>
                d.date === dateStr
                  ? {
                      ...d,
                      totalScore: Math.round(
                        (d.totalScore * d.challengeCount +
                          score.normalizedScore) /
                          (d.challengeCount + 1)
                      ),
                      challengeCount: d.challengeCount + 1,
                    }
                  : d
              );
            } else {
              dailyScores = [
                ...state.dailyScores,
                {
                  date: dateStr,
                  totalScore: score.normalizedScore,
                  categoryScores: [],
                  challengeCount: 1,
                },
              ];
            }

            // Update category scores
            const categoryScores = [...state.categoryScores];
            const existingCat = categoryScores.findIndex(
              (c) => c.category === score.category
            );
            const prevScoresInCategory = scores.filter(
              (s) => s.category === score.category
            );
            const prevAvg =
              prevScoresInCategory.length > 1
                ? prevScoresInCategory
                    .slice(0, -1)
                    .reduce((sum, s) => sum + s.normalizedScore, 0) /
                  (prevScoresInCategory.length - 1)
                : score.normalizedScore;
            const changePercent =
              prevAvg > 0
                ? Math.round(
                    ((score.normalizedScore - prevAvg) / prevAvg) * 100 * 10
                  ) / 10
                : 0;
            const trend: CategoryScore["trend"] =
              changePercent > 5
                ? "up"
                : changePercent < -5
                  ? "down"
                  : "stable";

            const updatedCatScore: CategoryScore = {
              category: score.category,
              score: score.normalizedScore,
              trend,
              changePercent,
            };

            if (existingCat >= 0) {
              categoryScores[existingCat] = updatedCatScore;
            } else {
              categoryScores.push(updatedCatScore);
            }

            return { scores, dailyScores, categoryScores };
          }),

        setScores: (scores) => set({ scores }),
        setDailyScores: (dailyScores) => set({ dailyScores }),
        setCategoryScores: (categoryScores) => set({ categoryScores }),

        updateStreak: (count) =>
          set((state) => ({
            streakCount: count,
            bestStreak: Math.max(state.bestStreak, count),
          })),

        getDailyScores: (days) => {
          const { dailyScores } = get();
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          const cutoffStr = cutoff.toISOString().slice(0, 10);
          return dailyScores
            .filter((d) => d.date >= cutoffStr)
            .sort((a, b) => a.date.localeCompare(b.date));
        },

        getCategoryTrend: (category) => {
          const { categoryScores } = get();
          return categoryScores.find((c) => c.category === category) ?? null;
        },

        getWeeklyAverage: () => {
          const { dailyScores } = get();
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 7);
          const cutoffStr = cutoff.toISOString().slice(0, 10);
          const recentScores = dailyScores.filter((d) => d.date >= cutoffStr);
          if (recentScores.length === 0) return 0;
          const sum = recentScores.reduce((acc, d) => acc + d.totalScore, 0);
          return Math.round(sum / recentScores.length);
        },

        getLatestScore: () => {
          const { scores } = get();
          if (scores.length === 0) return null;
          return scores[scores.length - 1];
        },

        getScoresByCategory: (category) => {
          const { scores } = get();
          return scores.filter((s) => s.category === category);
        },

        getTotalScoreForDate: (date) => {
          const { dailyScores } = get();
          const daily = dailyScores.find((d) => d.date === date);
          return daily?.totalScore ?? 0;
        },
      }),
      { name: "brain-score-store" }
    ),
    { name: "score-store" }
  )
);
