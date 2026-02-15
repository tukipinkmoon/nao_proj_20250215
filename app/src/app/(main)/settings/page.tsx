"use client";

import { useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Settings,
  Monitor,
  Sun,
  Moon,
  Type,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Clock,
  Globe,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user";
import type { UIMode, UserSettings } from "@/types";

// -- UIモード定義 --
const UI_MODES: { mode: UIMode; label: string; description: string; emoji: string }[] = [
  {
    mode: "senior",
    label: "シニア",
    description: "大きい文字、シンプル操作",
    emoji: "🌿",
  },
  {
    mode: "standard",
    label: "標準",
    description: "バランスの良い表示",
    emoji: "📱",
  },
  {
    mode: "kids",
    label: "キッズ",
    description: "楽しい見た目、かんたん操作",
    emoji: "🌈",
  },
];

// -- テーマ定義 --
const THEMES: { value: UserSettings["theme"]; label: string; icon: typeof Monitor }[] = [
  { value: "system", label: "システム", icon: Monitor },
  { value: "light", label: "ライト", icon: Sun },
  { value: "dark", label: "ダーク", icon: Moon },
];

// -- フォントサイズ定義 --
const FONT_SIZES: {
  value: UserSettings["fontSize"];
  label: string;
  sampleSize: string;
}[] = [
  { value: "normal", label: "通常", sampleSize: "text-sm" },
  { value: "large", label: "大きい", sampleSize: "text-base" },
  { value: "extra-large", label: "とても大きい", sampleSize: "text-lg" },
];

// -- 言語定義 --
const LANGUAGES: { value: UserSettings["language"]; label: string }[] = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
];

// -- トグルスイッチ --
function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-[var(--radius-full)]",
        "transition-colors duration-150",
        "min-h-[44px] min-w-[44px]",
        enabled ? "bg-[var(--primary)]" : "bg-[var(--border)]"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-[var(--shadow-sm)]",
          "transition-transform duration-150",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

// -- セクション --
function SettingSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Settings;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--primary)]" />
        <h2 className="font-heading text-sm font-bold text-[var(--foreground)]">
          {title}
        </h2>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// -- 行アイテム --
