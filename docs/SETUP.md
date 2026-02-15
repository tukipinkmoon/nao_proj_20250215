# セットアップガイド

のうかつ - 3世代つながる脳トレアプリ

---

## 前提条件

| ソフトウェア | バージョン | 確認コマンド |
|-------------|-----------|------------|
| Node.js | 20.x 以上 | `node --version` |
| npm | 10.x 以上 | `npm --version` |

---

## インストール手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd nao_proj_20250215
```

### 2. 依存パッケージのインストール

```bash
cd app
npm install
```

---

## 開発サーバー起動

```bash
cd app
npm run dev
```

起動後、ブラウザで以下のURLにアクセス:

```
http://localhost:3000
```

開発サーバーはホットリロードに対応しており、ファイルを保存すると自動的に画面が更新されます。

---

## ビルド

本番用ビルドを作成:

```bash
cd app
npm run build
```

ビルド成果物は `app/.next/` ディレクトリに出力されます。

### ビルド後の起動

```bash
cd app
npm run start
```

---

## テスト実行

### ユニットテスト

```bash
cd app
npx vitest
```

### ウォッチモード（ファイル変更時に自動実行）

```bash
cd app
npx vitest --watch
```

### カバレッジレポート

```bash
cd app
npx vitest --coverage
```

### テスト対象

| テストファイル | テスト対象 | 説明 |
|--------------|----------|------|
| `src/__tests__/utils.test.ts` | `lib/utils.ts` | 日付、統計、スコア正規化、ランダム、ID生成 |
| `src/__tests__/difficulty.test.ts` | `lib/game-engine/difficulty.ts` | 難易度調整アルゴリズム |
| `src/__tests__/scoring.test.ts` | `lib/game-engine/scoring.ts` | スコア計算、カテゴリトレンド |
| `src/__tests__/questions.test.ts` | `lib/game-engine/questions.ts` | 問題生成（全カテゴリ） |

---

## リント

ESLint によるコード品質チェック:

```bash
cd app
npm run lint
```

---

## 環境変数

現時点では環境変数の設定は不要です。全ての設定はクライアントサイドのローカルストレージで管理されています。

将来的にバックエンドAPI連携やCC-Auth認証を追加する際に、以下の環境変数が必要になる予定です:

```bash
# .env.local（将来使用予定）
# NEXT_PUBLIC_API_URL=https://api.example.com
# NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/callback
```

---

## プロジェクト構造

```
nao_proj_20250215/
├── app/                    # Next.js アプリケーション
│   ├── src/               # ソースコード
│   ├── package.json       # 依存パッケージ定義
│   ├── tsconfig.json      # TypeScript設定
│   └── .next/             # ビルド出力（gitignore）
└── docs/                  # ドキュメント
    ├── ARCHITECTURE.md    # アーキテクチャ
    ├── SETUP.md           # セットアップガイド（本ファイル）
    ├── API.md             # 内部API/モジュール
    ├── requirements/      # 要件定義
    ├── design/            # 設計ドキュメント
    ├── test-design/       # テスト設計
    ├── quality/           # 品質レポート
    └── UX-REVIEW/         # UXレビュー
```

---

## トラブルシューティング

### `npm install` でエラーが出る場合

```bash
# node_modules を削除して再インストール
rm -rf app/node_modules app/package-lock.json
cd app && npm install
```

### ポート3000が使用中の場合

```bash
# 別のポートで起動
cd app
npx next dev -p 3001
```

### TypeScript の型エラーが出る場合

```bash
# TypeScript のバージョン確認
cd app
npx tsc --version

# 型チェックのみ実行
npx tsc --noEmit
```

---

*のうかつ v0.1.0 - セットアップガイド*
