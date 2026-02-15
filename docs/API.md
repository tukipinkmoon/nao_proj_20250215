# 内部API/モジュールドキュメント

のうかつ - 3世代つながる脳トレアプリ

---

## game-engine/difficulty.ts

難易度自動調整モジュール。直近の正答率に基づいて難易度レベルを動的に変更する。

### 定数

| 定数名 | 値 | 説明 |
|--------|-----|------|
| `UPGRADE_THRESHOLD` | `0.8` | この正答率以上で難易度アップ |
| `DOWNGRADE_THRESHOLD` | `0.4` | この正答率以下で難易度ダウン |
| `MIN_ATTEMPTS` | `3` | 調整に必要な最小回答数 |

### adjustDifficulty

```typescript
function adjustDifficulty(profile: DifficultyProfile): DifficultyLevel
```

直近の正答率に基づいて次回の難易度レベルを計算する。

**引数**:

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `profile.category` | `ChallengeCategory` | チャレンジカテゴリ |
| `profile.currentLevel` | `DifficultyLevel` (1-5) | 現在の難易度レベル |
| `profile.recentAccuracies` | `number[]` | 直近5回の正答率（0-1） |

**戻り値**: `DifficultyLevel` (1-5) - 調整後の難易度レベル

**ロジック**:
- 回答数が`MIN_ATTEMPTS`未満 → 現在のレベルを維持
- 平均正答率 >= `UPGRADE_THRESHOLD` かつ現在レベル < 5 → レベル+1
- 平均正答率 <= `DOWNGRADE_THRESHOLD` かつ現在レベル > 1 → レベル-1
- それ以外 → 現在のレベルを維持

### getInitialDifficulty

```typescript
function getInitialDifficulty(ageGroup: string): DifficultyLevel
```

年齢グループに基づいた初期難易度を返す。

**引数**:

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `ageGroup` | `string` | 年齢グループ ("child", "teen", "adult", "senior") |

**戻り値**: `DifficultyLevel` (1-5)

| ageGroup | 初期難易度 |
|----------|----------|
| `child` | 1 |
| `teen` | 2 |
| `adult` | 3 |
| `senior` | 2 |
| その他 | 2 |

---

## game-engine/scoring.ts

スコア計算モジュール。正答率と応答速度からスコアを算出する。

### カテゴリ別重み

| カテゴリ | 重み |
|---------|------|
| memory | 0.25 |
| attention | 0.20 |
| language | 0.20 |
| math | 0.15 |
| spatial | 0.20 |

### calculateRawScore

```typescript
function calculateRawScore(answers: Answer[]): number
```

回答配列から生スコアを計算する。正答率ベースに応答速度ボーナス(最大20%)を加算。

**引数**: `answers: Answer[]` - 回答配列

**戻り値**: `number` (0-120) - 生スコア。四捨五入済み。

**計算式**: `(正答率 + 速度ボーナス) * 100`
- 速度ボーナス: `max(0, 1 - 平均応答時間(ms) / 10000) * 0.2`

### calculateAccuracy

```typescript
function calculateAccuracy(answers: Answer[]): number
```

正答率を計算する。

**引数**: `answers: Answer[]` - 回答配列

**戻り値**: `number` (0-1) - 正答率

### calculateTotalScore

```typescript
function calculateTotalScore(categoryScores: CategoryScore[]): number
```

カテゴリ別スコアの加重平均を計算する。

**引数**: `categoryScores: CategoryScore[]` - カテゴリ別スコア配列

**戻り値**: `number` (0-100) - 加重平均スコア。四捨五入済み。

### calculateCategoryTrend

```typescript
function calculateCategoryTrend(
  scores: number[],
  window?: number
): { trend: "up" | "down" | "stable"; changePercent: number }
```

スコア配列からトレンド（上昇/下降/安定）を判定する。

**引数**:

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|----------|------|
| `scores` | `number[]` | - | スコア履歴配列 |
| `window` | `number` | `7` | 移動平均の窓幅 |

