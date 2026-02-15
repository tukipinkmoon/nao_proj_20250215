"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play, Flame } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useScoreStore } from "@/stores/score";
import { getDateKey } from "@/lib/utils";

function getGreeting(hour: number): string {
  if (hour < 12) return "おはようございます！";
  if (hour < 18) return "こんにちは！";
  return "こんばんは！";
}

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion();
  const streakCount = useScoreStore((s) => s.streakCount);
  const todayKey = getDateKey();
  const todayScore = useScoreStore((s) => s.getTotalScoreForDate(todayKey));
  const scores = useScoreStore((s) => s.scores);

  const hour = new Date().getHours();
  const greeting = getGreeting(hour);

  // 直近5回のスコア
  const recentScores = useMemo(() => {
    return scores.slice(-5).reverse();
  }, [scores]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-6 pt-8">
      {/* のうかつ博士の挨拶 */}
      <motion.div
        className="mb-8 flex flex-col items-center gap-3"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]/15 text-5xl">
          🦉
        </div>
        <p className="text-center font-heading text-xl font-bold text-[var(--foreground)]">
          {greeting}
        </p>
        {streakCount > 0 && (
          <p className="flex items-center gap-2 font-heading text-lg font-bold text-[var(--secondary)]">
            <Flame className="h-6 w-6" />
            {streakCount}日 れんぞく！
          </p>
        )}
      </motion.div>

      {/* 今日のクイズ - 超大きなボタン */}
      <motion.div
        className="w-full"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Link
          href="/challenge"
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)] p-8",
            "bg-[var(--primary)] text-white",
            "shadow-[var(--shadow-lg)]",
            "transition-transform duration-150 active:scale-[0.97]",
            "min-h-[140px]"
          )}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25">
            <Play className="h-8 w-8" fill="white" />
          </div>
          <p className="font-heading text-2xl font-bold">
            きょうのクイズをする
          </p>
        </Link>
      </motion.div>

      {/* 今日のスコア */}
      {todayScore > 0 && (
        <motion.div
          className="mt-6 w-full rounded-[var(--radius-lg)] bg-[var(--accent)]/15 p-5 text-center"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-heading text-base text-[var(--foreground-secondary)]">きょうのスコア</p>
          <p className="font-heading text-4xl font-bold text-[var(--primary)]">{todayScore}点</p>
        </motion.div>
      )}

      {/* 最近のスコア */}
      {recentScores.length > 0 && (
        <motion.div
          className="mt-6 mb-8 w-full"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="mb-3 font-heading text-lg font-bold text-[var(--foreground)]">
            さいきんのきろく
          </h2>
          <div className="flex flex-col gap-2">
            {recentScores.map((score) => (
              <div
                key={score.id}
                className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
              >
                <span className="font-body text-base text-[var(--foreground-secondary)]">
                  {new Date(score.completedAt).toLocaleDateString("ja-JP", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="font-heading text-xl font-bold text-[var(--primary)]">
                  {score.rawScore}点
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
