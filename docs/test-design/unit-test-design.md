# ユニットテスト設計書: 脳活ファミリー

> **ドキュメントバージョン**: 1.0.0
> **作成日**: 2026-02-15
> **Phase**: 2 - 設計（テスト設計）
> **ステータス**: Draft
> **ソース**: docs/design/spec.md
> **テストフレームワーク**: Vitest
> **カバレッジ目標**: 80%以上（行カバレッジ・分岐カバレッジ共に）

---

## 目次

1. [テスト対象一覧](#1-テスト対象一覧)
2. [認知機能テストエンジン](#2-認知機能テストエンジン)
3. [スコアリングシステム](#3-スコアリングシステム)
4. [Zustand Store](#4-zustand-store)
5. [ユーティリティ関数](#5-ユーティリティ関数)
6. [データ変換](#6-データ変換)
7. [モック戦略](#7-モック戦略)
8. [カバレッジ計画](#8-カバレッジ計画)

---

## 1. テスト対象一覧

| モジュール | パス | テストケース数 | 優先度 |
|-----------|------|--------------|--------|
| 認知機能テストエンジン（スコア計算） | `src/lib/scoring/` | 65 | P0 |
| 難易度調整エンジン | `src/lib/difficulty/` | 15 | P0 |
| 制限時間管理 | `src/components/game/GameTimer.tsx` | 12 | P0 |
| スコアリングシステム（正規化・トレンド・早期警告） | `src/lib/scoring/` | 40 | P0 |
| Zustand Stores | `src/stores/` | 72 | P0 |
| ユーティリティ関数 | `src/lib/utils/` | 30 | P1 |
| データ変換（グラフ・レポート） | `src/lib/` | 20 | P1 |
| **合計** | | **254** | |

---

## 2. 認知機能テストエンジン

### 2.1 絵合わせ（神経衰弱）スコア計算

**テスト対象**: `calculateCardMatchingScore()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| CM-01 | 全ペア発見・最小試行回数で完了 | ペア数=8, 発見=8, 試行=8, 制限時間=120, 所要時間=60 | score=100 | 正常系: 完璧なスコア |
| CM-02 | 全ペア発見・試行回数中程度 | ペア数=8, 発見=8, 試行=20, 所要時間=100 | score=70-80 | 正常系: 中間的スコア |
| CM-03 | 一部ペアのみ発見 | ペア数=8, 発見=4, 試行=16, 所要時間=120 | score=30-40 | 正常系: 低スコア |
| CM-04 | ペア発見数0 | ペア数=8, 発見=0, 試行=16, 所要時間=120 | score=0 | 境界値: 0ペア |
| CM-05 | 制限時間ギリギリで完了 | ペア数=8, 発見=8, 試行=8, 所要時間=119.9 | score>0, time_bonus>0 | 境界値: 時間ギリギリ |
| CM-06 | 制限時間ちょうどで完了 | ペア数=8, 発見=8, 試行=8, 所要時間=120 | time_bonus=0 | 境界値: 時間ボーナス0 |
| CM-07 | 試行回数が最大値 | ペア数=8, 発見=8, 試行=32 | efficiency=0 | 境界値: 最大試行回数 |
| CM-08 | キッズ難易度パラメータ | ペア数=3, 制限時間=60 | 適切なスコア | 難易度: キッズ |
| CM-09 | チャレンジ難易度パラメータ | ペア数=10, 制限時間=180 | 適切なスコア | 難易度: チャレンジ |
| CM-10 | 所要時間が0秒 | ペア数=8, 発見=8, 試行=8, 所要時間=0 | time_bonus=最大値 | 境界値: 即時完了 |
| CM-11 | 試行回数が最小試行回数未満（異常） | ペア数=8, 発見=8, 試行=5 | エラーまたはefficiency上限 | 異常系: 不正な試行数 |
| CM-12 | 負の所要時間 | 所要時間=-1 | エラーまたは0 | 異常系: 負値入力 |

### 2.2 単語記憶スコア計算

**テスト対象**: `calculateWordMemoryScore()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| WM-01 | 全単語正解・順序も正解 | 正答=7/7, 順序正答=7/7 | score=100 | 正常系: 満点 |
| WM-02 | 全単語正解・順序不正解 | 正答=7/7, 順序正答=3/7 | score=80+α | 正常系: 順序ボーナス一部 |
| WM-03 | 一部正解 | 正答=4/7, 順序正答=2/7 | score=45-55 | 正常系: 中間スコア |
| WM-04 | 正答0 | 正答=0/7, 順序正答=0/7 | score=0 | 境界値: 全不正解 |
| WM-05 | 1単語のみ正解 | 正答=1/7, 順序正答=1/7 | score=14-18 | 境界値: 最低正答 |
| WM-06 | 全正解・順序ボーナスで100超え | 正答=7/7, 順序正答=7/7 | score=100（上限切り） | 境界値: min(100, score)動作確認 |
| WM-07 | キッズ（3単語） | 正答=3/3, 順序正答=3/3 | score=100 | 難易度: キッズ |
| WM-08 | チャレンジ（10単語） | 正答=8/10, 順序正答=5/10 | 適切なスコア | 難易度: チャレンジ |
| WM-09 | 順序正答数が正答数を超える（異常） | 正答=3/7, 順序正答=5/7 | エラーまたはクランプ | 異常系: 不整合 |
| WM-10 | 総単語数0（異常） | 総単語数=0 | エラーまたは0 | 異常系: ゼロ除算 |

### 2.3 物語記憶スコア計算

**テスト対象**: `calculateStoryMemoryScore()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| SM-01 | 全問正解・高速回答 | 正答=5/5, 各回答時間=3秒, 制限時間=10秒 | score=95-100 | 正常系: 満点近い |
| SM-02 | 全問正解・制限時間ギリギリ | 正答=5/5, 各回答時間=9.5秒 | score=85前後 | 正常系: 速度ペナルティ |
| SM-03 | 一部正解 | 正答=3/5, 回答時間=中程度 | score=50-60 | 正常系: 中間 |
| SM-04 | 全問不正解 | 正答=0/5 | score=0 | 境界値: 0点 |
| SM-05 | 回答時間0秒 | 正答=5/5, 回答時間=0秒 | speed_factor=1.0 | 境界値: 即時回答 |
| SM-06 | 回答時間が制限時間を超過 | 回答時間=制限時間+1秒 | speed_factor=0 | 境界値: タイムオーバー |
| SM-07 | 質問数0（異常） | 質問数=0 | エラーまたは0 | 異常系: ゼロ除算 |
| SM-08 | シニア難易度（3文+音声） | 正答=3/3 | 適切なスコア | 難易度: シニア |
| SM-09 | チャレンジ難易度（7文） | 正答=5/7 | 適切なスコア | 難易度: チャレンジ |
| SM-10 | 負の回答時間（異常） | 回答時間=-1 | エラーまたは0クランプ | 異常系: 負値入力 |

### 2.4 ストループテストスコア計算

**テスト対象**: `calculateStroopScore()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| ST-01 | 全問正解・高速 | 正答=20/20, 平均反応=500ms | score=90-100 | 正常系: 高スコア |
| ST-02 | 全問正解・低速 | 正答=20/20, 平均反応=2500ms | score=65-75 | 正常系: 速度ペナルティ |
| ST-03 | 半分正解 | 正答=10/20, 平均反応=1000ms | score=45-55 | 正常系: 中間 |
| ST-04 | 全問不正解 | 正答=0/20 | score=0 | 境界値: 0点 |
| ST-05 | 反応時間0ms | 正答=20/20, 平均反応=0ms | speed_score=100 | 境界値: 瞬間反応 |
| ST-06 | 反応時間3000ms（上限） | 正答=20/20, 平均反応=3000ms | speed_score=0 | 境界値: 上限時間 |
| ST-07 | 反応時間3000ms超 | 正答=15/20, 平均反応=4000ms | speed_score=0 | 境界値: 超過 |

### 2.5 反応速度テストスコア計算

**テスト対象**: `calculateReactionTimeScore()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| RT-01 | 全ヒット・誤タップなし・高速 | hit=25/25, 誤タップ=0/15, 反応=200ms | score=85-100 | 正常系: 高スコア |
| RT-02 | 全ヒット・誤タップあり | hit=25/25, 誤タップ=5/15, 反応=400ms | score=50-65 | 正常系: 誤タップペナルティ |
| RT-03 | ヒット率低い | hit=10/25, 誤タップ=3/15 | score=20-30 | 正常系: 低スコア |
| RT-04 | ヒット0・誤タップ最大 | hit=0/25, 誤タップ=15/15 | score=0 | 境界値: 最低スコア |
| RT-05 | 誤タップ率がヒット率を超える場合 | hit=5/25, 誤タップ=15/15 | accuracy_score負→max(0,...) | 境界値: 負のaccuracy |
| RT-06 | 反応時間が許容時間と同一 | 反応=800ms, 許容=800ms | speed_score=0 | 境界値: ちょうど許容時間 |
| RT-07 | おとり0（キッズ設定あり得ない場合） | おとり=0 | ゼロ除算対策確認 | 異常系: ゼロ除算 |

### 2.6 しりとりスコア計算

**テスト対象**: `calculateShiritoriScore()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| SH-01 | 最後まで生存 | 生存=10/10, 平均回答=8秒, unique=8 | score=90-100 | 正常系: 高スコア |
| SH-02 | 中盤で脱落 | 生存=5/10, 平均回答=12秒 | score=40-55 | 正常系: 中間 |
| SH-03 | 即脱落 | 生存=0/10 | score=0 | 境界値: 0ターン |
| SH-04 | variety_bonus上限 | unique=10 | variety_bonus=min(10, 20)=10 | 境界値: ボーナス上限 |
| SH-05 | speed_bonus計算 | 平均回答=0秒, 制限時間=15秒 | speed_bonus=15 | 境界値: 最大速度ボーナス |

### 2.7 アナグラムスコア計算

**テスト対象**: `calculateAnagramScore()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| AG-01 | 全問正解・高速 | 正答=10/10, 平均=5秒, 制限=20秒 | score=88-92 | 正常系: 高スコア |
| AG-02 | 全問正解・低速 | 正答=10/10, 平均=19秒, 制限=20秒 | score=71-73 | 正常系: 速度ペナルティ |
| AG-03 | 半分正解 | 正答=5/10, 平均=10秒 | score=35-45 | 正常系: 中間 |
| AG-04 | 全問不正解 | 正答=0/10 | score=0 | 境界値: 0点 |
| AG-05 | 問題数0（異常） | 問題数=0 | エラーまたは0 | 異常系: ゼロ除算 |

### 2.8 暗算チャレンジスコア計算

**テスト対象**: `calculateMentalArithmeticScore()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| MA-01 | 全問正解・高速・スタンダード | 正答=15/15, 平均=3秒, difficulty_weight=1.0 | score=90-100 | 正常系: 高スコア |
| MA-02 | 全問正解・チャレンジ（weight=1.2） | 正答=15/15, 平均=4秒, weight=1.2 | score=100（上限）| 境界値: weight>1.0のmin(100) |
| MA-03 | キッズ（weight=0.8） | 正答=10/10, 平均=5秒, weight=0.8 | score<100 | 難易度: weight補正 |
| MA-04 | 全問不正解 | 正答=0/15 | score=0 | 境界値: 0点 |
| MA-05 | difficulty_weight配列外（異常） | 難易度=6 | エラーまたはデフォルト | 異常系: 範囲外 |

### 2.9 難易度調整アルゴリズム

**テスト対象**: `adjustDifficulty()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| DA-01 | 3回連続80%以上 → 昇格 | currentLevel=3, results=[82,85,90] | Level 4 | 正常系: 昇格 |
| DA-02 | 2回連続40%以下 → 降格 | currentLevel=3, results=[35,38] | Level 2 | 正常系: 降格 |
| DA-03 | 変動あり → 維持 | currentLevel=3, results=[75,60,85] | Level 3 | 正常系: 維持 |
| DA-04 | レベル5で昇格条件 → 上限 | currentLevel=5, results=[90,95,88] | Level 5 | 境界値: 上限維持 |
| DA-05 | レベル1で降格条件 → 下限 | currentLevel=1, results=[30,25] | Level 1 | 境界値: 下限維持 |
| DA-06 | 結果が1つのみ → 維持 | currentLevel=3, results=[90] | Level 3 | 境界値: データ不足 |
| DA-07 | 結果が0件 → 維持 | currentLevel=3, results=[] | Level 3 | 境界値: 空配列 |
| DA-08 | ちょうど80%が3回連続 | results=[80,80,80] | Level UP | 境界値: 閾値ちょうど |
| DA-09 | 79%が3回連続 → 昇格しない | results=[79,79,79] | 維持 | 境界値: 閾値未満 |
| DA-10 | ちょうど40%が2回連続 | results=[40,40] | Level DOWN | 境界値: 閾値ちょうど |
| DA-11 | 41%が2回連続 → 降格しない | results=[41,41] | 維持 | 境界値: 閾値超 |
| DA-12 | 5回のうち直近3回だけ80%以上 | results=[50,60,85,90,82] | Level UP | 正常系: sliceで直近3回参照 |
| DA-13 | 昇格と降格が同時に条件を満たす場合 | results=[30,25,80,85,90] | Level UP | 優先度: 昇格優先 |
| DA-14 | 結果が2つで降格条件一致 | results=[30,35] | Level DOWN | 境界値: 最小データで降格 |
| DA-15 | 結果が2つで昇格条件不一致 | results=[90,95] | 維持 | 境界値: 3件未満で昇格しない |

### 2.10 制限時間管理

**テスト対象**: `GameTimer` コンポーネント / `useGameTimer` フック

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| GT-01 | タイマー開始 | initialTime=120 | isRunning=true, remaining=120 | 正常系: 開始 |
| GT-02 | タイマーカウントダウン | 3秒経過 | remaining=117 | 正常系: 減少 |
| GT-03 | タイマー0到達 | remaining=0 | onTimeUp()呼び出し | 正常系: 時間切れコールバック |
| GT-04 | タイマー一時停止 | pauseGame() | isRunning=false, remaining固定 | 正常系: 一時停止 |
| GT-05 | タイマー再開 | resumeGame() | isRunning=true, カウント再開 | 正常系: 再開 |
| GT-06 | タイマーリセット | resetTimer() | remaining=初期値 | 正常系: リセット |
| GT-07 | 初期値0秒 | initialTime=0 | 即座にonTimeUp() | 境界値: 0秒設定 |
| GT-08 | 負の初期値（異常） | initialTime=-1 | エラーまたは0扱い | 異常系: 負値 |
| GT-09 | 小数点の時間 | initialTime=30.5 | 適切に処理 | 境界値: 小数 |
| GT-10 | 一時停止中のリセット | paused状態でreset | remaining=初期値, isRunning=false | 状態遷移: 停止+リセット |
| GT-11 | 複数回の一時停止/再開 | pause→resume→pause→resume | 累積時間が正確 | 正常系: 繰り返し |
| GT-12 | 時間切れ後の操作 | remaining=0の後にpause | 無操作 | 境界値: 終了後操作 |

---

## 3. スコアリングシステム

### 3.1 スコア正規化

**テスト対象**: `normalizeScore(rawScore, min, max)`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| NS-01 | 中間値 | rawScore=50, min=0, max=100 | 50 | 正常系: そのまま |
| NS-02 | 最大値 | rawScore=100, min=0, max=100 | 100 | 境界値: 上限 |
| NS-03 | 最小値 | rawScore=0, min=0, max=100 | 0 | 境界値: 下限 |
| NS-04 | 範囲超過 | rawScore=150, min=0, max=100 | 100 | 境界値: 上限クランプ |
| NS-05 | 範囲未満 | rawScore=-10, min=0, max=100 | 0 | 境界値: 下限クランプ |
| NS-06 | min=max（異常） | rawScore=50, min=50, max=50 | エラーまたは0 | 異常系: ゼロ除算 |
| NS-07 | min>max（異常） | min=100, max=0 | エラーまたは異常処理 | 異常系: 逆転範囲 |
| NS-08 | 小数点結果の丸め | rawScore=33.3, min=0, max=100 | 33 | 正常系: Math.round |
| NS-09 | 非数値入力 | rawScore=NaN | エラーまたは0 | 異常系: NaN |
| NS-10 | 非常に大きな値 | rawScore=999999 | 100 | 境界値: 巨大値 |

### 3.2 カテゴリ別スコア算出

**テスト対象**: `calculateCategoryScore(category, testScores)`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| CS-01 | 記憶力: 全テスト実施 | memory: {card=80, word=90, story=70} | Math.round(80*0.35+90*0.35+70*0.30) = 80 | 正常系: 加重平均 |
| CS-02 | 記憶力: 一部テストのみ | memory: {card=80, word=90} | weight補正で正しい平均 | 正常系: 部分データ |
| CS-03 | テストスコアなし | memory: {} | 0 | 境界値: データなし |
| CS-04 | 注意力: 全テスト実施 | attention: {spot=70, stroop=80, reaction=90} | 加重平均 | 正常系: attention |
| CS-05 | 計算力: 2テスト | calculation: {arithmetic=85, sequence=75} | 85*0.6+75*0.4=81 | 正常系: 重み付け |
| CS-06 | 空間認識: 均等重み | spatial: {jigsaw=60, rotation=80} | 60*0.5+80*0.5=70 | 正常系: 50:50 |
| CS-07 | 全スコア100 | すべて100 | 100 | 境界値: 満点 |
| CS-08 | 全スコア0 | すべて0 | 0 | 境界値: 0点 |
| CS-09 | 存在しないカテゴリ | category='unknown' | エラーまたは0 | 異常系: 不正カテゴリ |
| CS-10 | undefinedスコア混在 | memory: {card=80, word=undefined} | card分のみで計算 | 異常系: undefined値 |

### 3.3 総合スコア算出

**テスト対象**: `calculateTotalScore(categoryScores)`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| TS-01 | 全カテゴリ実施 | memory=80, attention=70, language=90, calculation=60, spatial=75 | 加重平均 | 正常系 |
| TS-02 | 一部カテゴリのみ | memory=80, attention=70 | 2カテゴリのweight補正平均 | 正常系: 部分データ |
| TS-03 | 全カテゴリ0 | すべて0 | 0 | 境界値: 全0 |
| TS-04 | 全カテゴリ100 | すべて100 | 100 | 境界値: 全100 |
| TS-05 | カテゴリスコアなし | {} | 0 | 境界値: 空 |
| TS-06 | 記憶力の重み(0.25)が正しいか | memory=100, 他=0 | 100 * 0.25 / 0.25 = 100 | 重み検証 |
| TS-07 | 全カテゴリ同一スコア | すべて50 | 50 | 正常系: 均一 |
| TS-08 | Math.round動作確認 | 端数が出るスコア組み合わせ | 整数 | 正常系: 丸め |
| TS-09 | 負のスコア値（異常） | memory=-10 | スキップまたは0扱い | 異常系: 負値 |
| TS-10 | スコア>0 チェック | memory=0, attention=80 | attentionのみで計算 | 境界値: score=0はスキップ |

### 3.4 トレンド計算

**テスト対象**: `calculateTrend(scores)`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| TR-01 | 上昇トレンド | 2w平均=80, 4w平均=70 | direction='improving', change>5 | 正常系: 改善 |
| TR-02 | 下降トレンド | 2w平均=60, 4w平均=75 | direction='declining', change<-5 | 正常系: 低下 |
| TR-03 | 安定トレンド | 2w平均=75, 4w平均=74 | direction='stable' | 正常系: 安定 |
| TR-04 | ちょうど+5%変化 | 2w平均=105, 4w平均=100 | direction='stable'(5%は含まない) | 境界値: 閾値ちょうど |
| TR-05 | ちょうど-5%変化 | 2w平均=95, 4w平均=100 | direction='stable' | 境界値: 閾値ちょうど |
| TR-06 | +5.1%変化 | 計算結果が5.1% | direction='improving' | 境界値: 閾値超 |
| TR-07 | データ0件 | scores=[] | direction='stable', avg=0 | 境界値: 空データ |
| TR-08 | 2週間のデータのみ | 直近2週間のみ | 4w平均=0, direction判定 | 境界値: 片方のみ |
| TR-09 | 標準偏差の正確性 | scores=[60,70,80,90,100] | stdDev=正確な値 | 正常系: 統計計算 |
| TR-10 | 全スコア同一 | scores=[80,80,80,80] | stdDev=0, stable | 境界値: 分散0 |
| TR-11 | changePercent丸め | 変化率=3.456...% | 3.5 | 正常系: 小数点1桁丸め |
| TR-12 | 4w平均が0の場合 | avg4w=0 | changePercent=0 | 異常系: ゼロ除算 |

### 3.5 早期警告判定

**テスト対象**: `evaluateAlert(scores, thresholds)`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| AL-01 | 注意（caution）: 10%低下 | 2w平均が前月比10%低下 | level='caution' | 正常系: 注意レベル |
| AL-02 | 警戒（warning）: 15%低下+2カテゴリ | 2カテゴリで15%低下 | level='warning' | 正常系: 警戒レベル |
| AL-03 | 要確認（attention）: 20%低下+3カテゴリ | 3カテゴリで20%低下 | level='attention' | 正常系: 要確認レベル |
| AL-04 | 正常: 変化なし | すべてのスコア安定 | level=null(正常) | 正常系: アラートなし |
| AL-05 | 非アクティブ5日 → caution | 5日間テスト未実施 | inactiveDays警告 | 正常系: 非アクティブ |
| AL-06 | 非アクティブ7日 → warning | 7日間テスト未実施 | level='warning' | 正常系: 長期非アクティブ |
| AL-07 | 非アクティブ10日 → attention | 10日間テスト未実施 | level='attention' | 正常系: 超長期非アクティブ |
| AL-08 | 猶予期間内（3日以内の変化） | 変化があるが3日以内 | アラートなし | 境界値: gracePeriod |

---

## 4. Zustand Store

### 4.1 userStore

**テスト対象**: `useUserStore`

| # | テストケース | アクション | 期待される状態変化 | テスト意図 |
|---|------------|---------|-----------------|-----------|
| US-01 | ユーザー設定 | setUser({name:'花子', ageGroup:'senior'}) | user=設定値, isAuthenticated=true | 正常系: ユーザー設定 |
| US-02 | 設定更新 | updateSettings({fontSize:'large'}) | settings.fontSize='large', 他は維持 | 正常系: 部分更新 |
| US-03 | トークン設定 | setTokens('auth123','refresh456') | authToken, refreshToken設定 | 正常系: トークン |
| US-04 | 認証クリア | clearAuth() | user=null, isAuthenticated=false, tokens=null | 正常系: ログアウト |
| US-05 | オンボーディング完了 | completeOnboarding() | isOnboardingCompleted=true | 正常系: オンボーディング |
| US-06 | getAgeGroup: シニア | user.ageGroup='senior' | getAgeGroup()='senior' | Computed: ageGroup |
| US-07 | isSenior: true | user.ageGroup='senior' | isSenior()=true | Computed: シニア判定 |
| US-08 | isSenior: senior_plus | user.ageGroup='senior_plus' | isSenior()=true | Computed: シニアプラス |
| US-09 | isKids: true | user.ageGroup='kids' | isKids()=true | Computed: キッズ判定 |
| US-10 | isKids: junior | user.ageGroup='junior' | isKids()=true | Computed: ジュニア判定 |
| US-11 | getFontSize | settings.fontSize='xlarge' | getFontSize()=32 | Computed: フォントサイズ |
| US-12 | ユーザー未設定時のgetAgeGroup | user=null | getAgeGroup()=null | 境界値: null |
| US-13 | localStorageへの永続化 | setUser後にストア再生成 | user情報が復元される | 永続化: persist |
| US-14 | partialize: authTokenは永続化しない | setTokens後に永続化 | authTokenは保存されない | 永続化: 選択的 |

### 4.2 familyStore

**テスト対象**: `useFamilyStore`

| # | テストケース | アクション | 期待される状態変化 | テスト意図 |
|---|------------|---------|-----------------|-----------|
| FS-01 | ファミリー設定 | setFamilies([{id:'f1', name:'田中家'}]) | families=[...] | 正常系: 設定 |
| FS-02 | アクティブファミリー切替 | setActiveFamily('f1') | activeFamilyId='f1' | 正常系: 切替 |
| FS-03 | メンバーステータス更新 | updateMemberStatus('u1', status) | memberStatuses['u1']=status | 正常系: ステータス |
| FS-04 | ランキング設定 | setRankings(rankData) | rankings=rankData | 正常系: ランキング |
| FS-05 | チームバトルデータ設定 | setTeamBattle(battleData) | teamBattle=battleData | 正常系: 世代対抗 |
| FS-06 | getActiveFamily | activeFamilyId='f1' | 該当ファミリーオブジェクト | Computed: アクティブ取得 |
| FS-07 | getActiveFamily: 存在しないID | activeFamilyId='invalid' | null | 境界値: 不正ID |
| FS-08 | getActiveFamilyMembers | アクティブファミリー設定済み | メンバー配列 | Computed: メンバー取得 |
| FS-09 | ファミリー未設定時 | families=[] | getActiveFamily()=null | 境界値: 空 |
| FS-10 | refreshDashboard | API呼び出し | 最新データで更新 | 非同期: ダッシュボード更新 |
| FS-11 | lastPolledAt更新 | refreshDashboard後 | lastPolledAtが更新 | 正常系: ポーリング時刻 |
| FS-12 | 複数ファミリー管理 | setFamilies([f1, f2, f3]) | 3ファミリー保持 | 正常系: 複数グループ |

### 4.3 gameStore

**テスト対象**: `useGameStore`

| # | テストケース | アクション | 期待される状態変化 | テスト意図 |
|---|------------|---------|-----------------|-----------|
| GS-01 | チャレンジ開始 | startChallenge(challenge) | currentChallenge=challenge, gamePhase='playing' | 正常系: 開始 |
| GS-02 | 回答送信 | submitAnswer(answer) | answers=[answer] | 正常系: 回答追加 |
| GS-03 | 次の問題 | nextQuestion() | currentQuestionIndex++ | 正常系: 次へ |
| GS-04 | ゲーム一時停止 | pauseGame() | gamePhase='paused', isTimerRunning=false | 正常系: 一時停止 |
| GS-05 | ゲーム再開 | resumeGame() | gamePhase='playing', isTimerRunning=true | 正常系: 再開 |
| GS-06 | ゲーム完了 | completeGame() | gamePhase='completed' | 正常系: 完了 |
| GS-07 | ゲームリセット | resetGame() | 初期状態に復帰 | 正常系: リセット |
| GS-08 | 残り時間設定 | setTimeRemaining(60) | timeRemaining=60 | 正常系: 時間設定 |
| GS-09 | 難易度更新 | updateDifficulty('memory', 3) | difficultyProfile.memory=3 | 正常系: 難易度変更 |
| GS-10 | getCurrentQuestion | index=2, 問題数5 | 3番目の問題 | Computed: 現在の問題 |
| GS-11 | getProgress | index=3, total=5 | {current:4, total:5, percent:80} | Computed: 進捗 |
| GS-12 | isLastQuestion | index=4, total=5 | true | Computed: 最後の問題 |
| GS-13 | idle状態でsubmitAnswer | gamePhase='idle' | エラーまたは無視 | 異常系: 未開始で回答 |
| GS-14 | completed後のnextQuestion | gamePhase='completed' | 無視 | 異常系: 完了後操作 |

### 4.4 scoreStore

**テスト対象**: `useScoreStore`

| # | テストケース | アクション | 期待される状態変化 | テスト意図 |
|---|------------|---------|-----------------|-----------|
| SS-01 | スコア追加 | addScore(score) | scoreHistory=[score] | 正常系: 追加 |
| SS-02 | スコア履歴設定 | setScoreHistory(scores) | scoreHistory=scores | 正常系: 一括設定 |
| SS-03 | トレンド更新 | updateTrends() | categoryTrends更新 | 正常系: トレンド計算 |
| SS-04 | カレンダー更新 | updateCalendar('2026-02') | calendar更新 | 正常系: カレンダー |
| SS-05 | getLatestScore | scoreHistory=[s1, s2, s3] | s3(最新) | Computed: 最新スコア |
| SS-06 | getLatestScore: 空 | scoreHistory=[] | null | 境界値: 空 |
| SS-07 | getTotalScore | categoryScoresあり | 加重平均 | Computed: 総合スコア |
| SS-08 | getScoresForChart | period='1w' | 直近1週間のChartDataPoint[] | Computed: グラフデータ |
| SS-09 | getRadarChartData | 5カテゴリスコアあり | RadarDataPoint[5] | Computed: レーダー |
| SS-10 | getStreakInfo | streakCount=7, bestStreak=30 | {current:7, best:30} | Computed: 連続記録 |
| SS-11 | 連続記録の更新 | 毎日テスト完了 | streakCount++ | 正常系: 連続加算 |
| SS-12 | 連続記録の途切れ | 1日未実施 | streakCount=0 | 正常系: リセット |

### 4.5 messageStore

**テスト対象**: `useMessageStore`

| # | テストケース | アクション | 期待される状態変化 | テスト意図 |
|---|------------|---------|-----------------|-----------|
| MS-01 | メッセージ追加 | addMessage(msg) | messages=[msg] | 正常系: 追加 |
| MS-02 | 既読にする | markAsRead('msg1') | msg1.isRead=true | 正常系: 既読 |
| MS-03 | 全既読 | markAllAsRead('f1') | family f1の全メッセージ既読 | 正常系: 一括既読 |
| MS-04 | 未読数取得 | getUnreadByFamily('f1') | 未読メッセージ数 | Computed: 未読カウント |
| MS-05 | 直近メッセージ取得 | getRecentMessages('f1', 10) | 最新10件 | Computed: 直近取得 |
| MS-06 | スタンプ送信 | sendStamp('f1', 'u2', 'stamp1') | API呼び出し+メッセージ追加 | 非同期: スタンプ |
| MS-07 | ボイス送信 | sendVoice('f1', 'u2', blob) | API呼び出し+メッセージ追加 | 非同期: ボイス |
| MS-08 | 録音状態管理 | setRecording(true) | isRecording=true | 正常系: 録音フラグ |
| MS-09 | 存在しないファミリーの未読 | getUnreadByFamily('invalid') | 0 | 境界値: 不正ID |
| MS-10 | limit超過 | getRecentMessages('f1', 100)で50件のみ | 50件 | 境界値: 上限 |

### 4.6 characterStore

**テスト対象**: `useCharacterStore`

| # | テストケース | アクション | 期待される状態変化 | テスト意図 |
|---|------------|---------|-----------------|-----------|
| CH-01 | ステージ設定 | setStage('young') | stage='young' | 正常系: ステージ変更 |
| CH-02 | コイン追加 | addCoins(50) | coins+=50 | 正常系: コイン加算 |
| CH-03 | コイン消費: 残高十分 | spendCoins(30), coins=50 | coins=20, return true | 正常系: 消費成功 |
| CH-04 | コイン消費: 残高不足 | spendCoins(100), coins=50 | coins=50, return false | 正常系: 消費失敗 |
| CH-05 | アイテム装着 | equipItem('hat', 'hat001') | equippedItems.hat='hat001' | 正常系: 装着 |
| CH-06 | アイテム解除 | equipItem('hat', null) | equippedItems.hat=null | 正常系: 解除 |
| CH-07 | ムード設定 | setMood('happy') | currentMood='happy' | 正常系: ムード変更 |
| CH-08 | 進化チェック: 7日連続 | checkEvolution(7) | stage='young' | 正常系: 子フクロウ |
| CH-09 | 進化チェック: 30日連続 | checkEvolution(30) | stage='adolescent' | 正常系: 若フクロウ |
| CH-10 | 進化チェック: 100日連続 | checkEvolution(100) | stage='wise' | 正常系: 賢者フクロウ |
| CH-11 | canAfford判定 | coins=50 | canAfford(30)=true, canAfford(51)=false | Computed: 購入可能判定 |
| CH-12 | getEquippedSet | 全スロット装着済み | EquippedSetオブジェクト | Computed: 装備セット |

---

## 5. ユーティリティ関数

### 5.1 日付処理ユーティリティ

**テスト対象**: `src/lib/utils/date.ts`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| DU-01 | 今日の日付フォーマット | formatDate(new Date()) | 'YYYY-MM-DD' | 正常系: フォーマット |
| DU-02 | 連続日数計算 | 7日連続のスコアデータ | streakCount=7 | 正常系: 連続計算 |
| DU-03 | 連続途切れ | 5日連続+1日空き+2日 | streakCount=2 | 正常系: 途切れ |
| DU-04 | 日曜23:59(週末判定) | 日曜23:59の日付 | isWeekEnd=true | 境界値: 週末境界 |
| DU-05 | 月跨ぎ | 1/31 → 2/1 | 正しい連続判定 | 境界値: 月跨ぎ |
| DU-06 | 年跨ぎ | 12/31 → 1/1 | 正しい連続判定 | 境界値: 年跨ぎ |
| DU-07 | うるう年 | 2/28 → 2/29 (2028) | 正しい連続判定 | 境界値: うるう年 |
| DU-08 | 無効な日付文字列 | '2026-13-40' | エラーまたはnull | 異常系: 不正日付 |
| DU-09 | 空文字列 | '' | エラーまたはnull | 異常系: 空入力 |
| DU-10 | タイムゾーン考慮 | UTC vs JST | JST基準で正しい日付 | 境界値: タイムゾーン |

### 5.2 統計計算ユーティリティ

**テスト対象**: `src/lib/utils/statistics.ts`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| ST-01 | 平均値計算 | [60, 70, 80, 90, 100] | 80 | 正常系: average |
| ST-02 | 平均値: 1要素 | [50] | 50 | 境界値: 1要素 |
| ST-03 | 平均値: 空配列 | [] | 0またはNaN | 境界値: 空 |
| ST-04 | 標準偏差計算 | [60, 70, 80, 90, 100] | ~14.14 | 正常系: stdDev |
| ST-05 | 標準偏差: 全同値 | [80, 80, 80] | 0 | 境界値: 分散0 |
| ST-06 | 移動平均計算 | 14日分のデータ, window=7 | 7日移動平均 | 正常系: movingAvg |
| ST-07 | 移動平均: データ不足 | 3日分, window=7 | 3日分の平均 | 境界値: 不足 |
| ST-08 | 中央値計算 | [1, 3, 5, 7, 9] | 5 | 正常系: 奇数個 |
| ST-09 | 中央値: 偶数個 | [1, 3, 5, 7] | 4 | 正常系: 偶数個 |
| ST-10 | パーセンタイル計算 | データ配列, p=90 | 90パーセンタイル値 | 正常系: percentile |

### 5.3 バリデーションユーティリティ

**テスト対象**: `src/lib/utils/validation.ts`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| VL-01 | メールアドレス検証: 有効 | 'user@example.com' | true | 正常系: 有効メール |
| VL-02 | メールアドレス検証: 無効 | 'invalid-email' | false | 正常系: 無効メール |
| VL-03 | 表示名検証: 有効（日本語） | '花子おばあちゃん' | true | 正常系: 日本語 |
| VL-04 | 表示名検証: 空文字 | '' | false | 境界値: 空 |
| VL-05 | 表示名検証: 長すぎる | 30文字超の文字列 | false | 境界値: 上限超過 |
| VL-06 | 招待コード検証: 有効 | 'ABC123' | true | 正常系: 6桁英数字 |
| VL-07 | 招待コード検証: 桁数不足 | 'AB12' | false | 境界値: 短すぎ |
| VL-08 | 招待コード検証: 特殊文字 | 'AB@#12' | false | 異常系: 不正文字 |
| VL-09 | 生年月日検証: 未来日 | '2030-01-01' | false | 異常系: 未来 |
| VL-10 | 年齢層判定: 各境界年齢 | 5,12,13,19,20,59,60,74,75歳 | 正しいageGroup | 境界値: 年齢区分 |

---

## 6. データ変換

### 6.1 グラフデータ生成

**テスト対象**: `getScoresForChart()`, `getRadarChartData()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| GD-01 | 折れ線グラフ: 1週間 | 7日分のスコア | ChartDataPoint[7] | 正常系: 1週間 |
| GD-02 | 折れ線グラフ: データなし日 | 7日中3日のみスコアあり | 欠損日は表示しないまたは0 | 境界値: 欠損 |
| GD-03 | 折れ線グラフ: 1年 | 365日分のデータ | 適切にサンプリング | 正常系: 大量データ |
| GD-04 | レーダーチャート: 全カテゴリ | 5カテゴリスコア | RadarDataPoint[5] | 正常系: 5角形 |
| GD-05 | レーダーチャート: 一部カテゴリのみ | 3カテゴリスコア | 未実施カテゴリ=0 | 境界値: 部分データ |
| GD-06 | カレンダーヒートマップ | 1ヶ月分のデータ | calendar['YYYY-MM-DD']='completed'/'missed' | 正常系: ヒートマップ |
| GD-07 | 期間切替: 3ヶ月→1ヶ月 | period変更 | フィルタリング | 正常系: 期間変更 |
| GD-08 | 空のスコア履歴 | scoreHistory=[] | 空の配列 | 境界値: データなし |
| GD-09 | previousScore比較 | 前回と今回のスコア | RadarDataPoint.previousScore設定 | 正常系: 前回比較 |
| GD-10 | 日付ソート | 順不同のスコア | 日付昇順でソート | 正常系: ソート |

### 6.2 レポート生成

**テスト対象**: `generateMonthlyReport()`

| # | テストケース | 入力 | 期待出力 | テスト意図 |
|---|------------|------|---------|-----------|
| RG-01 | 月次レポート: 正常データ | 30日分のスコア | ReportData オブジェクト | 正常系: フルデータ |
| RG-02 | テスト実施日数5日未満 | 3日分のスコア | 「データ収集中」フラグ | 境界値: データ不足 |
| RG-03 | ちょうど5日 | 5日分のスコア | レポート生成成功 | 境界値: 最小データ |
| RG-04 | カテゴリ別サマリー | 各カテゴリのスコア | カテゴリ別の平均/最高/最低/トレンド | 正常系: サマリー |
| RG-05 | 前月比較 | 今月と前月のデータ | 変化率計算 | 正常系: 前月比 |
| RG-06 | 早期警告レポート内容 | アラートレベル=warning | レポートに警告セクション | 正常系: 警告 |
| RG-07 | 総合評価テキスト生成 | スコア=90 | '素晴らしい成績です' | 正常系: テキスト |
| RG-08 | シニア向けポジティブ表現 | スコア=30, ageGroup='senior' | ネガティブ表現なし | 要件: ポジティブのみ |
| RG-09 | 連続記録情報 | streak=30 | 「30日連続達成!」 | 正常系: 連続記録 |
| RG-10 | 月初（前月データなし） | 1月のレポート、前月なし | 前月比較なし | 境界値: 初月 |

---

## 7. モック戦略

### 7.1 外部APIモック

```typescript
// APIクライアントのモック
// vi.mock('src/lib/api/client')

// モック方針:
// - 全APIエンドポイントのレスポンスをモック
// - 成功/失敗/タイムアウトの3パターンを用意
// - msw (Mock Service Worker) は E2E用、ユニットテストでは vi.mock を使用

// 例: スコアAPI
vi.mock('@/lib/api/scores', () => ({
  fetchScores: vi.fn().mockResolvedValue({
    scores: [
      { date: '2026-02-01', totalScore: 75, categories: {...} },
      { date: '2026-02-02', totalScore: 80, categories: {...} },
    ],
  }),
  submitScore: vi.fn().mockResolvedValue({ success: true }),
}));
```

### 7.2 タイマーモック

```typescript
// vi.useFakeTimers() を使用
// タイマー関連テストではすべて偽タイマーを使用

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// 例: GameTimerのテスト
test('タイマーが1秒ごとに減少する', () => {
  const { result } = renderHook(() => useGameTimer(120));
  act(() => result.current.start());
  act(() => vi.advanceTimersByTime(3000)); // 3秒進める
  expect(result.current.remaining).toBe(117);
});
```

### 7.3 ランダム値モック

```typescript
// Math.randomのモック
// テスト問題生成、カード配置などで使用

// 固定シード方式
vi.spyOn(Math, 'random').mockReturnValue(0.5);

// シーケンス方式（複数回呼ばれる場合）
const randomValues = [0.1, 0.5, 0.9, 0.3, 0.7];
let callIndex = 0;
vi.spyOn(Math, 'random').mockImplementation(() => {
  return randomValues[callIndex++ % randomValues.length];
});
```

### 7.4 IndexedDBモック

```typescript
// fake-indexeddbを使用
// npm install --save-dev fake-indexeddb

import 'fake-indexeddb/auto';

// または個別モック
vi.mock('@/lib/db/indexeddb', () => ({
  getDB: vi.fn().mockResolvedValue({
    get: vi.fn(),
    put: vi.fn(),
    getAll: vi.fn(),
    delete: vi.fn(),
  }),
}));
```

### 7.5 localStorageモック

```typescript
// VitestではデフォルトでjsdomのlocalStorageが使用可能
// Zustandのpersistミドルウェアのテストに使用

beforeEach(() => {
  localStorage.clear();
});
```

### 7.6 日付モック

```typescript
// 現在日時の固定
vi.setSystemTime(new Date('2026-02-15T09:00:00+09:00'));

// 例: トレンド計算のテスト
// 「2週間前」「4週間前」の基準日を固定するため必須
```

### 7.7 音声APIモック

```typescript
// MediaRecorder APIのモック（ボイスメッセージ関連テスト）
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null,
  onstop: null,
  state: 'inactive',
};

vi.stubGlobal('MediaRecorder', vi.fn(() => mockMediaRecorder));
vi.stubGlobal('navigator', {
  ...navigator,
  mediaDevices: {
    getUserMedia: vi.fn().mockResolvedValue(new MediaStream()),
  },
});
```

---

## 8. カバレッジ計画

### 8.1 カバレッジ目標

| カテゴリ | 行カバレッジ | 分岐カバレッジ | 関数カバレッジ |
|---------|------------|-------------|-------------|
| スコア計算エンジン | 90%以上 | 90%以上 | 100% |
| 難易度調整 | 95%以上 | 95%以上 | 100% |
| Zustand Store | 85%以上 | 80%以上 | 100% |
| ユーティリティ | 90%以上 | 85%以上 | 100% |
| データ変換 | 80%以上 | 80%以上 | 90%以上 |
| **全体** | **80%以上** | **80%以上** | **95%以上** |

### 8.2 Vitest設定

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 95,
        statements: 80,
      },
      include: [
        'src/lib/**/*.ts',
        'src/stores/**/*.ts',
        'src/hooks/**/*.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types/**',
        'src/**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

### 8.3 テスト実行コマンド

```bash
# 全ユニットテスト実行
npx vitest run

# ウォッチモード
npx vitest

# カバレッジ付き実行
npx vitest run --coverage

# 特定ファイルのテスト
npx vitest run src/lib/scoring/

# テスト名フィルタ
npx vitest run -t "スコア計算"
```

### 8.4 テストファイル配置

```
src/
├── lib/
│   ├── scoring/
│   │   ├── cardMatching.ts
│   │   ├── cardMatching.test.ts         # CM-01〜CM-12
│   │   ├── wordMemory.ts
│   │   ├── wordMemory.test.ts           # WM-01〜WM-10
│   │   ├── storyMemory.ts
│   │   ├── storyMemory.test.ts          # SM-01〜SM-10
│   │   ├── stroop.ts
│   │   ├── stroop.test.ts               # ST-01〜ST-07
│   │   ├── reactionTime.ts
│   │   ├── reactionTime.test.ts         # RT-01〜RT-07
│   │   ├── shiritori.ts
│   │   ├── shiritori.test.ts            # SH-01〜SH-05
│   │   ├── anagram.ts
│   │   ├── anagram.test.ts              # AG-01〜AG-05
│   │   ├── mentalArithmetic.ts
│   │   ├── mentalArithmetic.test.ts     # MA-01〜MA-05
│   │   ├── normalize.ts
│   │   ├── normalize.test.ts            # NS-01〜NS-10
│   │   ├── categoryScore.ts
│   │   ├── categoryScore.test.ts        # CS-01〜CS-10
│   │   ├── totalScore.ts
│   │   ├── totalScore.test.ts           # TS-01〜TS-10
│   │   ├── trend.ts
│   │   ├── trend.test.ts                # TR-01〜TR-12
│   │   └── alert.test.ts                # AL-01〜AL-08
│   ├── difficulty/
│   │   ├── adjustDifficulty.ts
│   │   └── adjustDifficulty.test.ts     # DA-01〜DA-15
│   └── utils/
│       ├── date.ts
│       ├── date.test.ts                 # DU-01〜DU-10
│       ├── statistics.ts
│       ├── statistics.test.ts           # ST-01〜ST-10
│       ├── validation.ts
│       └── validation.test.ts           # VL-01〜VL-10
├── stores/
│   ├── userStore.ts
│   ├── userStore.test.ts                # US-01〜US-14
│   ├── familyStore.ts
│   ├── familyStore.test.ts              # FS-01〜FS-12
│   ├── gameStore.ts
│   ├── gameStore.test.ts                # GS-01〜GS-14
│   ├── scoreStore.ts
│   ├── scoreStore.test.ts               # SS-01〜SS-12
│   ├── messageStore.ts
│   ├── messageStore.test.ts             # MS-01〜MS-10
│   ├── characterStore.ts
│   └── characterStore.test.ts           # CH-01〜CH-12
├── components/
│   └── game/
│       ├── GameTimer.tsx
│       └── GameTimer.test.tsx           # GT-01〜GT-12
└── test/
    ├── setup.ts                         # グローバルセットアップ
    ├── fixtures/                        # テストデータ
    │   ├── scores.ts
    │   ├── users.ts
    │   ├── families.ts
    │   └── challenges.ts
    └── helpers/                         # テストヘルパー
        ├── renderStore.ts               # Zustand テストヘルパー
        └── mockApi.ts                   # API モックヘルパー
```

---

## テストデータフィクスチャ

### ユーザーフィクスチャ

```typescript
// src/test/fixtures/users.ts
export const seniorUser = {
  id: 'u-senior-001',
  displayName: '花子',
  ageGroup: 'senior_plus' as const,
  birthDate: '1951-03-15',
  relationship: 'grandmother',
};

export const parentUser = {
  id: 'u-parent-001',
  displayName: '太郎',
  ageGroup: 'standard' as const,
  birthDate: '1978-07-20',
  relationship: 'father',
};

export const kidsUser = {
  id: 'u-kids-001',
  displayName: 'さくら',
  ageGroup: 'kids' as const,
  birthDate: '2016-04-10',
  relationship: 'granddaughter',
};
```

### スコアフィクスチャ

```typescript
// src/test/fixtures/scores.ts
export const improvingScores = [
  { date: '2026-01-20', score: 60 },
  { date: '2026-01-22', score: 65 },
  { date: '2026-01-25', score: 70 },
  { date: '2026-01-28', score: 72 },
  { date: '2026-02-01', score: 75 },
  { date: '2026-02-03', score: 78 },
  { date: '2026-02-05', score: 80 },
  { date: '2026-02-08', score: 82 },
  { date: '2026-02-10', score: 85 },
  { date: '2026-02-12', score: 88 },
];

export const decliningScores = [
  { date: '2026-01-20', score: 85 },
  { date: '2026-01-22', score: 82 },
  { date: '2026-01-25', score: 78 },
  { date: '2026-01-28', score: 75 },
  { date: '2026-02-01', score: 70 },
  { date: '2026-02-03', score: 65 },
  { date: '2026-02-05', score: 60 },
  { date: '2026-02-08', score: 58 },
  { date: '2026-02-10', score: 55 },
  { date: '2026-02-12', score: 50 },
];

export const stableScores = [
  { date: '2026-01-20', score: 75 },
  { date: '2026-01-22', score: 77 },
  { date: '2026-01-25', score: 74 },
  { date: '2026-01-28', score: 76 },
  { date: '2026-02-01', score: 75 },
  { date: '2026-02-03', score: 76 },
  { date: '2026-02-05', score: 74 },
  { date: '2026-02-08', score: 77 },
  { date: '2026-02-10', score: 75 },
  { date: '2026-02-12', score: 76 },
];
```

---

*Phase 2: 設計 - ユニットテスト設計書*
*CCAGI SDK v3.5.0*
