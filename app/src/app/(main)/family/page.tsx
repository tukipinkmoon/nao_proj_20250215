"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Users,
  Flame,
  Crown,
  Copy,
  Check,
  Plus,
  LogIn,
  ChevronDown,
  ChevronUp,
  Send,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn, generateId, getDateKey } from "@/lib/utils";
import { useFamilyStore } from "@/stores/family";
import { useUserStore } from "@/stores/user";
import { useScoreStore } from "@/stores/score";
import type { Family, FamilyMember, Message } from "@/types";

// -- スタンプ定義 --
const STAMPS = [
  { id: "stamp-ganbare", label: "がんばったね！", emoji: "👏" },
  { id: "stamp-sugoi", label: "すごい！", emoji: "✨" },
  { id: "stamp-issho", label: "いっしょにがんばろう！", emoji: "💪" },
  { id: "stamp-daisuki", label: "だいすき！", emoji: "💚" },
] as const;

// -- デモデータ生成 --
function generateDemoFamily(): Family {
  const now = new Date().toISOString();
  return {
    id: generateId("family"),
    name: "のうかつファミリー",
    inviteCode: "NOKATSU-2025",
    members: [
      {
        userId: "user-grandpa",
        name: "おじいちゃん",
        ageGroup: "senior",
        role: "senior",
        lastActiveAt: now,
        todayCompleted: true,
        currentStreak: 14,
      },
      {
        userId: "user-grandma",
        name: "おばあちゃん",
        ageGroup: "senior",
        role: "senior",
        lastActiveAt: now,
        todayCompleted: false,
        currentStreak: 7,
      },
      {
        userId: "user-mama",
        name: "ママ",
        ageGroup: "adult",
        role: "parent",
        lastActiveAt: now,
        todayCompleted: true,
        currentStreak: 5,
      },
      {
        userId: "user-papa",
        name: "パパ",
        ageGroup: "adult",
        role: "admin",
        lastActiveAt: now,
        todayCompleted: false,
        currentStreak: 3,
      },
      {
        userId: "user-child",
        name: "ゆうきくん",
        ageGroup: "child",
        role: "child",
        lastActiveAt: now,
        todayCompleted: true,
        currentStreak: 10,
      },
    ],
    createdAt: now,
  };
}

// -- 週間ランキング用のスコアデータ --
function getWeeklyRanking(members: FamilyMember[]) {
  // ストリークと今日の完了をスコアとして使用
  return [...members]
    .map((m) => ({
      ...m,
      weeklyScore: m.currentStreak * 10 + (m.todayCompleted ? 20 : 0),
    }))
    .sort((a, b) => b.weeklyScore - a.weeklyScore);
}

function getRankMedal(rank: number): string {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  return `${rank + 1}`;
}