**戻り値**: `{ trend, changePercent }`
- `trend`: `"up"` / `"down"` / `"stable"`
- `changePercent`: 変化率（%）。小数点第1位まで。

---

## game-engine/questions.ts

問題生成モジュール。カテゴリ・難易度に応じた問題を動的に生成する。

### generateQuestions

```typescript
function generateQuestions(type: ChallengeType, difficulty: DifficultyLevel): Question[]
```

メインの問題生成関数。チャレンジタイプに応じて適切な生成関数にディスパッチする。

**引数**:

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `type` | `ChallengeType` | 問題タイプ |
| `difficulty` | `DifficultyLevel` (1-5) | 難易度レベル |

**戻り値**: `Question[]` - 生成された問題配列

**対応タイプ**:

| type | 生成関数 | カテゴリ |
|------|---------|---------|
| `card-match` | `generateCardMatchQuestions` | 記憶力 |
| `word-memory` | `generateWordMemoryQuestions` | 記憶力 |
| `stroop` | `generateStroopQuestions` | 注意力 |
| `mental-math` | `generateMentalMathQuestions` | 計算力 |
| `anagram` | `generateAnagramQuestions` | 言語力 |
| その他 | `generateMentalMathQuestions` | フォールバック |

### generateCardMatchQuestions

```typescript
function generateCardMatchQuestions(difficulty: DifficultyLevel): Question[]
```

カードマッチ（絵合わせ）問題を生成する。

**難易度別ペア数**: 1→3ペア, 2→4ペア, 3→6ペア, 4→8ペア, 5→10ペア

**戻り値**: 1問（カード配列をmetadataに含む）

### generateWordMemoryQuestions

```typescript
function generateWordMemoryQuestions(difficulty: DifficultyLevel): Question[]
```

単語記憶問題を生成する。記憶フェーズ（表示）とリコールフェーズ（回答）の2問を返す。

**難易度別単語数**: 1→3語, 2→4語, 3→5語, 4→6語, 5→7語

**戻り値**: 2問（memorize + recall）

### generateStroopQuestions

```typescript
function generateStroopQuestions(difficulty: DifficultyLevel): Question[]
```

ストループテスト問題を生成する。文字の「色」を選択する注意力テスト。難易度3以上で不一致条件が追加される。

**難易度別問題数**: 1→5問, 2→7問, 3→10問, 4→12問, 5→15問

**色**: あか(`#E8845C`), あお(`#5B9BD5`), みどり(`#3D8B5F`), きいろ(`#F2C94C`)

### generateMentalMathQuestions

```typescript
function generateMentalMathQuestions(difficulty: DifficultyLevel): Question[]
```

暗算問題を生成する。四択形式。

**難易度別設定**:

| 難易度 | 問題数 | 数値範囲 | 演算子 |
|--------|--------|---------|--------|
| 1 | 5 | 1-10 | +, - |
| 2 | 7 | 1-20 | +, - |
| 3 | 10 | 1-50 | +, -, x |
| 4 | 12 | 1-100 | +, -, x |
| 5 | 15 | 10-200 | +, -, x |

### generateAnagramQuestions

```typescript
function generateAnagramQuestions(difficulty: DifficultyLevel): Question[]
```

アナグラム（文字並べ替え）問題を生成する。

**難易度別**: 1→簡単な3文字語, 2→4文字語, ..., 5→長い日本語表現

---

## lib/utils.ts

汎用ユーティリティ関数群。

### クラス名結合

#### cn

```typescript
function cn(...inputs: ClassValue[]): string
```

`clsx` + `tailwind-merge` によるクラス名結合。Tailwind CSSのクラス競合を自動解決する。

### 日付ユーティリティ

#### formatDate

```typescript
function formatDate(date: string | Date, format?: "short" | "long" | "time"): string
```

日付を日本語フォーマットで文字列化する。

| format | 出力例 |
|--------|--------|
| `"short"` (default) | `"2月15日"` |
| `"long"` | `"2026年2月15日"` |
| `"time"` | `"14:30"` |

