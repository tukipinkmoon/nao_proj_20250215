"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  Calendar,
  Flame,
  TrendingUp,
  Trophy,
  Activity,
  Target,
} from "lucide-react";
import { cn, generateId, getDateKey } from "@/lib/utils";
import { useScoreStore } from "@/stores/score";
import { CATEGORY_INFO } from "@/types";
import type {
  ChallengeCategory,
  DailyScore,
  Score,
} from "@/types";

// -- カテゴリ絵文字マッピング --
const CATEGORY_EMOJI: Record<ChallengeCategory, string> = {
  memory: "🧠",
  attention: "👁",
  language: "💬",
  math: "🔢",
  spatial: "📦",
};

// -- SVG折れ線グラフ --
function ScoreLineChart({
  dailyScores,
  prefersReducedMotion,
}: {
  dailyScores: DailyScore[];
  prefersReducedMotion: boolean | null;
}) {
  const width = 340;
  const height = 180;
  const paddingX = 36;
  const paddingTop = 16;
  const paddingBottom = 28;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingTop - paddingBottom;

  if (dailyScores.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center font-ui text-sm text-[var(--foreground-muted)]">
        データがありません
      </div>
    );
  }

  const maxScore = 100;
  const minScore = 0;

  const points = dailyScores.map((ds, i) => {
    const x =
      paddingX +
      (dailyScores.length > 1
        ? (i / (dailyScores.length - 1)) * chartW
        : chartW / 2);
    const y =
      paddingTop +
      chartH -
      ((ds.totalScore - minScore) / (maxScore - minScore)) * chartH;
    return { x, y, score: ds.totalScore, date: ds.date };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Y軸ラベル
  const yLabels = [0, 25, 50, 75, 100];

  // X軸ラベル（最大7つ）
  const step = Math.max(1, Math.floor(dailyScores.length / 6));
  const xLabelIndices: number[] = [];
  for (let i = 0; i < dailyScores.length; i += step) {
    xLabelIndices.push(i);
  }
  if (!xLabelIndices.includes(dailyScores.length - 1)) {
    xLabelIndices.push(dailyScores.length - 1);
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="スコア推移グラフ"
    >
      {/* Y軸グリッド線 */}
      {yLabels.map((val) => {
        const y = paddingTop + chartH - (val / 100) * chartH;
        return (
          <g key={val}>
            <line
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="var(--border-light)"
              strokeWidth={1}
            />
            <text
              x={paddingX - 6}
              y={y + 4}
              textAnchor="end"
              fill="var(--foreground-muted)"
              fontSize={9}
              fontFamily="var(--font-ui)"
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* 折れ線 */}
      <motion.path
        d={linePath}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={
          prefersReducedMotion
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 1, ease: "easeOut" }}
      />

      {/* データポイント */}
      {points.map((p, i) => (
        <motion.circle
          key={p.date}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill="var(--surface)"
          stroke="var(--primary)"
          strokeWidth={2}
          initial={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0 }
          }
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.2,
            delay: prefersReducedMotion ? 0 : 0.8 + i * 0.03,
          }}
        >
          <title>{`${p.date}: ${p.score}点`}</title>
        </motion.circle>
      ))}

      {/* X軸ラベル */}
      {xLabelIndices.map((idx) => {
        const p = points[idx];
        if (!p) return null;
        const dateLabel = dailyScores[idx]!.date.slice(5); // MM-DD
        return (
          <text
            key={idx}
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            fill="var(--foreground-muted)"
            fontSize={8}
            fontFamily="var(--font-ui)"
          >
            {dateLabel}
          </text>
        );
      })}
    </svg>
  );
}