function SettingRow({
  label,
  description,
  children,
  noBorder,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 min-h-[52px]",
        !noBorder && "border-b border-[var(--border-light)]"
      )}
    >
      <div>
        <p className="font-ui text-sm text-[var(--foreground)]">{label}</p>
        {description && (
          <p className="mt-0.5 font-ui text-[11px] text-[var(--foreground-muted)]">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// -- メインページ --
export default function SettingsPage() {
  const prefersReducedMotion = useReducedMotion();
  const settings = useUserStore((s) => s.settings);
  const user = useUserStore((s) => s.user);
  const updateSettings = useUserStore((s) => s.updateSettings);
  const setUIMode = useUserStore((s) => s.setUIMode);
  const logout = useUserStore((s) => s.logout);

  const handleUpdateSetting = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      updateSettings({ [key]: value });
    },
    [updateSettings]
  );

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
          <Settings className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="font-heading text-xl font-bold text-[var(--foreground)]">
            せってい
          </h1>
        </div>
      </motion.div>

      {/* UIモード切替 */}
      <motion.div
        className="mb-5"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.05 }}
      >
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="font-heading text-sm font-bold text-[var(--foreground)]">
            UIモード
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {UI_MODES.map(({ mode, label, description, emoji }) => (
            <button
              type="button"
              key={mode}
              onClick={() => setUIMode(mode)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] p-4",
                "border-2 transition-all duration-150",
                "min-h-[44px]",
                settings.uiMode === mode
                  ? "border-[var(--primary)] bg-[var(--primary)]/8 shadow-[var(--shadow-sm)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/30"
              )}
              aria-pressed={settings.uiMode === mode}
            >
              <span className="text-2xl">{emoji}</span>
              <span
                className={cn(
                  "font-heading text-xs font-bold",
                  settings.uiMode === mode
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground)]"
                )}
              >
                {label}
              </span>
              <span className="font-ui text-[10px] text-[var(--foreground-muted)] text-center leading-tight">
                {description}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* テーマ */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.1 }}
      >
        <SettingSection title="テーマ" icon={Sun}>
          <div className="flex gap-0 p-2">
            {THEMES.map(({ value, label, icon: ThemeIcon }) => (
              <button
                type="button"
                key={value}
                onClick={() => handleUpdateSetting("theme", value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-md)] py-2.5",
                  "font-ui text-xs transition-all duration-150",
                  "min-h-[44px]",
                  settings.theme === value
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                    : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                )}
                aria-pressed={settings.theme === value}
              >
                <ThemeIcon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </SettingSection>
      </motion.div>

      {/* フォントサイズ */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.15 }}
      >
        <SettingSection title="フォントサイズ" icon={Type}>
          <div className="flex gap-0 p-2">
            {FONT_SIZES.map(({ value, label, sampleSize }) => (
              <button
                type="button"
                key={value}
                onClick={() => handleUpdateSetting("fontSize", value)}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] py-2.5",
                  "font-ui transition-all duration-150",
                  "min-h-[44px]",
                  settings.fontSize === value
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                    : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                )}
                aria-pressed={settings.fontSize === value}
              >
                <span className={cn(sampleSize, "font-heading font-bold")}>
                  あ
                </span>
                <span className="text-[10px]">{label}</span>
              </button>
            ))}
          </div>
        </SettingSection>
      </motion.div>

      {/* サウンド & 通知 */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.2 }}
      >
        <SettingSection title="サウンド・通知" icon={Volume2}>
          <SettingRow label="サウンド" description="効果音の再生">
            <Toggle
              enabled={settings.soundEnabled}
              onChange={(v) => handleUpdateSetting("soundEnabled", v)}
              label="サウンド"
            />
          </SettingRow>
          <SettingRow label="通知" description="プッシュ通知">
            <Toggle
              enabled={settings.notificationEnabled}
              onChange={(v) => handleUpdateSetting("notificationEnabled", v)}
              label="通知"
            />
          </SettingRow>
          <SettingRow
            label="リマインダー時間"
            description="毎日のトレーニング通知"
            noBorder
          >
            <input
              type="time"
              value={settings.dailyReminderTime}
              onChange={(e) =>
                handleUpdateSetting("dailyReminderTime", e.target.value)
              }
              className={cn(
                "rounded-[var(--radius-md)] border border-[var(--border)]",
                "bg-[var(--surface-secondary)] px-3 py-1.5",
                "font-ui text-sm text-[var(--foreground)] tabular-nums",
                "focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20",
                "min-h-[36px]"
              )}
              aria-label="リマインダー時間"
            />
          </SettingRow>
        </SettingSection>
      </motion.div>

      {/* 言語 */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.25 }}
      >
        <SettingSection title="言語" icon={Globe}>
          <div className="flex gap-0 p-2">
            {LANGUAGES.map(({ value, label }) => (
              <button
                type="button"
                key={value}
                onClick={() => handleUpdateSetting("language", value)}
                className={cn(
                  "flex flex-1 items-center justify-center rounded-[var(--radius-md)] py-2.5",
                  "font-ui text-sm transition-all duration-150",
                  "min-h-[44px]",
                  settings.language === value
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                    : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                )}
                aria-pressed={settings.language === value}
              >
                {label}
              </button>
            ))}
          </div>
        </SettingSection>
      </motion.div>

      {/* アカウント */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.3 }}
      >
        <SettingSection title="アカウント" icon={User}>
          <SettingRow
            label={user?.name ?? "ゲストモード"}
            description={user ? user.ageGroup : "ログインしていません"}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xl">
              🦉
            </div>
          </SettingRow>
          <div className="px-4 py-3">
            <button
              type="button"
              onClick={logout}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)]",
                "border border-[var(--border)] px-4 py-2.5",
                "font-ui text-sm text-[var(--foreground-secondary)]",
                "transition-colors duration-150",
                "hover:bg-[var(--surface-secondary)]",
                "min-h-[44px]"
              )}
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        </SettingSection>
      </motion.div>

      {/* バージョン */}
      <motion.p
        className="mt-6 text-center font-ui text-[10px] text-[var(--foreground-muted)]"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.4 }}
      >
        のうかつ v1.0.0
      </motion.p>
    </div>
  );
}
