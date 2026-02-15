"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn, generateId } from "@/lib/utils";
import { useGameStore } from "@/stores/game";
import { useScoreStore } from "@/stores/score";
import { generateQuestions } from "@/lib/game-engine/questions";
import { calculateRawScore, calculateAccuracy } from "@/lib/game-engine/scoring";
import type {
  ChallengeCategory,
  ChallengeType,
  Challenge,
  Answer,
} from "@/types";

import QuestionCard from "@/components/game/QuestionCard";
import ResultScreen from "@/components/game/ResultScreen";

const CATEGORY_TYPES: Record<ChallengeCategory, ChallengeType> = {
  memory: "word-memory",
  attention: "stroop",        // 見当識テスト（曜日・月・季節）
  language: "anagram",        // カテゴリ分類・仲間はずれ
  math: "mental-math",        // シリアル7引き算
  spatial: "number-sequence", // 数字の逆唱・数列
};

// 臨床検査に準じた固定順序（HDS-R施行順に準拠）
const CLINICAL_ORDER: ChallengeCategory[] = [
  "attention", // 1. 見当識（日付・曜日・季節）
  "memory",    // 2. 記憶（3語記銘）
  "math",      // 3. 計算（シリアル7）
  "language",  // 4. 言語（カテゴリ分類）
  "spatial",   // 5. 注意/作業記憶（逆唱・数列）
];

export default function ChallengePage() {
  const prefersReducedMotion = useReducedMotion();

  const {
    currentChallenge,
    gamePhase,
    currentQuestionIndex,
    answers,
    startGame,
    setGamePhase,
    answerQuestion,
    nextQuestion,
    finishGame,
    resetGame,
    getCurrentQuestion,
    getProgress,
    isLastQuestion,
  } = useGameStore();

  const addScore = useScoreStore((s) => s.addScore);

  const [mode, setMode] = useState<"playing" | "result">("playing");
  const [started, setStarted] = useState(false);

  // 自動でクイズ開始（カテゴリ選択なし）
  useEffect(() => {
    if (started) return;
    setStarted(true);

    const questions = CLINICAL_ORDER.flatMap((cat) => {
      const type = CATEGORY_TYPES[cat];
      const qs = generateQuestions(type, 1); // 難易度1（いちばんやさしい）
      return qs.slice(0, 1).map((q) => ({
        ...q,
        metadata: { ...q.metadata, category: cat },
      }));
    });

    const challenge: Challenge = {
      id: generateId("daily"),
      type: "mental-math",
      category: "memory",
      difficulty: 1,
      questions,
      timeLimit: questions.length * 30, // 1問30秒（ゆったり）
      createdAt: new Date().toISOString(),
    };

    startGame(challenge);
    setTimeout(() => setGamePhase("playing"), 300);
  }, [started, startGame, setGamePhase]);

  useEffect(() => {
    if (gamePhase === "result") {
      setMode("result");
    }
  }, [gamePhase]);

  const handleAnswer = useCallback(
    (userAnswer: string, isCorrect: boolean) => {
      const question = getCurrentQuestion();
      if (!question) return;

      const answer: Answer = {
        questionId: question.id,
        userAnswer,
        isCorrect,
        responseTimeMs: Date.now() % 10000,
        answeredAt: new Date().toISOString(),
      };

      answerQuestion(answer);

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

  const resultData = useMemo(() => {
    if (gamePhase !== "result" || !currentChallenge) return null;

    const totalScore = calculateRawScore(answers);
    const accuracy = calculateAccuracy(answers);

    return { totalScore, accuracy };
  }, [gamePhase, currentChallenge, answers]);

  useEffect(() => {
    if (resultData && currentChallenge && gamePhase === "result") {
      addScore({
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
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase]);

  const handleRetry = useCallback(() => {
    resetGame();
    setMode("playing");
    setStarted(false);
  }, [resetGame]);

  const progress = getProgress();
  const currentQuestion = getCurrentQuestion();

  return (
    <div className="mx-auto w-full max-w-lg px-6 pt-6 pb-28">
      <AnimatePresence mode="wait">
        {/* クイズ実行中 */}
        {mode === "playing" && currentChallenge && currentQuestion && (
          <motion.div
            key="playing"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* ヘッダー */}
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/"
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]",
                  "bg-[var(--surface)] shadow-[var(--shadow-sm)]"
                )}
                aria-label="もどる"
              >
                <ArrowLeft className="h-6 w-6 text-[var(--foreground-secondary)]" />
              </Link>

              <p className="font-heading text-xl font-bold text-[var(--foreground)]">
                {progress.current} / {progress.total}もんめ
              </p>

              <div className="w-12" />
            </div>

            {/* 進捗バー */}
            <div className="mb-8 h-3 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--surface-secondary)]">
              <motion.div
                className="h-full rounded-[var(--radius-full)] bg-[var(--primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

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

        {/* 結果画面 */}
        {mode === "result" && resultData && (
          <motion.div
            key="result"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ResultScreen
              totalScore={resultData.totalScore}
              accuracy={resultData.accuracy}
              answers={answers}
              categoryResults={[]}
              onRetry={handleRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