// -- カテゴリバーグラフ --
function CategoryBars({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null;
}) {
  const categoryScores = useScoreStore((s) => s.categoryScores);
  const categories: ChallengeCategory[] = [
    "memory",
    "attention",
    "language",
    "math",
    "spatial",
  ];

  return (
    <div className="flex flex-col gap-3">
      {categories.map((cat) => {
        const info = CATEGORY_INFO[cat];
        const cs = categoryScores.find((c) => c.category === cat);
        const score = cs?.score ?? 0;

        return (
          <div key={cat} className="flex items-center gap-3">
            <span className="text-lg">{CATEGORY_EMOJI[cat]}</span>
            <div className="w-16 font-ui text-xs text-[var(--foreground-secondary)]">
              {info.nameJa}
            </div>
            <div className="relative flex-1 h-6 rounded-[var(--radius-full)] bg-[var(--surface-secondary)] overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-[var(--radius-full)]"
                style={{ backgroundColor: info.color }}
                initial={
                  prefersReducedMotion ? { width: `${score}%` } : { width: "0%" }
                }
                animate={{ width: `${score}%` }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.6,
                  ease: "easeOut",
                }}
              />
            </div>
            <span
              className="w-10 text-right font-heading text-sm font-bold tabular-nums"
              style={{ color: info.color }}
            >
              {score}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// -- カレンダービュー --
function CalendarView({
  dailyScores,
}: {
  dailyScores: DailyScore[];
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const trainedDates = useMemo(() => {
    const set = new Set<number>();
    dailyScores.forEach((ds) => {
      const d = new Date(ds.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [dailyScores, year, month]);

  // 連続日数ハイライト用
  const consecutiveDays = useMemo(() => {
    const sorted = Array.from(trainedDates).sort((a, b) => a - b);
    const groups: number[][] = [];
    let current: number[] = [];
    sorted.forEach((d) => {
      if (current.length === 0 || d === current[current.length - 1]! + 1) {
        current.push(d);
      } else {
        if (current.length >= 2) groups.push(current);
        current = [d];
      }
    });
    if (current.length >= 2) groups.push(current);
    const allConsecutive = new Set<number>();
    groups.forEach((g) => g.forEach((d) => allConsecutive.add(d)));
    return allConsecutive;
  }, [trainedDates]);

  const todayDate = now.getDate();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() === month;

  const dayHeaders = ["日", "月", "火", "水", "木", "金", "土"];

  // カレンダーグリッド
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <p className="mb-3 text-center font-heading text-sm font-bold text-[var(--foreground)]">
        {year}年{month + 1}月
      </p>
      <div className="grid grid-cols-7 gap-1">
        {dayHeaders.map((dh) => (
          <div
            key={dh}
            className="py-1 text-center font-ui text-[10px] text-[var(--foreground-muted)]"
          >
            {dh}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }
          const trained = trainedDates.has(day);
          const isConsecutive = consecutiveDays.has(day);
          const isToday = isCurrentMonth && day === todayDate;

          return (
            <div
              key={day}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-[var(--radius-sm)]",
                "font-ui text-xs",
                isToday && "ring-2 ring-[var(--primary)]/40",
                trained && isConsecutive
                  ? "bg-[var(--primary)]/15 text-[var(--primary)] font-bold"
                  : trained
                    ? "bg-[var(--primary)]/8 text-[var(--primary)]"
                    : "text-[var(--foreground-secondary)]"
              )}
            >
              <span>{day}</span>
              {trained && (
                <span
                  className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-[var(--primary)]"
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

// -- サンプルデータ生成 --
function generateSampleScores(): { scores: Score[]; dailyScores: DailyScore[] } {
  const categories: ChallengeCategory[] = [
    "memory",
    "attention",
    "language",
    "math",
    "spatial",
  ];
  const scores: Score[] = [];
  const dailyMap = new Map<string, DailyScore>();

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]!;

    // 80%の確率でトレーニング実施
    if (Math.random() < 0.2 && i > 0) continue;

    const numChallenges = 1 + Math.floor(Math.random() * 3);
    let totalScore = 0;

    for (let c = 0; c < numChallenges; c++) {
      const cat = categories[Math.floor(Math.random() * categories.length)]!;
      // 日が新しいほど少し高いスコア（成長傾向）
      const baseScore = 50 + ((30 - i) / 30) * 20;
      const normalizedScore = Math.round(
        Math.max(30, Math.min(100, baseScore + (Math.random() - 0.3) * 30))
      );
      const score: Score = {
        id: generateId("score"),
        userId: "guest",
        challengeId: generateId("ch"),
        category: cat,
        rawScore: normalizedScore,
        normalizedScore,
        accuracy: Math.round((normalizedScore / 100) * 100) / 100,
        averageResponseTime: 1500 + Math.random() * 3000,
        difficulty: (Math.min(5, Math.max(1, Math.ceil(normalizedScore / 20))) as 1 | 2 | 3 | 4 | 5),
        completedAt: d.toISOString(),
      };
      scores.push(score);
      totalScore += normalizedScore;
    }

    dailyMap.set(dateStr, {
      date: dateStr,
      totalScore: Math.round(totalScore / numChallenges),
      categoryScores: [],
      challengeCount: numChallenges,
    });
  }

  const dailyScores = Array.from(dailyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return { scores, dailyScores };
}

// -- メインページ --
export default function ReportPage() {
  const prefersReducedMotion = useReducedMotion();
  const scores = useScoreStore((s) => s.scores);
  const dailyScores = useScoreStore((s) => s.dailyScores);
  const streakCount = useScoreStore((s) => s.streakCount);
  const bestStreak = useScoreStore((s) => s.bestStreak);
  const categoryScores = useScoreStore((s) => s.categoryScores);
  const setScores = useScoreStore((s) => s.setScores);
  const setDailyScores = useScoreStore((s) => s.setDailyScores);
  const setCategoryScores = useScoreStore((s) => s.setCategoryScores);
  const updateStreak = useScoreStore((s) => s.updateStreak);
  const addScore = useScoreStore((s) => s.addScore);

  // 直近30日のデータ
  const recent30 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split("T")[0]!;
    return dailyScores
      .filter((d) => d.date >= cutoffStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyScores]);

  // 統計
  const stats = useMemo(() => {
    if (scores.length === 0) {
      return {
        totalCount: 0,
        avgScore: 0,
        maxScore: 0,
        streak: streakCount,
      };
    }
    const allNormalized = scores.map((s) => s.normalizedScore);
    const avg = Math.round(
      allNormalized.reduce((a, b) => a + b, 0) / allNormalized.length
    );
    const max = Math.max(...allNormalized);
    return {
      totalCount: scores.length,
      avgScore: avg,
      maxScore: max,
      streak: streakCount,
    };
  }, [scores, streakCount]);

  // サンプルデータ投入
  const handleLoadSample = useCallback(() => {
    const { scores: sampleScores, dailyScores: sampleDaily } =
      generateSampleScores();
    setScores(sampleScores);
    setDailyScores(sampleDaily);
    updateStreak(7);

    // カテゴリスコアも再計算
    const catMap = new Map<ChallengeCategory, number[]>();
    sampleScores.forEach((s) => {
      const arr = catMap.get(s.category) ?? [];
      arr.push(s.normalizedScore);
      catMap.set(s.category, arr);
    });

    const catScores = Array.from(catMap.entries()).map(([cat, vals]) => ({
      category: cat,
      score: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      trend: "stable" as const,
      changePercent: 0,
    }));
    setCategoryScores(catScores);
  }, [setScores, setDailyScores, setCategoryScores, updateStreak]);

  const hasData = scores.length > 0;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-6 pb-8">
      {/* ヘッダー */}
      <motion.div
        className="mb-5"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="font-heading text-xl font-bold text-[var(--foreground)]">
            きろく・レポート
          </h1>
        </div>
      </motion.div>

      {/* サンプルデータボタン（データなし時） */}
      {!hasData && (
        <motion.div
          className="mb-6 text-center"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.1 }}
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-3xl">
              📊
            </div>
            <p className="mb-1 font-heading text-sm font-bold text-[var(--foreground)]">
              まだデータがないよ
            </p>
            <p className="mb-4 font-ui text-xs text-[var(--foreground-secondary)]">
              トレーニングをするとここに記録されるよ！
            </p>
            <button
              type="button"
              onClick={handleLoadSample}
              className={cn(
                "rounded-[var(--radius-md)] px-5 py-2.5",
                "bg-[var(--primary)] text-white",
                "font-ui text-sm font-medium",
                "transition-transform duration-150 active:scale-[0.97]",
                "min-h-[44px]"
              )}
            >
              サンプルデータを入れる
            </button>
          </div>
        </motion.div>
      )}

      {hasData && (
        <>
          {/* 統計サマリー */}
          <motion.section
            className="mb-5"
            initial={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.3,
              delay: 0.1,
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-[var(--info)]" />
                  <span className="font-ui text-[11px] text-[var(--foreground-secondary)]">
                    トレーニング回数
                  </span>
                </div>
                <p className="mt-1 font-heading text-2xl font-bold text-[var(--foreground)] tabular-nums">
                  {stats.totalCount}
                  <span className="text-sm font-normal text-[var(--foreground-muted)]">
                    {" "}回
                  </span>
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
                  <span className="font-ui text-[11px] text-[var(--foreground-secondary)]">
                    平均スコア
                  </span>
                </div>
                <p className="mt-1 font-heading text-2xl font-bold text-[var(--primary)] tabular-nums">
                  {stats.avgScore}
                  <span className="text-sm font-normal text-[var(--foreground-muted)]">
                    {" "}点
                  </span>
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-[var(--accent)]" />
                  <span className="font-ui text-[11px] text-[var(--foreground-secondary)]">
                    最高スコア
                  </span>
                </div>
                <p className="mt-1 font-heading text-2xl font-bold text-[var(--accent-dark)] tabular-nums">
                  {stats.maxScore}
                  <span className="text-sm font-normal text-[var(--foreground-muted)]">
                    {" "}点
                  </span>
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-[var(--secondary)]" />
                  <span className="font-ui text-[11px] text-[var(--foreground-secondary)]">
                    連続日数
                  </span>
                </div>
                <p className="mt-1 font-heading text-2xl font-bold text-[var(--secondary)] tabular-nums">
                  {stats.streak}
                  <span className="text-sm font-normal text-[var(--foreground-muted)]">
                    {" "}日
                  </span>
                </p>
              </div>
            </div>
          </motion.section>

          {/* スコア推移グラフ */}
          <motion.section
            className="mb-5"
            initial={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.3,
              delay: 0.2,
            }}
          >
            <h2 className="mb-3 font-heading text-base font-bold text-[var(--foreground)]">
              スコアすいい（30日間）
            </h2>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <ScoreLineChart
                dailyScores={recent30}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          </motion.section>

          {/* カテゴリ別スコアバー */}
          <motion.section
            className="mb-5"
            initial={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.3,
              delay: 0.3,
            }}
          >
            <h2 className="mb-3 font-heading text-base font-bold text-[var(--foreground)]">
              カテゴリべつスコア
            </h2>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <CategoryBars prefersReducedMotion={prefersReducedMotion} />
            </div>
          </motion.section>

          {/* カレンダービュー */}
          <motion.section
            className="mb-5"
            initial={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.3,
              delay: 0.4,
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--info)]" />
              <h2 className="font-heading text-base font-bold text-[var(--foreground)]">
                カレンダー
              </h2>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <CalendarView dailyScores={dailyScores} />
              <div className="mt-3 flex items-center justify-center gap-4 font-ui text-[10px] text-[var(--foreground-muted)]">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--primary)]/30" />
                  トレーニング済
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--primary)]" />
                  連続日
                </span>
              </div>
            </div>
          </motion.section>

          {/* サンプルデータ追加ボタン（データあり時） */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleLoadSample}
              className={cn(
                "rounded-[var(--radius-md)] px-4 py-2",
                "font-ui text-xs text-[var(--foreground-muted)]",
                "border border-[var(--border-light)]",
                "transition-colors duration-150",
                "hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground-secondary)]",
                "min-h-[44px]"
              )}
            >
              サンプルデータを入れる
            </button>
          </div>
        </>
      )}
    </div>
  );
}
