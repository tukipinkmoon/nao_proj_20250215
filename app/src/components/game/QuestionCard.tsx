"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export default function QuestionCard({ question, onAnswer, disabled }: QuestionCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = useCallback(
    (option: string) => {
      if (disabled || selected !== null) return;

      const correct =
        Array.isArray(question.correctAnswer)
          ? question.correctAnswer.includes(option)
          : question.correctAnswer === option;

      setSelected(option);
      setIsCorrect(correct);
      setShowFeedback(true);

      const delay = prefersReducedMotion ? 400 : 1000;
      setTimeout(() => {
        onAnswer(option, correct);
        setSelected(null);
        setShowFeedback(false);
      }, delay);
    },
    [disabled, selected, question.correctAnswer, onAnswer, prefersReducedMotion]
  );

  const correctAnswer = Array.isArray(question.correctAnswer)
    ? question.correctAnswer[0]
    : question.correctAnswer;

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -30 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    >
      {/* 問題文 - 超大きく */}
      <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)]">
        <p
          className="text-center font-heading text-2xl font-bold leading-relaxed text-[var(--foreground)]"
          style={
            question.metadata?.displayColor
              ? { color: question.metadata.displayColor as string }
              : undefined
          }
        >
          {question.prompt}
        </p>
        {question.metadata?.displayColor ? (
          <p
            className="mt-4 text-center font-heading text-5xl font-bold"
            style={{ color: question.metadata.displayColor as string }}
          >
            {String(question.metadata.text ?? "")}
          </p>
        ) : null}
      </div>

      {/* 選択肢 - 縦並び、超大きなボタン */}
      {question.options && (
        <div className="flex flex-col gap-4">
          {question.options.map((option, idx) => {
            const isSelected = selected === option;
            const isAnswer = option === correctAnswer;
            const showCorrect = showFeedback && isAnswer;
            const showWrong = showFeedback && isSelected && !isCorrect;

            return (
              <motion.button
                key={`${question.id}-${idx}`}
                onClick={() => handleSelect(option)}
                disabled={disabled || selected !== null}
                className={cn(
                  "rounded-[var(--radius-xl)] border-3 px-6 py-5",
                  "font-heading text-xl font-bold",
                  "transition-colors duration-150",
                  "min-h-[72px]",
                  showCorrect
                    ? "border-[var(--success)] bg-[var(--success)]/15 text-[var(--success)]"
                    : showWrong
                      ? "border-[var(--secondary)] bg-[var(--secondary)]/15 text-[var(--secondary)]"
                      : isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary-light)] hover:bg-[var(--primary)]/5",
                  (disabled || selected !== null) && !isSelected && !showCorrect
                    ? "opacity-40"
                    : ""
                )}
                whileTap={
                  !disabled && selected === null && !prefersReducedMotion
                    ? { scale: 0.97 }
                    : undefined
                }
                animate={
                  showCorrect && !prefersReducedMotion
                    ? { scale: [1, 1.03, 1] }
                    : showWrong && !prefersReducedMotion
                      ? { x: [0, -4, 4, -4, 0] }
                      : undefined
                }
                transition={{ duration: 0.3 }}
                aria-label={`${option}`}
              >
                {option}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* テキスト入力なし - すべてボタン操作 */}
      {!question.options && (
        <div className="flex flex-col gap-4">
          {/* 選択肢がない場合は正解を含む4択を自動生成 */}
          {(() => {
            const correct = Array.isArray(question.correctAnswer)
              ? question.correctAnswer[0] ?? ""
              : question.correctAnswer;
            const dummies = ["？", "わからない"];
            const options = [correct, ...dummies].sort(() => Math.random() - 0.5);
            return options.map((option, idx) => (
              <motion.button
                key={`fallback-${idx}`}
                onClick={() => handleSelect(option)}
                disabled={disabled || selected !== null}
                className={cn(
                  "rounded-[var(--radius-xl)] border-3 px-6 py-5",
                  "font-heading text-xl font-bold",
                  "min-h-[72px]",
                  "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
                )}
              >
                {option}
              </motion.button>
            ));
          })()}
        </div>
      )}

      {/* フィードバック - 大きく表示 */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className={cn(
              "flex items-center justify-center gap-3 rounded-[var(--radius-xl)] p-5",
              isCorrect
                ? "bg-[var(--success)]/15 text-[var(--success)]"
                : "bg-[var(--secondary)]/15 text-[var(--secondary)]"
            )}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-4xl">{isCorrect ? "🎉" : "💪"}</span>
            <span className="font-heading text-xl font-bold">
              {isCorrect ? "すごい！せいかい！" : "おしい！"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