#### isToday

```typescript
function isToday(date: string | Date): boolean
```

指定日が今日かどうかを判定する。

#### daysAgo

```typescript
function daysAgo(days: number): Date
```

指定日数前の日付を返す。

#### getDateKey

```typescript
function getDateKey(date?: Date): string
```

日付をYYYY-MM-DD形式の文字列に変換する。引数省略時は今日。

### 統計ユーティリティ

#### mean

```typescript
function mean(values: number[]): number
```

数値配列の平均値を計算する。空配列の場合は0を返す。

#### standardDeviation

```typescript
function standardDeviation(values: number[]): number
```

数値配列の標準偏差を計算する。要素が2未満の場合は0を返す。

#### movingAverage

```typescript
function movingAverage(values: number[], window: number): number[]
```

移動平均を計算する。配列がウィンドウサイズ未満の場合は全体の平均を返す。

#### trendDirection

```typescript
function trendDirection(values: number[], window?: number): "up" | "down" | "stable"
```

移動平均の変化率からトレンド方向を判定する。

| 変化率 | 判定 |
|--------|------|
| > 3% | `"up"` |
| < -3% | `"down"` |
| -3% ~ 3% | `"stable"` |

### スコア正規化

#### normalizeScore

```typescript
function normalizeScore(raw: number, min: number, max: number): number
```

生スコアを0-100の正規化スコアに変換する。min == max の場合は50を返す。

### ランダム

#### randomInt

```typescript
function randomInt(min: number, max: number): number
```

min以上max以下のランダムな整数を返す。

#### shuffleArray

```typescript
function shuffleArray<T>(arr: T[]): T[]
```

配列をFisher-Yatesアルゴリズムでシャッフルした新しい配列を返す。元の配列は変更しない。

### ID生成

#### generateId

```typescript
function generateId(prefix?: string): string
```

ユニークなIDを生成する。タイムスタンプ(base36) + ランダム文字列(base36)の組み合わせ。

| 引数 | 出力例 |
|------|--------|
| `""` | `"m2abc1-x8y9z0"` |
| `"ch"` | `"ch-m2abc1-x8y9z0"` |

---

## Stores

### useUserStore

**ファイル**: `stores/user.ts`

**永続化キー**: `brain-user-store`

#### State

| プロパティ | 型 | 初期値 | 説明 |
|-----------|-----|--------|------|
| `user` | `User \| null` | `null` | ユーザー情報 |
| `settings` | `UserSettings` | (デフォルト設定) | アプリ設定 |
| `isOnboarded` | `boolean` | `false` | オンボーディング完了フラグ |

**デフォルト設定**: uiMode=`"standard"`, fontSize=`"normal"`, soundEnabled=`true`, vibrationEnabled=`true`, notificationEnabled=`true`, dailyReminderTime=`"09:00"`, theme=`"system"`, language=`"ja"`, reducedMotion=`false`

#### Actions

| メソッド | 引数 | 説明 |
|---------|------|------|
| `setUser(user)` | `User` | ユーザー情報を設定 |
| `updateSettings(settings)` | `Partial<UserSettings>` | 設定を部分更新 |
| `setUIMode(mode)` | `UIMode` | UIモードを変更 |
| `setOnboarded()` | - | オンボーディング完了 |
| `logout()` | - | ログアウト（user=null, isOnboarded=false） |

---

### useGameStore

**ファイル**: `stores/game.ts`

**永続化キー**: `brain-game-store`

#### State

| プロパティ | 型 | 初期値 | 説明 |
|-----------|-----|--------|------|
| `currentChallenge` | `Challenge \| null` | `null` | 実行中チャレンジ |
| `currentQuestionIndex` | `number` | `0` | 現在の問題インデックス |
| `answers` | `Answer[]` | `[]` | 回答履歴 |
| `gamePhase` | `GamePhase` | `"idle"` | ゲームフェーズ |
| `timeRemaining` | `number` | `0` | 残り時間(秒) |
| `isTimerRunning` | `boolean` | `false` | タイマー実行中 |

