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

      // 短いフィードバック後にコールバック
      const delay = prefersReducedMotion ? 300 : 800;
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
      className="flex flex-col gap-6"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -30 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    >
      {/* 問題文 */}
      <div className="rounded-[var(--radius-lg)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <p
          className="text-center font-heading text-lg font-bold text-[var(--foreground)]"
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
            className="mt-3 text-center font-heading text-3xl font-bold"
            style={{ color: question.metadata.displayColor as string }}
          >
            {String(question.metadata.text ?? "")}
          </p>
        ) : null}
      </div>

      {/* 選択肢 */}
      {question.options && (
        <div className="grid grid-cols-2 gap-3">
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
                  "relative min-h-[56px] rounded-[var(--radius-lg)] border-2 px-4 py-3",
                  "font-heading text-base font-bold",
                  "transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                  showCorrect
                    ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                    : showWrong
                      ? "border-[var(--secondary)] bg-[var(--secondary)]/10 text-[var(--secondary)]"
                      : isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary-light)] hover:bg-[var(--primary)]/5",
                  (disabled || selected !== null) && !isSelected && !showCorrect
                    ? "opacity-50"
                    : ""
                )}
                whileTap={
                  !disabled && selected === null && !prefersReducedMotion
                    ? { scale: 0.96 }
                    : undefined
                }
                animate={
                  showCorrect && !prefersReducedMotion
                    ? { scale: [1, 1.04, 1] }
                    : showWrong && !prefersReducedMotion
                      ? { x: [0, -4, 4, -4, 0] }
                      : undefined
                }
                transition={{ duration: 0.3 }}
                aria-label={`選択肢: ${option}`}
              >
                {option}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* テキスト入力（選択肢がない場合） */}
      {!question.options && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem("answer") as HTMLInputElement;
            if (input.value.trim()) {
              const correct =
                Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.includes(input.value.trim())
                  : question.correctAnswer === input.value.trim();
              onAnswer(input.value.trim(), correct);
              input.value = "";
            }
          }}
          className="flex gap-3"
        >
          <input
            name="answer"
            type="text"
            autoComplete="off"
            disabled={disabled}
            className={cn(
              "flex-1 rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3",
              "font-body text-base text-[var(--foreground)]",
              "placeholder:text-[var(--foreground-muted)]",
              "focus:border-[var(--primary)] focus:outline-none"
            )}
            placeholder="こたえを入力..."
          />
          <button
            type="submit"
            disabled={disabled}
            className={cn(
              "min-h-[48px] rounded-[var(--radius-lg)] bg-[var(--primary)] px-6 py-3",
              "font-heading text-base font-bold text-white",
              "transition-transform duration-150 active:scale-95",
              "disabled:opacity-50"
            )}
          >
            かくにん
          </button>
        </form>
      )}

      {/* フィードバック */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className={cn(
              "flex items-center justify-center gap-2 rounded-[var(--radius-lg)] p-3",
              isCorrect
                ? "bg-[var(--success)]/10 text-[var(--success)]"
                : "bg-[var(--secondary)]/10 text-[var(--secondary)]"
            )}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            <span className="text-xl">{isCorrect ? "🎉" : "💪"}</span>
            <span className="font-heading text-base font-bold">
              {isCorrect ? "すごい！正解！" : "おしい！つぎはできるよ！"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
