"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Home, RotateCcw, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORY_INFO } from "@/types";
import type { ChallengeCategory, Answer } from "@/types";

interface CategoryResult {
  category: ChallengeCategory;
  score: number;
  correct: number;
  total: number;
}

interface ResultScreenProps {
  totalScore: number;
  accuracy: number;
  answers: Answer[];
  categoryResults: CategoryResult[];
  onRetry: () => void;
}

// 紙吹雪パーティクル
function Confetti() {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return null;

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        size: 6 + Math.random() * 6,
        color: [
          "var(--primary)",
          "var(--accent)",
          "var(--info)",
          "var(--success)",
          "var(--secondary-light)",
        ][i % 5]!,
        rotation: Math.random() * 360,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: [0, 500],
            rotate: [0, p.rotation + 360],
            opacity: [1, 1, 0],
            x: [0, (Math.random() - 0.5) * 80],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// スコアのカウントアップ
function AnimatedScore({ target }: { target: number }) {
  const prefersReducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState(prefersReducedMotion ? target : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayed(target);
      return;
    }

    let frame: number;
    const duration = 1200;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = 1 - Math.pow(2, -10 * progress);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, prefersReducedMotion]);

  return <>{displayed}</>;
}

// キャラクターコメント
function getCharacterComment(score: number): { emoji: string; message: string } {
  if (score >= 90) return { emoji: "🎉", message: "すばらしい！天才だね！" };
  if (score >= 70) return { emoji: "😄", message: "よくがんばったね！すごいよ！" };
  if (score >= 50) return { emoji: "😊", message: "いい調子！つぎはもっとできるよ！" };
  if (score >= 30) return { emoji: "💪", message: "がんばったね！れんしゅうすればもっと伸びるよ！" };
  return { emoji: "🤗", message: "チャレンジしてえらい！また一緒にがんばろう！" };
}

export default function ResultScreen({
  totalScore,
  accuracy,
  answers,
  categoryResults,
  onRetry,
}: ResultScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const isHighScore = totalScore >= 70;
  const { emoji, message } = getCharacterComment(totalScore);
  const correctCount = answers.filter((a) => a.isCorrect).length;

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col items-center px-4 pt-6">
      {/* 紙吹雪 */}
      {isHighScore && <Confetti />}

      {/* スコア */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/20">
          <Trophy className="h-8 w-8 text-[var(--accent)]" />
        </div>
        <p className="font-heading text-base font-bold text-[var(--foreground-secondary)]">
          スコア
        </p>
        <p className="font-heading text-6xl font-bold text-[var(--primary)]">
          <AnimatedScore target={totalScore} />
        </p>
        <p className="font-ui text-sm text-[var(--foreground-secondary)]">
          {correctCount}/{answers.length}問せいかい（正答率 {Math.round(accuracy * 100)}%）
        </p>
      </motion.div>

      {/* キャラクターコメント */}
      <motion.div
        className="mt-6 flex w-full items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--primary)]/10 p-4"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.3 }}
      >
        <span className="text-3xl">{emoji}</span>
        <p className="font-heading text-sm font-bold text-[var(--foreground)]">{message}</p>
      </motion.div>

      {/* カテゴリ別スコア */}
      {categoryResults.length > 0 && (
        <motion.div
          className="mt-6 w-full"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
        >
          <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-[var(--foreground)]">
            <TrendingUp className="h-4 w-4" />
            カテゴリべつスコア
          </h3>
          <div className="flex flex-col gap-3">
            {categoryResults.map((result, idx) => {
              const info = CATEGORY_INFO[result.category];
              return (
                <motion.div
                  key={result.category}
                  className="flex items-center gap-3"
                  initial={
                    prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -16 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.6 + idx * 0.1 }}
                >
                  <span className="min-w-[4.5rem] font-ui text-xs text-[var(--foreground-secondary)]">
                    {info.nameJa}
                  </span>
                  <div className="relative h-3 flex-1 overflow-hidden rounded-[var(--radius-full)] bg-[var(--surface-secondary)]">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-[var(--radius-full)]"
                      style={{ backgroundColor: info.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.score}%` }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.6,
                        delay: prefersReducedMotion ? 0 : 0.7 + idx * 0.1,
                      }}
                    />
                  </div>
                  <span
                    className="min-w-[2.5rem] text-right font-heading text-sm font-bold tabular-nums"
                    style={{ color: info.color }}
                  >
                    {result.score}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* アクションボタン */}
      <motion.div
        className="mt-8 mb-8 flex w-full gap-3"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.8 }}
      >
        <button
          onClick={onRetry}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-[var(--primary)] px-4 py-3",
            "min-h-[52px] font-heading text-base font-bold text-[var(--primary)]",
            "transition-transform duration-150 active:scale-[0.97]",
            "hover:bg-[var(--primary)]/5"
          )}
        >
          <RotateCcw className="h-5 w-5" />
          もういちど
        </button>
        <Link
          href="/"
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-lg)] px-4 py-3",
            "min-h-[52px] bg-[var(--primary)] font-heading text-base font-bold text-white",
            "transition-transform duration-150 active:scale-[0.97]"
          )}
        >
          <Home className="h-5 w-5" />
          ホームにもどる
        </Link>
      </motion.div>
    </div>
  );
}
