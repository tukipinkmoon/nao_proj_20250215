"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Brain,
  Eye,
  MessageCircle,
  Calculator,
  Box,
  Shuffle,
  ArrowLeft,
  Pause,
  Play,
} from "lucide-react";
import Link from "next/link";
import { cn, generateId } from "@/lib/utils";
import { useGameStore } from "@/stores/game";
import { useScoreStore } from "@/stores/score";
import { generateQuestions } from "@/lib/game-engine/questions";
import { calculateRawScore, calculateAccuracy } from "@/lib/game-engine/scoring";
import { CATEGORY_INFO } from "@/types";
import type {
  ChallengeCategory,
  ChallengeType,
  Challenge,
  Answer,
} from "@/types";

import QuestionCard from "@/components/game/QuestionCard";
import TimerBar from "@/components/game/TimerBar";
import ResultScreen from "@/components/game/ResultScreen";

// ============================================================
// カテゴリ設定
// ============================================================

const CATEGORY_ICONS: Record<ChallengeCategory, typeof Brain> = {
  memory: Brain,
  attention: Eye,
  language: MessageCircle,
  math: Calculator,
  spatial: Box,
};

const CATEGORY_DESCRIPTIONS: Record<ChallengeCategory, string> = {
  memory: "ものを覚えてカードをめくろう！",
  attention: "色と文字をすばやく見分けよう！",
  language: "ことばのパズルに挑戦！",
  math: "かんたんな計算で脳をきたえよう！",
  spatial: "かたちとパズルに挑戦！",
};

const CATEGORY_TYPES: Record<ChallengeCategory, ChallengeType> = {
  memory: "word-memory",
  attention: "stroop",
  language: "anagram",
  math: "mental-math",
  spatial: "mental-math", // 空間はまだ未実装なのでmathで代替
};

const CATEGORY_EMOJI: Record<ChallengeCategory, string> = {
  memory: "🧠",
  attention: "👁",
  language: "💬",
  math: "🔢",
  spatial: "📦",
};

const ALL_CATEGORIES: ChallengeCategory[] = [
  "memory",
  "attention",
  "language",
  "math",
  "spatial",
];

// ============================================================
// メインページ
// ============================================================

