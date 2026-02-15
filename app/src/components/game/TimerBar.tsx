"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface TimerBarProps {
  timeRemaining: number;
  totalTime: number;
  className?: string;
}

export default function TimerBar({ timeRemaining, totalTime, className }: TimerBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const percent = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0;
  const isLow = percent <= 30;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeLabel = minutes > 0 ? `${minutes}:${String(seconds).padStart(2, "0")}` : `${seconds}秒`;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative h-3 flex-1 overflow-hidden rounded-[var(--radius-full)] bg-[var(--surface-secondary)]"
        role="progressbar"
        aria-valuenow={timeRemaining}
        aria-valuemin={0}
        aria-valuemax={totalTime}
        aria-label={`残り時間 ${timeLabel}`}
      >
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-[var(--radius-full)]",
            isLow ? "bg-[var(--warning)]" : "bg-[var(--primary)]"
          )}
          initial={false}
          animate={{
            width: `${percent}%`,
            ...(isLow && !prefersReducedMotion
              ? { opacity: [1, 0.7, 1] }
              : {}),
          }}
          transition={
            isLow && !prefersReducedMotion
              ? {
                  width: { duration: 0.3 },
                  opacity: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
                }
              : { duration: 0.3 }
          }
        />
      </div>
      <span
        className={cn(
          "min-w-[3rem] text-right font-ui text-sm font-bold tabular-nums",
          isLow ? "text-[var(--warning)]" : "text-[var(--foreground-secondary)]"
        )}
      >
        {timeLabel}
      </span>
    </div>
  );
}