**GamePhase**: `"idle"` | `"ready"` | `"memorize"` | `"playing"` | `"paused"` | `"result"`

#### Actions

| メソッド | 引数 | 説明 |
|---------|------|------|
| `startGame(challenge)` | `Challenge` | ゲーム開始。phaseをreadyに設定 |
| `setGamePhase(phase)` | `GamePhase` | フェーズ変更。playing/memorizeでタイマー開始 |
| `answerQuestion(answer)` | `Answer` | 回答を記録 |
| `nextQuestion()` | - | 次の問題へ。最後の問題ならresultへ |
| `pauseGame()` | - | 一時停止 |
| `resumeGame()` | - | 再開 |
| `finishGame()` | - | ゲーム終了。resultへ |
| `resetGame()` | - | 全状態リセット |
| `setTimeRemaining(time)` | `number` | 残り時間設定 |
| `tick()` | - | 1秒経過。0以下でresultへ |

#### Computed

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getCurrentQuestion()` | `Question \| null` | 現在の問題 |
| `getProgress()` | `{ current, total, percent }` | 進捗情報 |
| `isLastQuestion()` | `boolean` | 最後の問題かどうか |

---

### useScoreStore

**ファイル**: `stores/score.ts`

**永続化キー**: `brain-score-store`

#### State

| プロパティ | 型 | 初期値 | 説明 |
|-----------|-----|--------|------|
| `scores` | `Score[]` | `[]` | 全スコア履歴 |
| `dailyScores` | `DailyScore[]` | `[]` | 日別集計 |
| `categoryScores` | `CategoryScore[]` | `[]` | カテゴリ別最新スコア |
| `streakCount` | `number` | `0` | 連続日数 |
| `bestStreak` | `number` | `0` | 最高連続日数 |

#### Actions

| メソッド | 引数 | 説明 |
|---------|------|------|
| `addScore(score)` | `Score` | スコア追加。dailyScoresとcategoryScoresも自動更新 |
| `setScores(scores)` | `Score[]` | スコア一括設定 |
| `setDailyScores(dailyScores)` | `DailyScore[]` | 日別スコア一括設定 |
| `setCategoryScores(categoryScores)` | `CategoryScore[]` | カテゴリスコア一括設定 |
| `updateStreak(count)` | `number` | 連続日数更新（bestStreakも自動更新） |

#### Computed

| メソッド | 引数 | 戻り値 | 説明 |
|---------|------|--------|------|
| `getDailyScores(days)` | `number` | `DailyScore[]` | 直近N日のスコア |
| `getCategoryTrend(category)` | `ChallengeCategory` | `CategoryScore \| null` | カテゴリのトレンド |
| `getWeeklyAverage()` | - | `number` | 直近7日の平均スコア |
| `getLatestScore()` | - | `Score \| null` | 最新スコア |
| `getScoresByCategory(category)` | `ChallengeCategory` | `Score[]` | カテゴリ別スコア一覧 |
| `getTotalScoreForDate(date)` | `string` (YYYY-MM-DD) | `number` | 指定日のスコア |

---

### useFamilyStore

**ファイル**: `stores/family.ts`

**永続化キー**: `brain-family-store`

#### State

| プロパティ | 型 | 初期値 | 説明 |
|-----------|-----|--------|------|
| `family` | `Family \| null` | `null` | ファミリー情報 |
| `members` | `FamilyMember[]` | `[]` | メンバー一覧 |
| `messages` | `Message[]` | `[]` | メッセージ履歴 |
| `unreadCount` | `number` | `0` | 未読数 |

#### Actions

| メソッド | 引数 | 説明 |
|---------|------|------|
| `setFamily(family)` | `Family` | ファミリー設定（membersも同時設定） |
| `clearFamily()` | - | ファミリー離脱 |
| `setMembers(members)` | `FamilyMember[]` | メンバー一括設定 |
| `updateMember(userId, updates)` | `string`, `Partial<FamilyMember>` | メンバー情報更新 |
| `addMessage(message)` | `Message` | メッセージ追加 |
| `setMessages(messages)` | `Message[]` | メッセージ一括設定 |
| `markRead(messageId, userId)` | `string`, `string` | メッセージ既読 |
| `markAllRead(userId)` | `string` | 全メッセージ既読 |

#### Computed

| メソッド | 引数 | 戻り値 | 説明 |
|---------|------|--------|------|
| `getUnreadCount(userId)` | `string` | `number` | 未読メッセージ数 |
| `getMember(userId)` | `string` | `FamilyMember \| null` | メンバー取得 |
| `getRecentMessages(limit)` | `number` | `Message[]` | 最近のメッセージ |

---

### useCharacterStore

**ファイル**: `stores/character.ts`

**永続化キー**: `brain-character-store`

#### State

| プロパティ | 型 | 初期値 | 説明 |
|-----------|-----|--------|------|
| `characterState` | `CharacterState` | (デフォルト) | キャラクター状態 |
| `availableItems` | `CharacterItem[]` | `[]` | 購入可能アイテム |

**デフォルト**: variant=`"hakase"`, emotion=`"happy"`, level=`1`, coins=`0`, equippedItems=`[]`, ownedItems=`[]`

#### Actions

| メソッド | 引数 | 戻り値 | 説明 |
|---------|------|--------|------|
| `addCoins(amount)` | `number` | - | コイン追加 |
| `spendCoins(amount)` | `number` | `boolean` | コイン消費。残高不足でfalse |
| `equipItem(itemId)` | `string` | - | アイテム装着 |
| `unequipItem(itemId)` | `string` | - | アイテム外す |
| `buyItem(itemId)` | `string` | `boolean` | アイテム購入。失敗時false |
| `setVariant(variant)` | `CharacterVariant` | - | バリアント変更 |
| `setEmotion(emotion)` | `CharacterEmotion` | - | 感情変更 |
| `setLevel(level)` | `number` | - | レベル設定（1-5にクランプ） |
| `setAvailableItems(items)` | `CharacterItem[]` | - | アイテム一覧設定 |

#### Computed

| メソッド | 引数 | 戻り値 | 説明 |
|---------|------|--------|------|
| `getEmotion(context)` | `{ score?, isNewRecord?, isPlaying?, hour?, badgeEarned? }` | `CharacterEmotion` | コンテキストから感情を決定 |
| `canAfford(cost)` | `number` | `boolean` | 購入可能かどうか |
| `getOwnedItems()` | - | `CharacterItem[]` | 所有アイテム一覧 |
| `getEquippedItems()` | - | `CharacterItem[]` | 装備中アイテム一覧 |

---

## 型定義 (types/index.ts)

### 主要型

| 型名 | 種別 | 説明 |
|------|------|------|
| `AgeGroup` | type | `"senior" \| "adult" \| "teen" \| "child"` |
| `UIMode` | type | `"senior" \| "standard" \| "kids"` |
| `ChallengeCategory` | type | `"memory" \| "attention" \| "language" \| "math" \| "spatial"` |
| `ChallengeType` | type | 13種類の問題タイプ |
| `DifficultyLevel` | type | `1 \| 2 \| 3 \| 4 \| 5` |
| `GamePhase` | type | `"idle" \| "ready" \| "memorize" \| "playing" \| "paused" \| "result"` |
| `CharacterVariant` | type | `"hakase" \| "sensei" \| "kun"` |
| `CharacterEmotion` | type | `"happy" \| "excited" \| "thinking" \| "encouraging" \| "celebrating" \| "sleeping"` |

### 定数

| 定数名 | 説明 |
|--------|------|
| `CATEGORY_INFO` | カテゴリ別の日本語名、アイコン名、カラーコード |
| `DIFFICULTY_NAMES` | 難易度別の日本語名（やさしい, ふつう, ...） |

---

*のうかつ v0.1.0 - 内部API/モジュールドキュメント*