// -- メンバーカード --
function MemberCard({
  member,
  prefersReducedMotion,
  onSendStamp,
}: {
  member: FamilyMember;
  prefersReducedMotion: boolean | null;
  onSendStamp: (memberId: string, stamp: (typeof STAMPS)[number]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showStamps, setShowStamps] = useState(false);
  const [sentStamp, setSentStamp] = useState<string | null>(null);

  const handleSendStamp = useCallback(
    (stamp: (typeof STAMPS)[number]) => {
      onSendStamp(member.userId, stamp);
      setSentStamp(stamp.id);
      setShowStamps(false);
      setTimeout(() => setSentStamp(null), 2000);
    },
    [member.userId, onSendStamp]
  );

  return (
    <motion.div
      layout={!prefersReducedMotion}
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)]",
        "bg-[var(--surface)] shadow-[var(--shadow-sm)]",
        "overflow-hidden"
      )}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-3 p-4",
          "transition-colors duration-150",
          "hover:bg-[var(--surface-secondary)]",
          "min-h-[56px]"
        )}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={`${member.name}の詳細`}
      >
        {/* アバター */}
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full text-2xl",
            member.todayCompleted
              ? "bg-[var(--primary)]/15"
              : "bg-[var(--surface-secondary)]"
          )}
        >
          🦉
        </div>

        {/* 情報 */}
        <div className="flex-1 text-left">
          <p className="font-heading text-sm font-bold text-[var(--foreground)]">
            {member.name}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-[var(--radius-full)] px-2 py-0.5",
                "font-ui text-[11px]",
                member.todayCompleted
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "bg-[var(--surface-secondary)] text-[var(--foreground-muted)]"
              )}
            >
              {member.todayCompleted ? "きょう ずみ" : "まだ"}
            </span>
            {member.currentStreak > 0 && (
              <span className="flex items-center gap-0.5 font-ui text-[11px] text-[var(--secondary)]">
                <Flame className="h-3 w-3" />
                {member.currentStreak}日
              </span>
            )}
          </div>
        </div>

        {/* 展開アイコン */}
        <div className="text-[var(--foreground-muted)]">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* 展開詳細 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--border-light)] px-4 pb-4 pt-3">
              {/* ストリーク情報 */}
              <div className="mb-3 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-[var(--secondary)]" />
                  <span className="font-ui text-xs text-[var(--foreground-secondary)]">
                    連続 {member.currentStreak}日
                  </span>
                </div>
                <div className="font-ui text-xs text-[var(--foreground-muted)]">
                  最終アクティブ:{" "}
                  {new Date(member.lastActiveAt).toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* スタンプ送信 */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowStamps(!showStamps)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2",
                    "bg-[var(--primary)]/10 text-[var(--primary)]",
                    "font-ui text-xs font-medium",
                    "transition-colors duration-150 hover:bg-[var(--primary)]/20",
                    "min-h-[44px]"
                  )}
                >
                  <Send className="h-3.5 w-3.5" />
                  はげましを送る
                </button>

                <AnimatePresence>
                  {showStamps && (
                    <motion.div
                      initial={
                        prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }
                      }
                      transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                      className="mt-2 grid grid-cols-2 gap-2"
                    >
                      {STAMPS.map((stamp) => (
                        <button
                          type="button"
                          key={stamp.id}
                          onClick={() => handleSendStamp(stamp)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2",
                            "border border-[var(--border)] bg-[var(--surface)]",
                            "font-ui text-xs text-[var(--foreground)]",
                            "transition-all duration-150",
                            "hover:border-[var(--primary)] hover:bg-[var(--primary)]/5",
                            "active:scale-[0.97]",
                            "min-h-[44px]"
                          )}
                        >
                          <span className="text-base">{stamp.emoji}</span>
                          {stamp.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 送信済みフィードバック */}
                <AnimatePresence>
                  {sentStamp && (
                    <motion.p
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 flex items-center gap-1 font-ui text-xs text-[var(--primary)]"
                    >
                      <Check className="h-3.5 w-3.5" />
                      送信しました！
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// -- ファミリー未参加UI --
function JoinFamilyUI({
  prefersReducedMotion,
  onCreateFamily,
}: {
  prefersReducedMotion: boolean | null;
  onCreateFamily: () => void;
}) {
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = () => {
    if (!inviteCode.trim()) return;
    setJoining(true);
    // デモ: 参加処理（実際はAPI呼び出し）
    setTimeout(() => setJoining(false), 1000);
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-lg px-4 pt-8"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]/10 text-4xl">
          🦉
        </div>
        <h1 className="font-heading text-xl font-bold text-[var(--foreground)]">
          かぞくとつながろう
        </h1>
        <p className="mt-2 font-ui text-sm text-[var(--foreground-secondary)]">
          ファミリーに参加して、みんなで脳トレをたのしもう！
        </p>
      </div>

      {/* 招待コードで参加 */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <LogIn className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="font-heading text-base font-bold text-[var(--foreground)]">
            招待コードで参加
          </h2>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="招待コードを入力"
            className={cn(
              "flex-1 rounded-[var(--radius-md)] border border-[var(--border)]",
              "bg-[var(--surface-secondary)] px-3 py-2.5",
              "font-ui text-sm text-[var(--foreground)]",
              "placeholder:text-[var(--foreground-muted)]",
              "focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20",
              "min-h-[44px]"
            )}
            aria-label="招待コード"
          />
          <button
            type="button"
            onClick={handleJoin}
            disabled={!inviteCode.trim() || joining}
            className={cn(
              "rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2.5",
              "font-ui text-sm font-medium text-white",
              "transition-all duration-150",
              "hover:bg-[var(--primary-dark)]",
              "disabled:opacity-50",
              "min-h-[44px] min-w-[44px]"
            )}
          >
            参加
          </button>
        </div>
      </div>

      {/* 新規作成 */}
      <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Plus className="h-5 w-5 text-[var(--secondary)]" />
          <h2 className="font-heading text-base font-bold text-[var(--foreground)]">
            新しいファミリーをつくる
          </h2>
        </div>
        <p className="mb-3 font-ui text-xs text-[var(--foreground-secondary)]">
          ファミリーを作って、招待コードで家族をよぼう
        </p>
        <button
          type="button"
          onClick={onCreateFamily}
          className={cn(
            "w-full rounded-[var(--radius-md)] border-2 border-dashed border-[var(--secondary)]/40",
            "bg-[var(--secondary)]/5 px-4 py-3",
            "font-ui text-sm font-medium text-[var(--secondary)]",
            "transition-all duration-150",
            "hover:border-[var(--secondary)] hover:bg-[var(--secondary)]/10",
            "min-h-[44px]"
          )}
        >
          ファミリーを作成する
        </button>
      </div>

      {/* デモデータボタン */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onCreateFamily}
          className={cn(
            "rounded-[var(--radius-md)] px-4 py-2",
            "font-ui text-xs text-[var(--foreground-muted)]",
            "border border-[var(--border-light)]",
            "transition-colors duration-150",
            "hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground-secondary)]",
            "min-h-[44px]"
          )}
        >
          デモデータを入れる
        </button>
      </div>
    </motion.div>
  );
}

// -- メインページ --
export default function FamilyPage() {
  const prefersReducedMotion = useReducedMotion();
  const family = useFamilyStore((s) => s.family);
  const members = useFamilyStore((s) => s.members);
  const messages = useFamilyStore((s) => s.messages);
  const setFamily = useFamilyStore((s) => s.setFamily);
  const addMessage = useFamilyStore((s) => s.addMessage);
  const user = useUserStore((s) => s.user);

  const [copiedCode, setCopiedCode] = useState(false);

  // デモファミリー作成
  const handleCreateDemoFamily = useCallback(() => {
    const demoFamily = generateDemoFamily();
    setFamily(demoFamily);
  }, [setFamily]);

  // スタンプ送信
  const handleSendStamp = useCallback(
    (memberId: string, stamp: (typeof STAMPS)[number]) => {
      const message: Message = {
        id: generateId("msg"),
        familyId: family?.id ?? "",
        senderId: user?.id ?? "guest",
        senderName: user?.name ?? "ゲスト",
        type: "stamp",
        content: `${stamp.emoji} ${stamp.label}`,
        createdAt: new Date().toISOString(),
        readBy: [user?.id ?? "guest"],
      };
      addMessage(message);
    },
    [family?.id, user?.id, user?.name, addMessage]
  );

  // 招待コードコピー
  const handleCopyCode = useCallback(() => {
    if (!family?.inviteCode) return;
    navigator.clipboard.writeText(family.inviteCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, [family?.inviteCode]);

  // ランキング
  const ranking = useMemo(() => getWeeklyRanking(members), [members]);

  // 最新メッセージ
  const recentMessages = useMemo(() => {
    return [...messages]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [messages]);

  // ファミリー未参加
  if (!family) {
    return (
      <JoinFamilyUI
        prefersReducedMotion={prefersReducedMotion}
        onCreateFamily={handleCreateDemoFamily}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-6 pb-8">
      {/* ヘッダー */}
      <motion.div
        className="mb-5"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-[var(--foreground)]">
            {family.name}
          </h1>
          <button
            type="button"
            onClick={handleCopyCode}
            className={cn(
              "flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5",
              "border border-[var(--border)] bg-[var(--surface)]",
              "font-ui text-xs text-[var(--foreground-secondary)]",
              "transition-colors duration-150 hover:bg-[var(--surface-secondary)]",
              "min-h-[36px]"
            )}
            aria-label="招待コードをコピー"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                コピーしました
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                {family.inviteCode}
              </>
            )}
          </button>
        </div>
        <p className="mt-1 font-ui text-xs text-[var(--foreground-muted)]">
          {members.length}人のメンバー
        </p>
      </motion.div>

      {/* 今週のランキング */}
      <motion.section
        className="mb-5"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.1 }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Crown className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="font-heading text-base font-bold text-[var(--foreground)]">
            今週のランキング
          </h2>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {ranking.map((member, idx) => (
            <div
              key={member.userId}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                idx < ranking.length - 1 && "border-b border-[var(--border-light)]",
                idx === 0 && "bg-[var(--accent)]/5"
              )}
            >
              <span className="w-8 text-center font-heading text-lg">
                {getRankMedal(idx)}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xl">
                🦉
              </div>
              <div className="flex-1">
                <p className="font-heading text-sm font-bold text-[var(--foreground)]">
                  {member.name}
                </p>
              </div>
              <div className="text-right">
                <span className="font-heading text-sm font-bold text-[var(--primary)]">
                  {member.weeklyScore}
                </span>
                <span className="font-ui text-[10px] text-[var(--foreground-muted)]">
                  {" "}pt
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* メンバー一覧 */}
      <motion.section
        className="mb-5"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.2 }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-[var(--info)]" />
          <h2 className="font-heading text-base font-bold text-[var(--foreground)]">
            メンバー
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <MemberCard
              key={member.userId}
              member={member}
              prefersReducedMotion={prefersReducedMotion}
              onSendStamp={handleSendStamp}
            />
          ))}
        </div>
      </motion.section>

      {/* 最近のメッセージ */}
      {recentMessages.length > 0 && (
        <motion.section
          className="mb-5"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.3 }}
        >
          <h2 className="mb-3 font-heading text-base font-bold text-[var(--foreground)]">
            さいきんのメッセージ
          </h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            {recentMessages.map((msg, idx) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  idx < recentMessages.length - 1 &&
                    "border-b border-[var(--border-light)]"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-lg">
                  🦉
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-xs text-[var(--foreground-secondary)]">
                    {msg.senderName}
                  </p>
                  <p className="truncate font-ui text-sm text-[var(--foreground)]">
                    {msg.content}
                  </p>
                </div>
                <span className="font-ui text-[10px] text-[var(--foreground-muted)] whitespace-nowrap">
                  {new Date(msg.createdAt).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
