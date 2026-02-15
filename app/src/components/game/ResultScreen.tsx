"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Home, RotateCcw, Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Answer } from "@/types";

interface ResultScreenProps {
  totalScore: number;
  accuracy: number;
  answers: Answer[];
  categoryResults: unknown[];
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
  if (score >= 50) return { emoji: "😊", message: "いいちょうし！" };
  if (score >= 30) return { emoji: "💪", message: "がんばったね！" };
  return { emoji: "🤗", message: "チャレンジしてえらい！" };
}

export default function ResultScreen({
  totalScore,
  accuracy,
  answers,
  onRetry,
}: ResultScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const isHighScore = totalScore >= 70;
  const { emoji, message } = getCharacterComment(totalScore);
  const correctCount = answers.filter((a) => a.isCorrect).length;

  const handleLineShare = () => {
    const today = new Date().toLocaleDateString("ja-JP", {
      month: "long",
      day: "numeric",
    });
    const text = [
      `🧠 のうかつクイズ（${today}）`,
      ``,
      `スコア：${totalScore}てん`,
      `${answers.length}もん中 ${correctCount}もん せいかい！`,
      ``,
      `${message} ${emoji}`,
      ``,
      `まいにち のうトレ がんばってるよ！`,
    ].join("\n");

    window.open(
      `https://line.me/R/msg/text/?${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col items-center px-6 pt-6">
      {/* 紙吹雪 */}
      {isHighScore && <Confetti />}

      {/* スコア */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      >
        <p className="font-heading text-xl font-bold text-[var(--foreground-secondary)]">
          スコア
        </p>
        <p className="font-heading text-7xl font-bold text-[var(--primary)]">
          <AnimatedScore target={totalScore} />
        </p>
        <p className="font-heading text-lg text-[var(--foreground-secondary)]">
          {correctCount} / {answers.length}もん せいかい
        </p>
      </motion.div>

      {/* キャラクターコメント */}
      <motion.div
        className="mt-8 flex w-full items-center gap-4 rounded-[var(--radius-xl)] bg-[var(--primary)]/10 p-6"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.3 }}
      >
        <span className="text-5xl">{emoji}</span>
        <p className="font-heading text-xl font-bold text-[var(--foreground)]">{message}</p>
      </motion.div>

      {/* LINEでおくる */}
      <motion.div
        className="mt-8 w-full"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
      >
        <button
          onClick={handleLineShare}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-[var(--radius-xl)] px-6 py-5",
            "min-h-[72px] font-heading text-xl font-bold text-white",
            "transition-transform duration-150 active:scale-[0.97]"
          )}
          style={{ backgroundColor: "#06C755" }}
          aria-label="LINEでけっかをおくる"
        >
          <Send className="h-7 w-7" />
          LINEで けっかを おくる
        </button>
      </motion.div>

      {/* アクションボタン */}
      <motion.div
        className="mt-6 mb-8 flex w-full flex-col gap-4"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.7 }}
      >
        <button
          onClick={onRetry}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-[var(--radius-xl)] border-3 border-[var(--primary)] px-6 py-5",
            "min-h-[72px] font-heading text-xl font-bold text-[var(--primary)]",
            "transition-transform duration-150 active:scale-[0.97]",
            "hover:bg-[var(--primary)]/5"
          )}
        >
          <RotateCcw className="h-7 w-7" />
          もういちど やる
        </button>
        <Link
          href="/"
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-[var(--radius-xl)] px-6 py-5",
            "min-h-[72px] bg-[var(--primary)] font-heading text-xl font-bold text-white",
            "transition-transform duration-150 active:scale-[0.97]"
          )}
        >
          <Home className="h-7 w-7" />
          ホームに もどる
        </Link>
      </motion.div>
    </div>
  );
}