export default function ChallengePage() {
  const prefersReducedMotion = useReducedMotion();

  // Store
  const {
    currentChallenge,
    gamePhase,
    currentQuestionIndex,
    answers,
    timeRemaining,
    isTimerRunning,
    startGame,
    setGamePhase,
    answerQuestion,
    nextQuestion,
    pauseGame,
    resumeGame,
    finishGame,
    resetGame,
    tick,
    getCurrentQuestion,
    getProgress,
    isLastQuestion,
  } = useGameStore();

  const addScore = useScoreStore((s) => s.addScore);

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | null>(null);
  const [mode, setMode] = useState<"select" | "playing" | "result">("select");
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (isTimerRunning) {
      tickRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isTimerRunning, tick]);

  // Watch for game phase changes
  useEffect(() => {
    if (gamePhase === "result") {
      setMode("result");
    }
  }, [gamePhase]);

  // ============================================================
  // カテゴリ選択 → ゲーム開始
  // ============================================================

  const handleStartCategory = useCallback(
    (category: ChallengeCategory) => {
      const challengeType = CATEGORY_TYPES[category];
      const questions = generateQuestions(challengeType, 2);

      const challenge: Challenge = {
        id: generateId("ch"),
        type: challengeType,
        category,
        difficulty: 2,
        questions,
        timeLimit: questions.length * 15, // 1問15秒
        createdAt: new Date().toISOString(),
      };

      setSelectedCategory(category);
      startGame(challenge);
      setMode("playing");
      // 少し待ってからプレイ開始
      setTimeout(() => setGamePhase("playing"), 500);
    },
    [startGame, setGamePhase]
  );

  // おまかせ: ランダム5問
  const handleDailyChallenge = useCallback(() => {
    const shuffled = [...ALL_CATEGORIES].sort(() => Math.random() - 0.5);
    const questions = shuffled.flatMap((cat) => {
      const type = CATEGORY_TYPES[cat];
      const qs = generateQuestions(type, 2);
      // 各カテゴリから1問ずつ
      return qs.slice(0, 1).map((q) => ({
        ...q,
        metadata: { ...q.metadata, category: cat },
      }));
    });

    const challenge: Challenge = {
      id: generateId("daily"),
      type: "mental-math",
      category: "memory", // 総合
      difficulty: 2,
      questions,
      timeLimit: questions.length * 15,
      createdAt: new Date().toISOString(),
    };

    setSelectedCategory(null);
    startGame(challenge);
    setMode("playing");
    setTimeout(() => setGamePhase("playing"), 500);
  }, [startGame, setGamePhase]);

  // ============================================================
  // 回答
  // ============================================================

  const handleAnswer = useCallback(
    (userAnswer: string, isCorrect: boolean) => {
      const question = getCurrentQuestion();
      if (!question) return;

      const answer: Answer = {
        questionId: question.id,
        userAnswer,
        isCorrect,
        responseTimeMs: Date.now() % 10000, // 簡易的な測定
        answeredAt: new Date().toISOString(),
      };

      answerQuestion(answer);

      // 次の問題 or 終了
      setTimeout(() => {
        if (isLastQuestion()) {
          finishGame();
        } else {
          nextQuestion();
        }
      }, prefersReducedMotion ? 200 : 600);
    },
    [getCurrentQuestion, answerQuestion, isLastQuestion, finishGame, nextQuestion, prefersReducedMotion]
  );

  // ============================================================
  // 結果計算
  // ============================================================

  const resultData = useMemo(() => {
    if (gamePhase !== "result" || !currentChallenge) return null;

    const totalScore = calculateRawScore(answers);
    const accuracy = calculateAccuracy(answers);

    // カテゴリ別集計
    const categoryMap = new Map<ChallengeCategory, Answer[]>();
    answers.forEach((ans, idx) => {
      const q = currentChallenge.questions[idx];
      if (!q) return;
      const cat =
        (q.metadata?.category as ChallengeCategory) || currentChallenge.category;
      const existing = categoryMap.get(cat) || [];
      existing.push(ans);
      categoryMap.set(cat, existing);
    });

    const categoryResults = Array.from(categoryMap.entries()).map(
      ([category, catAnswers]) => {
        const correct = catAnswers.filter((a) => a.isCorrect).length;
        const score =
          catAnswers.length > 0 ? Math.round((correct / catAnswers.length) * 100) : 0;
        return { category, score, correct, total: catAnswers.length };
      }
    );

    return { totalScore, accuracy, categoryResults };
  }, [gamePhase, currentChallenge, answers]);

  // スコア保存
  useEffect(() => {
    if (resultData && currentChallenge && gamePhase === "result") {
      const score = {
        id: generateId("sc"),
        userId: "current-user",
        challengeId: currentChallenge.id,
        category: currentChallenge.category,
        rawScore: resultData.totalScore,
        normalizedScore: resultData.totalScore,
        accuracy: resultData.accuracy,
        averageResponseTime: 0,
        difficulty: currentChallenge.difficulty,
        completedAt: new Date().toISOString(),
      };
      addScore(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase]);

  // リトライ
  const handleRetry = useCallback(() => {
    resetGame();
    setMode("select");
    setSelectedCategory(null);
  }, [resetGame]);

  // 戻る
  const handleBack = useCallback(() => {
    resetGame();
    setMode("select");
    setSelectedCategory(null);
  }, [resetGame]);

  const progress = getProgress();
  const currentQuestion = getCurrentQuestion();

  // ============================================================
  // レンダリング
  // ============================================================

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-4 pb-24">
      <AnimatePresence mode="wait">
        {/* ============================
            カテゴリ選択
            ============================ */}
        {mode === "select" && (
          <motion.div
            key="select"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            {/* ヘッダー */}
            <div className="mb-6 flex items-center gap-3">
              <Link
                href="/"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]",
                  "bg-[var(--surface)] shadow-[var(--shadow-sm)]",
                  "transition-colors hover:bg-[var(--surface-secondary)]"
                )}
                aria-label="ホームにもどる"
              >
                <ArrowLeft className="h-5 w-5 text-[var(--foreground-secondary)]" />
              </Link>
              <h1 className="font-heading text-xl font-bold text-[var(--foreground)]">
                チャレンジ
              </h1>
            </div>

            {/* おまかせトレーニング */}
            <motion.button
              onClick={handleDailyChallenge}
              className={cn(
                "mb-6 flex w-full items-center gap-4 rounded-[var(--radius-xl)] p-5",
                "bg-[var(--primary)] text-white",
                "shadow-[var(--shadow-lg)]",
                "transition-transform duration-150 active:scale-[0.98]"
              )}
              initial={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Shuffle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-heading text-lg font-bold">
                  おまかせトレーニング
                </p>
                <p className="mt-0.5 text-sm opacity-80">
                  全カテゴリからランダム5問
                </p>
              </div>
            </motion.button>

            {/* カテゴリ一覧 */}
            <h2 className="mb-3 font-heading text-sm font-bold text-[var(--foreground-secondary)]">
              カテゴリをえらぶ
            </h2>
            <div className="flex flex-col gap-3">
              {ALL_CATEGORIES.map((cat, idx) => {
                const info = CATEGORY_INFO[cat];
                const Icon = CATEGORY_ICONS[cat];
                const desc = CATEGORY_DESCRIPTIONS[cat];
                const emoji = CATEGORY_EMOJI[cat];

                return (
                  <motion.button
                    key={cat}
                    onClick={() => handleStartCategory(cat)}
                    className={cn(
                      "flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4",
                      "shadow-[var(--shadow-sm)]",
                      "transition-all duration-150",
                      "hover:border-[var(--primary-light)] hover:shadow-[var(--shadow-md)]",
                      "active:scale-[0.98]"
                    )}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: 12 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : 0.1 + idx * 0.06,
                    }}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] text-2xl"
                      style={{ backgroundColor: `${info.color}18` }}
                    >
                      {emoji}
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className="font-heading text-base font-bold"
                        style={{ color: info.color }}
                      >
                        {info.nameJa}
                      </p>
                      <p className="mt-0.5 font-ui text-xs text-[var(--foreground-secondary)]">
                        {desc}
                      </p>
                    </div>
                    <Icon
                      className="h-5 w-5"
                      style={{ color: info.color }}
                      strokeWidth={1.5}
                    />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ============================
            ゲーム実行中
            ============================ */}
        {mode === "playing" && currentChallenge && currentQuestion && (
          <motion.div
            key="playing"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            {/* ゲームヘッダー */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleBack}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]",
                  "bg-[var(--surface)] shadow-[var(--shadow-sm)]",
                  "transition-colors hover:bg-[var(--surface-secondary)]"
                )}
                aria-label="やめる"
              >
                <ArrowLeft className="h-5 w-5 text-[var(--foreground-secondary)]" />
              </button>

              {/* 進捗 */}
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-bold text-[var(--foreground)]">
                  {progress.current}/{progress.total}問目
                </span>
              </div>

              {/* 一時停止 */}
              <button
                onClick={gamePhase === "paused" ? resumeGame : pauseGame}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]",
                  "bg-[var(--surface)] shadow-[var(--shadow-sm)]",
                  "transition-colors hover:bg-[var(--surface-secondary)]"
                )}
                aria-label={gamePhase === "paused" ? "つづける" : "いちじていし"}
              >
                {gamePhase === "paused" ? (
                  <Play className="h-5 w-5 text-[var(--primary)]" />
                ) : (
                  <Pause className="h-5 w-5 text-[var(--foreground-secondary)]" />
                )}
              </button>
            </div>

            {/* 進捗バー */}
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--surface-secondary)]">
              <motion.div
                className="h-full rounded-[var(--radius-full)] bg-[var(--primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* タイマー */}
            <TimerBar
              timeRemaining={timeRemaining}
              totalTime={currentChallenge.timeLimit}
              className="mb-6"
            />

            {/* 一時停止オーバーレイ */}
            <AnimatePresence>
              {gamePhase === "paused" && (
                <motion.div
                  className={cn(
                    "fixed inset-0 z-50 flex items-center justify-center",
                    "bg-[var(--background)]/90 backdrop-blur-sm"
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <p className="font-heading text-xl font-bold text-[var(--foreground)]">
                      いちじていし
                    </p>
                    <button
                      onClick={resumeGame}
                      className={cn(
                        "min-h-[52px] rounded-[var(--radius-lg)] bg-[var(--primary)] px-8 py-3",
                        "font-heading text-base font-bold text-white",
                        "transition-transform duration-150 active:scale-95"
                      )}
                    >
                      つづける
                    </button>
                    <button
                      onClick={handleBack}
                      className="font-ui text-sm text-[var(--foreground-secondary)] underline"
                    >
                      やめてもどる
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 問題カード */}
            <AnimatePresence mode="wait">
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={handleAnswer}
                disabled={gamePhase === "paused"}
              />
            </AnimatePresence>
          </motion.div>
        )}

        {/* ============================
            結果画面
            ============================ */}
        {mode === "result" && resultData && (
          <motion.div
            key="result"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          >
            <ResultScreen
              totalScore={resultData.totalScore}
              accuracy={resultData.accuracy}
              answers={answers}
              categoryResults={resultData.categoryResults}
              onRetry={handleRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
