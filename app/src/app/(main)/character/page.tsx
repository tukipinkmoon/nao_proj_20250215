"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Coins,
  ShoppingBag,
  Sparkles,
  Check,
  Lock,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCharacterStore } from "@/stores/character";
import { useScoreStore } from "@/stores/score";
import type { CharacterEmotion } from "@/types";

// -- アイテムデータ定義 --
const SHOP_ITEMS = [
  {
    id: "hat-beret",
    name: "ベレーぼう",
    category: "hat" as const,
    cost: 50,
    imageUrl: "",
    emoji: "🎩",
  },
  {
    id: "hat-crown",
    name: "おうかん",
    category: "hat" as const,
    cost: 200,
    imageUrl: "",
    emoji: "👑",
    requiredLevel: 3,
  },
  {
    id: "acc-glasses",
    name: "メガネ",
    category: "accessory" as const,
    cost: 30,
    imageUrl: "",
    emoji: "👓",
  },
  {
    id: "acc-bowtie",
    name: "リボン",
    category: "accessory" as const,
    cost: 40,
    imageUrl: "",
    emoji: "🎀",
  },
  {
    id: "acc-scarf",
    name: "マフラー",
    category: "accessory" as const,
    cost: 60,
    imageUrl: "",
    emoji: "🧣",
  },
  {
    id: "bg-forest",
    name: "もりのなか",
    category: "background" as const,
    cost: 100,
    imageUrl: "",
    emoji: "🌲",
    requiredLevel: 2,
  },
  {
    id: "bg-space",
    name: "うちゅう",
    category: "background" as const,
    cost: 150,
    imageUrl: "",
    emoji: "🌌",
    requiredLevel: 4,
  },
  {
    id: "eff-sparkle",
    name: "キラキラ",
    category: "effect" as const,
    cost: 80,
    imageUrl: "",
    emoji: "✨",
  },
  {
    id: "eff-rainbow",
    name: "にじ",
    category: "effect" as const,
    cost: 120,
    imageUrl: "",
    emoji: "🌈",
    requiredLevel: 2,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  hat: "ぼうし",
  accessory: "アクセサリー",
  background: "はいけい",
  effect: "エフェクト",
};

// -- キャラクターの台詞 --
function getCharacterDialogue(
  emotion: CharacterEmotion,
  level: number,
  hour: number
): string {
  if (hour >= 22 || hour < 5) {
    return "むにゃむにゃ...おやすみなさい...zzZ";
  }

  switch (emotion) {
    case "celebrating":
      return "やったー！すばらしい成果だね！🎉";
    case "excited":
      return "おお！きょうの調子はバツグンだ！";
    case "encouraging":
      return "だいじょうぶ！いっしょにがんばろう！";
    case "thinking":
      return "うーん、なにかいいアイデアがありそうだ...";
    case "sleeping":
      return "むにゃむにゃ...おやすみなさい...zzZ";
    case "happy":
    default:
      if (level >= 4) return "レベル" + level + "！もうすっかりベテランだね！";
      if (level >= 2) return "いいかんじ！つづけることが大切だよ！";
      return "こんにちは！きょうもいっしょにがんばろう！";
  }
}

// -- レベルプログレスバー --
function LevelProgress({
  level,
  prefersReducedMotion,
}: {
  level: number;
  prefersReducedMotion: boolean | null;
}) {
  const maxLevel = 5;
  const progress = (level / maxLevel) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="font-ui text-xs text-[var(--foreground-secondary)]">
        Lv.
      </span>
      <div className="relative flex-1 h-3 rounded-[var(--radius-full)] bg-[var(--surface-secondary)] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-[var(--radius-full)] bg-[var(--accent)]"
          initial={
            prefersReducedMotion ? { width: `${progress}%` } : { width: "0%" }
          }
          animate={{ width: `${progress}%` }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="font-heading text-sm font-bold text-[var(--accent-dark)] tabular-nums">
        {level}
      </span>
      <span className="font-ui text-[10px] text-[var(--foreground-muted)]">
        / {maxLevel}
      </span>
    </div>
  );
}

// -- メインページ --
export default function CharacterPage() {
  const prefersReducedMotion = useReducedMotion();
  const characterState = useCharacterStore((s) => s.characterState);
  const availableItems = useCharacterStore((s) => s.availableItems);
  const setAvailableItems = useCharacterStore((s) => s.setAvailableItems);
  const buyItem = useCharacterStore((s) => s.buyItem);
  const equipItem = useCharacterStore((s) => s.equipItem);
  const unequipItem = useCharacterStore((s) => s.unequipItem);
  const addCoins = useCharacterStore((s) => s.addCoins);
  const canAfford = useCharacterStore((s) => s.canAfford);

  const scores = useScoreStore((s) => s.scores);

  const [selectedCategory, setSelectedCategory] = useState<string>("hat");
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);

  // アイテムをストアに登録
  useEffect(() => {
    if (availableItems.length === 0) {
      setAvailableItems(
        SHOP_ITEMS.map((item) => ({
          ...item,
          imageUrl: item.imageUrl || "",
        }))
      );
    }
  }, [availableItems.length, setAvailableItems]);

  const hour = new Date().getHours();

  // 感情を決定
  const emotion = useMemo(() => {
    const latestScore = scores.length > 0 ? scores[scores.length - 1] : null;
    if (latestScore && latestScore.normalizedScore >= 90) return "excited" as const;
    if (latestScore && latestScore.normalizedScore < 50) return "encouraging" as const;
    if (hour >= 22 || hour < 5) return "sleeping" as const;
    return characterState.emotion;
  }, [scores, hour, characterState.emotion]);

  const dialogue = getCharacterDialogue(
    emotion,
    characterState.level,
    hour
  );

  // カテゴリ別アイテム
  const categorizedItems = useMemo(() => {
    return SHOP_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  // アイテム購入
  const handleBuy = useCallback(
    (itemId: string) => {
      const success = buyItem(itemId);
      if (success) {
        setPurchaseFeedback(itemId);
        setTimeout(() => setPurchaseFeedback(null), 2000);
      }
    },
    [buyItem]
  );

  // 装着/外す
  const handleToggleEquip = useCallback(
    (itemId: string) => {
      if (characterState.equippedItems.includes(itemId)) {
        unequipItem(itemId);
      } else {
        equipItem(itemId);
      }
    },
    [characterState.equippedItems, equipItem, unequipItem]
  );

  // 装着中アイテムの絵文字
  const equippedEmojis = useMemo(() => {
    return SHOP_ITEMS.filter((item) =>
      characterState.equippedItems.includes(item.id)
    ).map((item) => item.emoji);
  }, [characterState.equippedItems]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-6 pb-8">
      {/* キャラクター表示エリア */}
      <motion.div
        className="mb-6"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
      >
        <div
          className={cn(
            "relative flex flex-col items-center rounded-[var(--radius-xl)] p-6",
            "bg-gradient-to-b from-[var(--primary)]/10 to-[var(--surface)]",
            "border border-[var(--border)]"
          )}
        >
          {/* 装着アイテム表示（頭上） */}
          {equippedEmojis.length > 0 && (
            <div className="mb-1 flex gap-1">
              {equippedEmojis.map((e, i) => (
                <motion.span
                  key={i}
                  className="text-lg"
                  initial={
                    prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.2,
                    delay: i * 0.05,
                  }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
          )}

          {/* フクロウ本体 */}
          <motion.div
            className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--primary)]/15 text-7xl"
            animate={
              prefersReducedMotion
                ? {}
                : emotion === "sleeping"
                  ? { rotate: [0, -5, 5, -5, 0] }
                  : emotion === "excited" || emotion === "celebrating"
                    ? { scale: [1, 1.05, 1] }
                    : {}
            }
            transition={{
              repeat: Infinity,
              duration: emotion === "sleeping" ? 3 : 2,
              repeatType: "loop",
            }}
          >
            🦉
          </motion.div>

          {/* レベル */}
          <div className="mt-3 w-full max-w-[200px]">
            <LevelProgress
              level={characterState.level}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>

          {/* 台詞吹き出し */}
          <motion.div
            className={cn(
              "mt-4 rounded-[var(--radius-lg)] bg-[var(--surface)] px-4 py-3",
              "border border-[var(--border-light)] shadow-[var(--shadow-sm)]",
              "relative"
            )}
            initial={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }
            }
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.3,
              delay: 0.2,
            }}
          >
            {/* 吹き出し三角 */}
            <div
              className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-[var(--border-light)] bg-[var(--surface)]"
              aria-hidden="true"
            />
            <p className="relative font-ui text-sm text-[var(--foreground)] text-center text-balance">
              {dialogue}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* コイン表示 */}
      <motion.div
        className="mb-5 flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-[var(--accent)]" />
          <span className="font-heading text-sm font-bold text-[var(--foreground)]">
            もっているコイン
          </span>
        </div>
        <span className="font-heading text-xl font-bold text-[var(--accent-dark)] tabular-nums">
          {characterState.coins}
          <span className="ml-1 text-sm font-normal text-[var(--foreground-muted)]">
            枚
          </span>
        </span>
      </motion.div>

      {/* コインがない場合のヒント＆デモボタン */}
      {characterState.coins === 0 && (
        <motion.div
          className="mb-5 text-center"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.15 }}
        >
          <p className="mb-2 font-ui text-xs text-[var(--foreground-muted)]">
            トレーニングをするとコインがもらえるよ！
          </p>
          <button
            type="button"
            onClick={() => addCoins(500)}
            className={cn(
              "rounded-[var(--radius-md)] px-4 py-2",
              "font-ui text-xs text-[var(--foreground-muted)]",
              "border border-[var(--border-light)]",
              "transition-colors duration-150",
              "hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground-secondary)]",
              "min-h-[44px]"
            )}
          >
            デモ: 500コインもらう
          </button>
        </motion.div>
      )}

      {/* 着せ替えショップ */}
      <motion.section
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.2 }}
      >
        <div className="mb-3 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-[var(--secondary)]" />
          <h2 className="font-heading text-base font-bold text-[var(--foreground)]">
            きせかえショップ
          </h2>
        </div>

        {/* カテゴリタブ */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={cn(
                "whitespace-nowrap rounded-[var(--radius-full)] px-3.5 py-1.5",
                "font-ui text-xs transition-all duration-150",
                "min-h-[36px]",
                selectedCategory === key
                  ? "bg-[var(--primary)] text-white font-medium"
                  : "bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
              )}
              aria-pressed={selectedCategory === key}
            >
              {label}
            </button>
          ))}
        </div>

        {/* アイテムグリッド */}
        <div className="grid grid-cols-3 gap-3">
          {categorizedItems.map((item) => {
            const owned = characterState.ownedItems.includes(item.id);
            const equipped = characterState.equippedItems.includes(item.id);
            const affordable = canAfford(item.cost);
            const levelLocked =
              item.requiredLevel !== undefined &&
              characterState.level < item.requiredLevel;

            return (
              <motion.div
                key={item.id}
                layout={!prefersReducedMotion}
                className={cn(
                  "relative flex flex-col items-center rounded-[var(--radius-lg)] p-3",
                  "border transition-all duration-150",
                  equipped
                    ? "border-[var(--primary)] bg-[var(--primary)]/8"
                    : owned
                      ? "border-[var(--accent)]/40 bg-[var(--surface)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                )}
              >
                {/* 装着中バッジ */}
                {equipped && (
                  <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}

                {/* レベルロック */}
                {levelLocked && !owned && (
                  <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--foreground-muted)] text-white">
                    <Lock className="h-3 w-3" />
                  </div>
                )}

                {/* アイテム絵文字 */}
                <span className="mb-1 text-3xl">{item.emoji}</span>

                {/* アイテム名 */}
                <span className="mb-1 font-ui text-[11px] text-[var(--foreground)] text-center">
                  {item.name}
                </span>

                {/* レベル要件 */}
                {levelLocked && !owned && (
                  <span className="mb-1 flex items-center gap-0.5 font-ui text-[9px] text-[var(--foreground-muted)]">
                    <Star className="h-2.5 w-2.5" />
                    Lv.{item.requiredLevel}~
                  </span>
                )}

                {/* ボタン */}
                {owned ? (
                  <button
                    type="button"
                    onClick={() => handleToggleEquip(item.id)}
                    className={cn(
                      "w-full rounded-[var(--radius-md)] px-2 py-1.5",
                      "font-ui text-[10px] font-medium",
                      "transition-all duration-150",
                      "min-h-[32px]",
                      equipped
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                    )}
                  >
                    {equipped ? "はずす" : "つける"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBuy(item.id)}
                    disabled={!affordable || levelLocked}
                    className={cn(
                      "flex w-full items-center justify-center gap-1 rounded-[var(--radius-md)] px-2 py-1.5",
                      "font-ui text-[10px] font-medium",
                      "transition-all duration-150",
                      "min-h-[32px]",
                      affordable && !levelLocked
                        ? "bg-[var(--accent)]/15 text-[var(--accent-dark)] hover:bg-[var(--accent)]/25"
                        : "bg-[var(--surface-secondary)] text-[var(--foreground-muted)] opacity-60"
                    )}
                  >
                    <Coins className="h-3 w-3" />
                    {item.cost}
                  </button>
                )}

                {/* 購入完了フィードバック */}
                <AnimatePresence>
                  {purchaseFeedback === item.id && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary)]/90"
                      initial={
                        prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }
                      }
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="text-center text-white">
                        <Check className="mx-auto h-6 w-6" />
                        <p className="mt-1 font-ui text-xs">ゲット！</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
