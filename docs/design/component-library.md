# コンポーネントライブラリ: 脳活ファミリー

> **バージョン**: 1.0.0
> **作成日**: 2026-02-15
> **Phase**: 2 - 設計
> **参照**: [design-system.yml](./design-system.yml) | [design-requirements.md](../requirements/design-requirements.md)

---

## 目次

1. [技術スタックと基本方針](#1-技術スタックと基本方針)
2. [ユーティリティ](#2-ユーティリティ)
3. [CSS Custom Properties によるテーマ管理](#3-css-custom-properties-によるテーマ管理)
4. [3モード対応アーキテクチャ](#4-3モード対応アーキテクチャ)
5. [Button（ボタン）](#5-buttonボタン)
6. [Card（カード）](#6-cardカード)
7. [Input / TextField（入力フィールド）](#7-input--textfield入力フィールド)
8. [Dialog / Modal（ダイアログ）](#8-dialog--modalダイアログ)
9. [Toast / Notification（トースト通知）](#9-toast--notification通知)
10. [Avatar（アバター）](#10-avatarアバター)
11. [Badge（バッジ）](#11-badgeバッジ)
12. [Tabs（タブ）](#12-tabsタブ)
13. [Progress（プログレスバー）](#13-progressプログレスバー)
14. [Navigation（ナビゲーション）](#14-navigationナビゲーション)
15. [CharacterDisplay（キャラクター表示）](#15-characterdisplayキャラクター表示)
16. [ScoreCard（スコアカード）](#16-scorecardスコアカード)
17. [Chart（グラフ）](#17-chartグラフ)
18. [Empty State（空状態）](#18-empty-state空状態)

---

## 1. 技術スタックと基本方針

### 技術スタック

| 技術 | バージョン | 用途 |
|------|----------|------|
| shadcn/ui | latest | UIコンポーネントベース |
| Tailwind CSS | v4 | スタイリング |
| motion/react | latest | アニメーション |
| Lucide React | latest | アイコン |
| Recharts | latest | グラフ・チャート |

### カスタマイズ基本方針

shadcn/ui コンポーネントをベースにカスタマイズする。「温かみ」と「3世代対応」が最優先事項。

- **角丸を大きく**: 全体的に `radius-md: 12px` 以上を使用し、温かみを表現
- **シャドウをグリーン系に**: `rgba(44, 62, 45, ...)` で温かみのある影
- **サイズをモード可変に**: `useUIMode()` フックで3モードに応じたサイズを動的適用
- **赤色禁止**: エラー系はすべてコーラル `#E8845C` で代替
- **否定的表現禁止**: 「失敗」「間違い」の代わりに「おしい!」「もう一度」

---

## 2. ユーティリティ

### cn ユーティリティ

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### useUIMode フック

```typescript
// hooks/useUIMode.ts
type UIMode = "senior" | "standard" | "kids";

interface UIModeConfig {
  mode: UIMode;
  fontSize: { min: number; body: number; heading: number };
  touchTarget: number;
  buttonHeight: number;
  lineHeight: number;
  animationIntensity: number;
  contrast: string;
  character: string;
}

export function useUIMode(): UIModeConfig {
  // プロフィールの年齢 or 設定画面の手動選択から判定
  // コンテキストプロバイダー経由で全コンポーネントに提供
}
```

### モード別クラス名ヘルパー

```typescript
// lib/mode-styles.ts
export function getModeClasses(mode: UIMode) {
  const base = {
    senior: {
      text: "text-[20px] leading-[1.8]",
      button: "min-h-[56px] text-[20px]",
      touchTarget: "min-w-[56px] min-h-[56px]",
      spacing: "gap-3",     // 12px間隔
    },
    standard: {
      text: "text-base leading-[1.6]",
      button: "min-h-[44px] text-base",
      touchTarget: "min-w-[48px] min-h-[48px]",
      spacing: "gap-2",     // 8px間隔
    },
    kids: {
      text: "text-[18px] leading-[1.7]",
      button: "min-h-[48px] text-[18px]",
      touchTarget: "min-w-[52px] min-h-[52px]",
      spacing: "gap-2",     // 8px間隔
    },
  };
  return base[mode];
}
```

---

## 3. CSS Custom Properties によるテーマ管理

### Light モード

```css
:root {
  /* ブランドカラー */
  --color-primary: 61 139 95;         /* #3D8B5F */
  --color-secondary: 232 132 92;      /* #E8845C */
  --color-accent: 242 201 76;         /* #F2C94C */

  /* 背景 */
  --color-background: 251 248 243;    /* #FBF8F3 */
  --color-surface: 255 255 255;       /* #FFFFFF */

  /* テキスト */
  --color-text-primary: 44 62 45;     /* #2C3E2D */
  --color-text-secondary: 107 124 108; /* #6B7C6C */

  /* セマンティック */
  --color-success: 91 169 123;        /* #5BA97B */
  --color-warning: 232 168 92;        /* #E8A85C */
  --color-info: 91 157 213;           /* #5B9BD5 */
  --color-danger: 232 132 92;         /* #E8845C (赤禁止) */

  /* ボーダー・シャドウ */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;

  /* 世代カラー */
  --color-gen-senior: 74 158 142;     /* #4A9E8E */
  --color-gen-parent: 91 141 201;     /* #5B8DC9 */
  --color-gen-kids: 232 142 122;      /* #E88E7A */
}
```

### Dark モード

```css
.dark {
  --color-background: 26 35 50;      /* #1A2332 */
  --color-surface: 42 63 85;         /* #2A3F55 */
  --color-text-primary: 240 237 230; /* #F0EDE6 */
  --color-text-secondary: 168 184 200; /* #A8B8C8 */
  --color-success: 109 191 139;      /* #6DBF8B */
  --color-warning: 240 184 108;      /* #F0B86C */
  --color-info: 108 170 224;         /* #6CAAE0 */
  --color-danger: 240 144 112;       /* #F09070 */
}
```

---

## 4. 3モード対応アーキテクチャ

### モード適用の仕組み

```
UIModeProvider (Context)
    |
    ├── useUIMode() フックでモード取得
    ├── data-mode="senior|standard|kids" 属性を <body> に付与
    └── Tailwind の data-[mode=senior]: バリアントで条件分岐
```

### Tailwind 設定

```typescript
// tailwind.config.ts 抜粋
{
  theme: {
    extend: {
      // data属性ベースのバリアント
    }
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('senior', '[data-mode="senior"] &');
      addVariant('kids', '[data-mode="kids"] &');
    }),
  ],
}
```

### コンポーネントでの使用パターン

```tsx
// すべてのコンポーネントで以下のパターンを適用
<button
  className={cn(
    // ベーススタイル（標準モード）
    "min-h-[44px] rounded-[12px] px-6 text-base",
    // シニアモード
    "senior:min-h-[56px] senior:text-[20px] senior:px-8",
    // キッズモード
    "kids:min-h-[48px] kids:text-[18px] kids:font-bold",
  )}
>
```

---

## 5. Button（ボタン）

### shadcn/ui からのカスタマイズ

| 項目 | shadcn/ui デフォルト | 脳活ファミリー |
|------|------------------|------------|
| border-radius | 6px | 12px |
| min-height | 36px | 44-56px（モード別） |
| font-weight | 500 | 600 |
| フォント | - | Zen Maru Gothic / Nunito |
| ホバー効果 | 色変更 | 色変更 + 微小スケール |
| プレス効果 | - | scale(0.97) |

### バリアント

| バリアント | 用途 | Light モード | Dark モード |
|----------|------|------------|-----------|
| `primary` | メインアクション（テスト開始、送信） | bg-primary text-white | bg-primary/90 |
| `secondary` | サブアクション（編集、設定） | bg-secondary text-white | bg-secondary/90 |
| `accent` | 達成・特別（レベルアップ、達成確認） | bg-accent text-dark | bg-accent/90 |
| `outline` | 控えめ（キャンセル、詳細を見る） | border-primary text-primary | border-primary/70 |
| `ghost` | ナビ・テキストリンク | transparent text-primary | transparent text-primary |
| `destructive` | 削除（最小限使用） | bg-danger text-white | bg-danger/90 |

### 3モード別仕様

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| 最小高さ | 56px | 44px | 48px |
| フォントサイズ | 20px | 16px | 18px |
| フォントウェイト | 700 | 600 | 700 |
| パディング左右 | 32px | 24px | 24px |
| アイコンサイズ | 24px | 20px | 22px |
| アイコン配置 | テキスト左に必ず配置 | 任意 | テキスト左に配置 |
| ラベル | 必ずテキスト表示 | アイコンのみ可 | ひらがなテキスト |
| プレスアニメーション | なし（フィードバック色変更のみ） | scale(0.97) 100ms | scale(0.95) + バウンス |
| フォーカスリング | 4px 太い | 3px 通常 | 3px 通常 |

### コード例

```tsx
// components/ui/button.tsx
import { cn } from "@/lib/utils";
import { useUIMode } from "@/hooks/useUIMode";
import { motion } from "motion/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function Button({ variant = "primary", children, icon, className, ...props }: ButtonProps) {
  const { mode } = useUIMode();

  return (
    <motion.button
      whileTap={mode === "senior" ? {} : { scale: mode === "kids" ? 0.95 : 0.97 }}
      className={cn(
        // ベース
        "inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold",
        "transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary focus-visible:ring-offset-2",
        // 標準サイズ
        "min-h-[44px] px-6 text-base",
        // シニア
        "senior:min-h-[56px] senior:px-8 senior:text-[20px] senior:font-bold",
        "senior:focus-visible:ring-[4px]",
        // キッズ
        "kids:min-h-[48px] kids:text-[18px] kids:font-bold",
        // バリアント
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
```

---

## 6. Card（カード）

### shadcn/ui からのカスタマイズ

| 項目 | shadcn/ui デフォルト | 脳活ファミリー |
|------|------------------|------------|
| border-radius | 8px | 16px |
| shadow | 標準の黒系 | グリーン系 `rgba(44, 62, 45, 0.08)` |
| padding | 16px | 16-24px（モード別） |
| ホバー | なし | 影が大きくなる + translateY(-2px) |

### 3モード別仕様

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| パディング | 24px | 16px | 20px |
| 角丸 | 20px | 16px | 16px |
| 見出しサイズ | 24px | 20px | 22px |
| 本文サイズ | 20px | 16px | 18px |
| ホバーエフェクト | 背景色変更のみ | 影拡大 + 浮き上がり | 影拡大 + バウンス |
| 情報密度 | 低（1-2項目） | 中（3-4項目） | 中（2-3項目 + イラスト） |

### カードバリエーション

| バリエーション | 用途 | 特殊仕様 |
|-------------|------|---------|
| `GameCard` | ゲーム選択画面 | アイコン大、難易度バッジ、完了状態表示 |
| `ScoreCard` | スコア表示 | 数値フォント Nunito、世代カラー枠線 |
| `FamilyCard` | 家族メンバー | アバター、世代カラーボーダー |
| `AchievementCard` | 達成バッジ | ゴールドアクセント、達成日表示 |
| `InfoCard` | ヒント・お知らせ | キャラクターアイコン + メッセージ |

### コード例

```tsx
// components/ui/card.tsx
export function Card({ children, variant, className, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-[16px] bg-surface p-4",
        "shadow-[0_4px_8px_rgba(44,62,45,0.08)]",
        "transition-shadow hover:shadow-[0_8px_16px_rgba(44,62,45,0.10)]",
        // シニア
        "senior:rounded-[20px] senior:p-6",
        // キッズ
        "kids:p-5",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

---

## 7. Input / TextField（入力フィールド）

### shadcn/ui からのカスタマイズ

| 項目 | shadcn/ui デフォルト | 脳活ファミリー |
|------|------------------|------------|
| border-radius | 6px | 12px |
| min-height | 36px | 48-56px（モード別） |
| border-width | 1px | 2px |
| フォーカス | リング | リング + ボーダーカラー変更 |

### 3モード別仕様

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| 最小高さ | 56px | 48px | 48px |
| フォントサイズ | 20px | 16px | 18px |
| ボーダー幅 | 3px | 2px | 2px |
| プレースホルダー | 大きめ文字、色濃いめ | 通常 | ひらがな |
| ラベル配置 | 上部ラベル必須、大きめ | 上部ラベル | 上部ラベル + ひらがな |
| ヘルパーテキスト | 大きめ (16px) | 通常 (14px) | 通常 + ふりがな |
| エラー表示 | コーラル + アイコン + テキスト | コーラル + テキスト | コーラル + キャラクター |
| 入力補助 | 自動フォーカス、入力候補表示 | 通常 | かな入力優先 |

### バリデーション表示

```
正常時:  グリーンボーダー + チェックアイコン
エラー時: コーラルボーダー + 注意アイコン + インラインメッセージ
         ※赤色 (#FF0000系) は使用禁止
```

---

## 8. Dialog / Modal（ダイアログ）

### shadcn/ui からのカスタマイズ

| 項目 | shadcn/ui デフォルト | 脳活ファミリー |
|------|------------------|------------|
| border-radius | 8px | 20px |
| overlay opacity | 0.8 | 0.4（圧迫感軽減） |
| 開くアニメーション | なし | scale(0.95->1.0) + fade 200ms |
| 閉じるアニメーション | なし | scale(1.0->0.95) + fade 150ms |

### 3モード別仕様

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| 最大幅 | 480px | 425px | 440px |
| パディング | 32px | 24px | 24px |
| タイトルサイズ | 28px | 20px | 24px |
| ボタンサイズ | 56px高 | 44px高 | 48px高 |
| ボタン配列 | 縦並び（1列） | 横並び | 横並び |
| 閉じるボタン | 大きい (40x40) + テキスト「とじる」 | 通常 (32x32) | 大きい (36x36) |
| アニメーション | フェードのみ | スケール+フェード | スケール+バウンス |
| オーバーレイ | 薄め (0.3) | 通常 (0.4) | 通常 (0.4) |

### 確認ダイアログ（シニアモード特別対応）

シニアモードでは重要操作（データ削除、設定変更）に2ステップ確認を適用。

```
ステップ1: 「○○しますか?」→「はい」「いいえ」
ステップ2: 「本当に○○しますか? この操作は取り消せません」→「○○する」「やめる」
```

---

## 9. Toast / Notification（通知）

### shadcn/ui からのカスタマイズ

| 項目 | shadcn/ui デフォルト | 脳活ファミリー |
|------|------------------|------------|
| border-radius | 6px | 16px |
| レイアウト | テキストのみ | 左アイコン + テキスト + 右閉じるボタン |
| 表示位置 | 右下 | 上部中央（シニアが見逃しにくい） |

### バリアント

| バリアント | アイコン | 背景色 | ボーダー色 |
|----------|--------|--------|----------|
| `success` | CheckCircle | success/10 | success |
| `warning` | AlertTriangle | warning/10 | warning |
| `info` | Info | info/10 | info |
| `error` | AlertCircle | danger/10 | danger (コーラル) |

### 3モード別仕様

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| フォントサイズ | 20px | 16px | 18px |
| アイコンサイズ | 32px | 24px | 28px |
| 表示時間 | 8秒 | 5秒 | 6秒 |
| 閉じるボタン | 大きめ + 「とじる」テキスト | X アイコン | X アイコン + 大きめ |
| アニメーション | スライドダウン（ゆっくり） | スライドダウン | スライドダウン + バウンス |
| 音声 | aria-live="assertive" | aria-live="polite" | aria-live="polite" |

---

## 10. Avatar（アバター）

### shadcn/ui からのカスタマイズ

| 項目 | shadcn/ui デフォルト | 脳活ファミリー |
|------|------------------|------------|
| border-radius | full | full |
| border | なし | 3px 世代カラー |
| サイズ | 固定 | モード別可変 |

### 世代別ボーダーカラー

| 世代 | ボーダーカラー |
|------|------------|
| シニア | `#4A9E8E` ティール |
| 親 | `#5B8DC9` ブルー |
| 子供・孫 | `#E88E7A` コーラルピンク |

### サイズ

| サイズ | シニアモード | 標準モード | キッズモード |
|--------|-----------|----------|-----------|
| sm | 40px | 32px | 36px |
| md | 56px | 40px | 48px |
| lg | 72px | 56px | 64px |
| xl | 96px | 80px | 88px |

---

## 11. Badge（バッジ）

### shadcn/ui からのカスタマイズ

| 項目 | shadcn/ui デフォルト | 脳活ファミリー |
|------|------------------|------------|
| border-radius | 4px | full (9999px) |
| padding | 2px 8px | 4px 12px（増量） |
| font-size | 12px | 14-18px（モード別） |

### バリアント

| バリアント | 用途 | スタイル |
|----------|------|---------|
| `default` | 一般的なラベル | bg-primary/10 text-primary |
| `success` | 達成、完了 | bg-success/10 text-success |
| `warning` | 注意、残り回数 | bg-warning/10 text-warning |
| `accent` | 新着、おすすめ | bg-accent/10 text-accent |
| `generation` | 世代表示 | 各世代カラー |
| `level` | レベル表示 | ゴールドグラデーション |
| `streak` | 連続日数 | アクセントイエロー |

### 3モード別仕様

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| フォントサイズ | 18px | 14px | 16px |
| パディング | 6px 16px | 4px 12px | 4px 14px |
| フォントウェイト | 700 | 600 | 700 |

---

## 12. Tabs（タブ）

### shadcn/ui からのカスタマイズ

| 項目 | shadcn/ui デフォルト | 脳活ファミリー |
|------|------------------|------------|
| アクティブ表示 | 下線 | 背景色変更 |
| サイズ | 小さめ | 大きめ（モード別） |
| 角丸 | なし | 12px（タブバー全体） |

### 3モード別仕様

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| タブ高さ | 56px | 44px | 48px |
| フォントサイズ | 20px | 16px | 18px |
| アイコンサイズ | 28px | 20px | 24px |
| アイコン表示 | アイコン + テキスト（常時） | レスポンシブ | アイコン + ひらがな |
| アクティブ表示 | 太いボーダー (4px) + 背景色 | 背景色変更 | 背景色 + バウンスアニメ |
| タブ間隔 | 8px | 4px | 4px |

### アクセシビリティ

```tsx
// ARIA ロール必須
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    日別
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">
    週別
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  {/* コンテンツ */}
</div>
```

---

## 13. Progress（プログレスバー）

### shadcn/ui からのカスタマイズ

| 項目 | shadcn/ui デフォルト | 脳活ファミリー |
|------|------------------|------------|
| border-radius | 4px | full (9999px) |
| height | 8px | 12px |
| アニメーション | なし | 値変更時にスムーズアニメーション |
| 色 | 単色 | プライマリグリーン + グラデーション可 |

### 3モード別仕様

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| 高さ | 16px | 12px | 14px |
| ラベル表示 | 大きめ数値 (24px) + 「%」 | 数値 (16px) | 数値 + 星マーク |
| アニメーション | なし（即座に表示） | スムーズ遷移 | スムーズ + パーティクル |
| 達成時 | 背景色がアクセントに変わる | 背景色変化 | 背景色変化 + 紙吹雪 |

### アクセシビリティ

```tsx
<div
  role="progressbar"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="テスト進捗: 75%"
>
  {/* プログレスバー描画 */}
</div>
```

---

## 14. Navigation（ナビゲーション）

### ボトムナビゲーション（モバイル）

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| 高さ | 80px | 64px | 72px |
| アイコンサイズ | 32px | 24px | 28px |
| ラベル表示 | 常に表示 (16px) | 常に表示 (12px) | ひらがな表示 (14px) |
| アクティブ表示 | 背景ピル + 太字 | ドット + 色変更 | 背景ピル + バウンス |
| 項目数 | 最大4項目 | 最大5項目 | 最大4項目 |
| セーフエリア | 下部パディング追加 | 自動 | 下部パディング追加 |

### ナビゲーション項目

| 項目 | アイコン | ラベル（標準） | ラベル（キッズ） |
|------|--------|------------|-------------|
| ホーム | Home | ホーム | おうち |
| テスト | Brain | テスト | あたまのたいそう |
| 家族 | Users | 家族 | かぞく |
| スコア | BarChart3 | スコア | スコア |
| 設定 | Settings | 設定 | せってい |

---

## 15. CharacterDisplay（キャラクター表示）

### 専用コンポーネント（shadcn/ui外）

アプリ固有のキャラクター表示コンポーネント。

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| キャラクター | のうかつ博士 | のうかつ先生 | のうかつくん |
| サイズ | 80px | 64px | 80px |
| アニメーション | まばたきのみ | 全アニメーション | 派手なアニメーション |
| 吹き出し文字 | 20px 丁寧語 | 16px 親しみ語 | 18px 元気語 |
| 出現場所 | テスト開始前、結果画面 | 結果画面、空状態 | 常駐（画面隅に浮遊） |

### 表情バリエーション

```tsx
type CharacterExpression =
  | "happy"      // 喜び（正解時）
  | "encourage"  // 応援（テスト開始前）
  | "thinking"   // 考え中（ローディング）
  | "surprised"  // 驚き（ハイスコア時）
  | "nod"        // うなずき（褒め時）
  | "hanamaru";  // はなまる（満点時）
```

### 禁止事項

- キャラクターが否定的な表情（怒り、悲しみ、がっかり）を見せることは**禁止**
- 不正解時も「おしい!」と励ます優しい表情を維持

---

## 16. ScoreCard（スコアカード）

### 専用コンポーネント（shadcn/ui外）

スコア表示に特化したカードコンポーネント。

| 項目 | 仕様 |
|------|------|
| 数値フォント | Nunito (tabular-nums) |
| 数値アニメーション | カウントアップ (1200ms) |
| 世代ボーダー | 上部に世代カラーの太線 (4px) |
| 5領域表示 | レーダーチャート（小） |

### 3モード別仕様

| 項目 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| スコア数値サイズ | 48px | 40px | 44px |
| 補足テキスト | 20px、やさしい日本語 | 14px | 18px、ひらがな混じり |
| グラフサイズ | 大 (200px) | 中 (160px) | 中 (180px) |
| 表示項目 | スコア + 前回比のみ | フル表示 | スコア + 星評価 |

---

## 17. Chart（グラフ）

### Recharts カスタマイズ方針

| 項目 | 仕様 |
|------|------|
| 配色 | ブランドカラーパレットから |
| 角丸 | 棒グラフの角を丸める (radius: 8px) |
| アニメーション | フェードイン + スケールアップ |
| ツールチップ | カスタムカード風デザイン (角丸16px) |
| レスポンシブ | `<ResponsiveContainer width="100%">` |

### シニアモード調整

| 調整項目 | 通常モード | シニアモード |
|---------|----------|-----------|
| 線の太さ | 2-3px | 4-5px |
| ドットサイズ | 4-6px | 8-10px |
| ラベルサイズ | 12px | 16px |
| 凡例サイズ | 14px | 18px |
| データポイント | 最大30 | 最大7（1週間） |
| 操作 | ホバー | タップ |
| グリッド線 | 薄い | 濃いめ |
| 凡例パターン | 色のみ | 色 + 線種（破線/点線/実線） |

---

## 18. Empty State（空状態）

### 専用コンポーネント（shadcn/ui外）

データがまだない画面で使用。

| 項目 | 仕様 |
|------|------|
| イラスト | キャラクター（世代別バリアント） |
| メッセージ | ポジティブな呼びかけ |
| CTA | メインアクションボタン |

### メッセージ例

| 画面 | シニアモード | 標準モード | キッズモード |
|------|-----------|----------|-----------|
| テスト未実施 | 「今日のテストをはじめましょう! のうかつ博士がお待ちしています」 | 「今日のテストがまだです。さっそく始めましょう!」 | 「きょうのたいそう、まだやってないよ! のうかつくんといっしょにやろう!」 |
| 家族未登録 | 「ご家族を招待して一緒に脳トレしませんか?」 | 「家族を招待して一緒に楽しもう!」 | 「かぞくをよんで、みんなでたのしもう!」 |
| スコアなし | 「テストをするとここにスコアが表示されます」 | 「テスト結果がここに表示されます」 | 「テストするとスコアがみれるよ!」 |

---

## 付録: コンポーネント一覧チェックリスト

### shadcn/ui ベースコンポーネント

| コンポーネント | カスタマイズ必須 | 3モード対応 | ARIA対応 |
|-------------|:----------:|:---------:|:-------:|
| Button | 必須 | 必須 | 必須 |
| Card | 必須 | 必須 | - |
| Input | 必須 | 必須 | 必須 |
| Textarea | 必須 | 必須 | 必須 |
| Select | 必須 | 必須 | 必須 |
| Dialog | 必須 | 必須 | 必須 |
| Sheet (Bottom) | 必須 | 必須 | 必須 |
| Toast | 必須 | 必須 | 必須 |
| Avatar | 必須 | 必須 | - |
| Badge | 必須 | 必須 | - |
| Tabs | 必須 | 必須 | 必須 |
| Progress | 必須 | 必須 | 必須 |
| Skeleton | 軽微 | 必須 | - |
| Tooltip | 軽微 | 必須 | 必須 |
| Dropdown Menu | 軽微 | 必須 | 必須 |
| Switch | 軽微 | 必須 | 必須 |
| Checkbox | 軽微 | 必須 | 必須 |
| Radio Group | 軽微 | 必須 | 必須 |
| Separator | 軽微 | - | - |
| Label | 軽微 | 必須 | 必須 |
| Scroll Area | 軽微 | 必須 | - |

### アプリ固有コンポーネント

| コンポーネント | 説明 | 3モード対応 |
|-------------|------|:---------:|
| CharacterDisplay | キャラクター表示・アニメーション | 必須 |
| ScoreCard | スコア表示カード | 必須 |
| GameCard | ゲーム選択カード | 必須 |
| FamilyCard | 家族メンバーカード | 必須 |
| AchievementCard | 達成バッジカード | 必須 |
| StreakCounter | 連続日数カウンター | 必須 |
| RadarChart | 5領域レーダー | 必須 |
| CalendarHeatmap | テスト実施カレンダー | 必須 |
| BottomNavigation | モバイルナビ | 必須 |
| EmptyState | 空状態 | 必須 |
| Confetti | 紙吹雪パーティクル | 必須 |
| SpeechBubble | キャラ吹き出し | 必須 |
| FuriganaText | ふりがなテキスト | キッズのみ |

---

*CCAGI SDK Phase 2 - コンポーネントライブラリ v1.0.0*
