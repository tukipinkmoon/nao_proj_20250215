import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Challenge, Question, Answer } from "@/types";

export type GamePhase =
  | "idle"
  | "ready"
  | "memorize"
  | "playing"
  | "paused"
  | "result";

interface GameState {
  currentChallenge: Challenge | null;
  currentQuestionIndex: number;
  answers: Answer[];
  gamePhase: GamePhase;
  timeRemaining: number;
  isTimerRunning: boolean;

  // Actions
  startGame: (challenge: Challenge) => void;
  setGamePhase: (phase: GamePhase) => void;
  answerQuestion: (answer: Answer) => void;
  nextQuestion: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  finishGame: () => void;
  resetGame: () => void;
  setTimeRemaining: (time: number) => void;
  tick: () => void;

  // Computed
  getCurrentQuestion: () => Question | null;
  getProgress: () => { current: number; total: number; percent: number };
  isLastQuestion: () => boolean;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        currentChallenge: null,
        currentQuestionIndex: 0,
        answers: [],
        gamePhase: "idle",
        timeRemaining: 0,
        isTimerRunning: false,

        startGame: (challenge) =>
          set({
            currentChallenge: challenge,
            currentQuestionIndex: 0,
            answers: [],
            gamePhase: "ready",
            timeRemaining: challenge.timeLimit,
            isTimerRunning: false,
          }),

        setGamePhase: (phase) => {
          const isTimerRunning = phase === "playing" || phase === "memorize";
          set({ gamePhase: phase, isTimerRunning });
        },

        answerQuestion: (answer) =>
          set((state) => ({
            answers: [...state.answers, answer],
          })),

        nextQuestion: () =>
          set((state) => {
            const total = state.currentChallenge?.questions.length ?? 0;
            const nextIndex = state.currentQuestionIndex + 1;
            if (nextIndex >= total) {
              return { gamePhase: "result", isTimerRunning: false };
            }
            return { currentQuestionIndex: nextIndex };
          }),

        pauseGame: () =>
          set({ gamePhase: "paused", isTimerRunning: false }),

        resumeGame: () =>
          set({ gamePhase: "playing", isTimerRunning: true }),

        finishGame: () =>
          set({ gamePhase: "result", isTimerRunning: false }),

        resetGame: () =>
          set({
            currentChallenge: null,
            currentQuestionIndex: 0,
            answers: [],
            gamePhase: "idle",
            timeRemaining: 0,
            isTimerRunning: false,
          }),

        setTimeRemaining: (time) => set({ timeRemaining: time }),

        tick: () =>
          set((state) => {
            if (!state.isTimerRunning || state.timeRemaining <= 0) {
              return state.timeRemaining <= 0
                ? { timeRemaining: 0, isTimerRunning: false, gamePhase: "result" }
                : {};
            }
            return { timeRemaining: state.timeRemaining - 1 };
          }),

        getCurrentQuestion: () => {
          const { currentChallenge, currentQuestionIndex } = get();
          if (!currentChallenge) return null;
          return currentChallenge.questions[currentQuestionIndex] ?? null;
        },

        getProgress: () => {
          const { currentChallenge, currentQuestionIndex } = get();
          const total = currentChallenge?.questions.length ?? 0;
          const current = Math.min(currentQuestionIndex + 1, total);
          const percent = total > 0 ? Math.round((current / total) * 100) : 0;
          return { current, total, percent };
        },

        isLastQuestion: () => {
          const { currentChallenge, currentQuestionIndex } = get();
          if (!currentChallenge) return false;
          return currentQuestionIndex >= currentChallenge.questions.length - 1;
        },
      }),
      { name: "brain-game-store" }
    ),
    { name: "game-store" }
  )
);
