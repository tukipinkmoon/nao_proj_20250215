"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play, Trophy, Users, Flame, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user";
import { useScoreStore } from "@/stores/score";
import { useFamilyStore } from "@/stores/family";
import { useCharacterStore } from "@/stores/character";
import { getDateKey } from "@/lib/utils";
import { CATEGORY_INFO } from "@/types";
import type { ChallengeCategory } from "@/types";

// キャラクターの挨拶
function getGreeting(hour: number): string {
  if (hour < 6) return "おはよう！早起きだね！";
  if (hour < 12) return "おはよう！今日もいっしょにがんばろう！";
  if (hour < 18) return "こんにちは！脳トレの時間だよ！";
  return "こんばんは！今日のトレーニングはすんだかな？";
}

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion();
  const user = useUserStore((s) => s.user);
  const uiMode = useUserStore((s) => s.settings.uiMode);
  const streakCount = useScoreStore((s) => s.streakCount);
  const members = useFamilyStore((s) => s.members);
  const characterState = useCharacterStore((s) => s.characterState);

  const todayKey = getDateKey();
  const todayScore = useScoreStore((s) => s.getTotalScoreForDate(todayKey));
  const categoryScores = useScoreStore((s) => s.categoryScores);

  const hour = new Date().getHours();
  const greeting = getGreeting(hour);
  const userName = user?.name ?? "ゲスト";

  // ファミリーの今日の状況
  const familyStatus = useMemo(() => {
    const completed = members.filter((m) => m.todayCompleted).length;
    return { completed, total: members.length };
  }, [members]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-6">
      {/* キャラクター挨拶 */}
      <motion.div
        className="mb-6 flex items-center gap-4 rounded-[var(--radius-lg)] bg-[var(--primary)]/10 p-4"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]/20 text-3xl">
          🦉
        </div>
        <div>
          <p className="font-heading text-lg font-bold text-[var(--foreground)]">
            {userName}さん、{greeting}
          </p>
          {streakCount > 0 && (
            <p className="flex items-center gap-1 font-ui text-sm text-[var(--secondary)]">
              <Flame className="h-4 w-4" /> {streakCount}日れんぞく！
            </p>
          )}
        </div>
      </motion.div>

      {/* 今日のトレーニング開始ボタン（P0改善提案: ワンタップ） */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.1 }}
      >
        <Link
          href="/challenge"
          className={cn(
            "flex items-center justify-between rounded-[var(--radius-xl)] p-6",
            "bg-[var(--primary)] text-white",
            "shadow-[var(--shadow-lg)]",
            "transition-transform duration-150 active:scale-[0.98]",
            uiMode === "senior" ? "min-h-[80px]" : "min-h-[64px]"
          )}
        >
          <div>
            <p className="font-heading text-xl font-bold">今日のトレーニング</p>
            <p className="mt-1 text-sm opacity-80">
              {todayScore > 0 ? `今日のスコア: ${todayScore}点` : "タップしてはじめよう！"}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Play className="h-6 w-6" fill="white" />
          </div>
        </Link>
      </motion.div>

      {/* カテゴリスコア */}
      {categoryScores.length > 0 && (
        <motion.div
          className="mt-6"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-3 font-heading text-base font-bold text-[var(--foreground)]">
            きょうのちから
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {(["memory", "attention", "language", "math", "spatial"] as ChallengeCategory[]).map(
              (cat) => {
                const info = CATEGORY_INFO[cat];
                const cs = categoryScores.find((c) => c.category === cat);
                return (
                  <div
                    key={cat}
                    className="flex flex-col items-center gap-1 rounded-[var(--radius-md)] bg-[var(--surface)] p-2 shadow-[var(--shadow-sm)]"
                  >
                    <span className="text-xl">{cat === "memory" ? "🧠" : cat === "attention" ? "👁" : cat === "language" ? "💬" : cat === "math" ? "🔢" : "📦"}</span>
                    <span className="font-ui text-[10px] text-[var(--foreground-secondary)]">
                      {info.nameJa}
                    </span>
                    <span className="font-heading text-sm font-bold" style={{ color: info.color }}>
                      {cs ? cs.score : "--"}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </motion.div>
      )}

      {/* かぞくのようす（P0改善提案: ホーム画面にサマリー） */}
      {members.length > 0 && (
        <motion.div
          className="mt-6"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/family"
            className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-secondary)]"
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[var(--info)]" />
              <div>
                <p className="font-heading text-sm font-bold text-[var(--foreground)]">
                  かぞくのようす
                </p>
                <p className="font-ui text-xs text-[var(--foreground-secondary)]">
                  {familyStatus.completed}/{familyStatus.total}人がトレーニングずみ
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--foreground-muted)]" />
          </Link>
        </motion.div>
      )}

      {/* 実績バッジ */}
      <motion.div
        className="mt-6 mb-8"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          href="/report"
          className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-secondary)]"
        >
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-[var(--accent)]" />
            <div>
              <p className="font-heading text-sm font-bold text-[var(--foreground)]">
                きろく・レポート
              </p>
              <p className="font-ui text-xs text-[var(--foreground-secondary)]">
                スコアのすいいをチェック
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--foreground-muted)]" />
        </Link>
      </motion.div>
    </div>
  );
}
