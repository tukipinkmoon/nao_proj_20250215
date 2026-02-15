"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Calendar, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScoreStore } from "@/stores/score";

// -- カレンダービュー --
function CalendarView({ trainedDates }: { trainedDates: Set<number> }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const todayDate = now.getDate();

  const dayHeaders = ["日", "月", "火", "水", "木", "金", "土"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <p className="mb-4 text-center font-heading text-xl font-bold text-[var(--foreground)]">
        {year}年 {month + 1}月
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {dayHeaders.map((dh) => (
          <div
            key={dh}
            className="py-1 text-center font-heading text-sm font-bold text-[var(--foreground-muted)]"
          >
            {dh}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }
          const trained = trainedDates.has(day);
          const isToday = day === todayDate;

          return (
            <div
              key={day}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-[var(--radius-md)]",
                "font-heading text-base",
                isToday && "ring-3 ring-[var(--primary)]/40",
                trained
                  ? "bg-[var(--primary)]/15 text-[var(--primary)] font-bold"
                  : "text-[var(--foreground-secondary)]"
              )}
            >
              <span>{day}</span>
              {trained && (
                <span
                  className="mt-0.5 block h-2 w-2 rounded-full bg-[var(--primary)]"
                  aria-label="トレーニング済み"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const prefersReducedMotion = useReducedMotion();
  const scores = useScoreStore((s) => s.scores);
  const streakCount = useScoreStore((s) => s.streakCount);

  // 直近10回のスコア
  const recentScores = useMemo(() => {
    return scores.slice(-10).reverse();
  }, [scores]);

  // 今月のトレーニング日
  const trainedDates = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const set = new Set<number>();
    scores.forEach((s) => {
      const d = new Date(s.completedAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [scores]);

  const hasData = scores.length > 0;

  return (
    <div className="mx-auto w-full max-w-lg px-6 pt-6 pb-28">
      {/* ヘッダー */}
      <motion.div
        className="mb-6"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
          きろく
        </h1>
      </motion.div>

      {!hasData && (
        <motion.div
          className="rounded-[var(--radius-xl)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow-sm)]"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mx-auto mb-4 text-5xl">📊</div>
          <p className="font-heading text-xl font-bold text-[var(--foreground)]">
            まだ きろくが ないよ
          </p>
          <p className="mt-2 font-heading text-base text-[var(--foreground-secondary)]">
            クイズを すると ここに きろく されるよ！
          </p>
        </motion.div>
      )}

      {hasData && (
        <>
          {/* 連続日数 */}
          {streakCount > 0 && (
            <motion.div
              className="mb-6 flex items-center justify-center gap-3 rounded-[var(--radius-xl)] bg-[var(--secondary)]/10 p-5"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Flame className="h-8 w-8 text-[var(--secondary)]" />
              <p className="font-heading text-2xl font-bold text-[var(--secondary)]">
                {streakCount}日 れんぞく！
              </p>
            </motion.div>
          )}

          {/* カレンダー */}
          <motion.section
            className="mb-6"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-[var(--info)]" />
              <h2 className="font-heading text-xl font-bold text-[var(--foreground)]">
                カレンダー
              </h2>
            </div>
            <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
              <CalendarView trainedDates={trainedDates} />
            </div>
          </motion.section>

          {/* スコアりれき */}
          <motion.section
            className="mb-8"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-3 font-heading text-xl font-bold text-[var(--foreground)]">
              さいきんの スコア
            </h2>
            <div className="flex flex-col gap-3">
              {recentScores.map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between rounded-[var(--radius-lg)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
                >
                  <span className="font-heading text-base text-[var(--foreground-secondary)]">
                    {new Date(score.completedAt).toLocaleDateString("ja-JP", {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-heading text-2xl font-bold text-[var(--primary)]">
                    {score.rawScore}てん
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        </>
      )}
    </div>
  );
}
