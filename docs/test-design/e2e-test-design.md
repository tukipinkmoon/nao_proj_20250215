# E2Eテスト設計書: 脳活ファミリー

> **ドキュメントバージョン**: 1.0.0
> **作成日**: 2026-02-15
> **Phase**: 2 - 設計（テスト設計）
> **ステータス**: Draft
> **ソース**: docs/design/spec.md, docs/requirements/requirements.md
> **テストフレームワーク**: Playwright
> **テストシナリオ数**: 20

---

## 目次

1. [テストシナリオ概要](#1-テストシナリオ概要)
2. [テストシナリオ詳細](#2-テストシナリオ詳細)
3. [テストデータ](#3-テストデータ)
4. [検証ポイント](#4-検証ポイント)
5. [テスト環境・設定](#5-テスト環境設定)

---

## 1. テストシナリオ概要

### 1.1 シナリオ一覧

| # | シナリオID | シナリオ名 | 対応US | 優先度 | 推定実行時間 |
|---|-----------|----------|--------|--------|------------|
| 1 | E2E-001 | シニア初回オンボーディング完了フロー | US-007 | P0 | 90秒 |
| 2 | E2E-002 | シニアの毎朝デイリーチャレンジフロー | US-001 | P0 | 120秒 |
| 3 | E2E-003 | 親世代の見守りダッシュボード確認 | US-002 | P0 | 60秒 |
| 4 | E2E-004 | ファミリー招待（QRコード） → 参加 → ダッシュボード確認 | US-007 | P0 | 90秒 |
| 5 | E2E-005 | ファミリー招待（招待コード） → 参加 | US-007 | P1 | 60秒 |
| 6 | E2E-006 | ファミリー招待（招待リンク） → 参加 | US-007 | P1 | 60秒 |
| 7 | E2E-007 | 世代対抗戦の参加と結果確認 | US-003 | P1 | 90秒 |
| 8 | E2E-008 | テスト未実施の見守り通知と応答 | US-004 | P1 | 60秒 |
| 9 | E2E-009 | 月次レポート閲覧とPDFダウンロード | US-005 | P1 | 60秒 |
| 10 | E2E-010 | 連続ログインとバッジ獲得 | US-006 | P1 | 120秒 |
| 11 | E2E-011 | キッズモードでのテスト実施 | US-003 | P1 | 90秒 |
| 12 | E2E-012 | ファミリーランキング確認 | US-009 | P1 | 45秒 |
| 13 | E2E-013 | 早期警告通知と家族のアクション | US-008 | P0 | 90秒 |
| 14 | E2E-014 | オフライン → オンライン復帰の同期テスト | US-010 | P0 | 120秒 |
| 15 | E2E-015 | スタンプ送信・受信フロー | US-001 | P1 | 45秒 |
| 16 | E2E-016 | ボイスメッセージ送信・受信 | US-004 | P2 | 60秒 |
| 17 | E2E-017 | キャラクター育成と着せ替え | US-006 | P2 | 60秒 |
| 18 | E2E-018 | ウィークリーチャレンジ実施（中断・再開含む） | US-009 | P1 | 120秒 |
| 19 | E2E-019 | アクセシビリティ設定変更と反映確認 | US-007 | P0 | 60秒 |
| 20 | E2E-020 | 新規ユーザー登録 → オンボーディング → テスト → 結果共有の完全フロー | US-001, US-007 | P0 | 180秒 |

### 1.2 前提条件

- テスト環境のBase URL: `http://localhost:3000`（ローカル）または AWS SSM 経由（dev環境）
- テスト用データベースは各テスト実行前にシード投入
- テスト間の状態分離: 各テストは独立して実行可能

---

## 2. テストシナリオ詳細

### E2E-001: シニア初回オンボーディング完了フロー

**対応ユーザーストーリー**: US-007（シニアの初回オンボーディング）

**ペルソナ**: 花子さん（75歳、一人暮らし）

**前提条件**:
- 花子さんのアカウントが新規登録済み（ログイン直後、オンボーディング未完了）
- ファミリーグループ「田中家」が太郎さんによって作成済み

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | アプリを開く | スプラッシュ画面が表示される |
| 2 | ログイン画面でメールアドレスとパスワードを入力 | ログインフォームが表示される |
| 3 | 「ログイン」ボタンをタップ | オンボーディング画面（Step 1）に遷移する |
| 4 | Step 1: 「こんにちは!」画面を確認 | - アプリの目的説明が表示される<br>- 文字サイズが18px以上<br>- のうたん（マスコット）が表示される<br>- 音声ガイドが再生可能 |
| 5 | 「次へ」ボタンをタップ | Step 2に遷移する |
| 6 | Step 2: 表示名「花子」を入力 | - キーボード入力が可能<br>- 入力フィールドが大きい |
| 7 | 「次へ」ボタンをタップ | Step 3に遷移する |
| 8 | Step 3: 生年月日をドラムロールで選択（1951年3月15日） | - ドラムロール式ピッカーが表示される<br>- 日付が正しく選択できる<br>- 年齢層「シニアプラス」が自動判定される |
| 9 | 「次へ」ボタンをタップ | Step 4に遷移する |
| 10 | Step 4: 招待コード「ABC123」を入力 | - 6桁入力フィールドが表示される<br>- 「田中家に参加しますか?」確認が表示される |
| 11 | 「参加する」ボタンをタップ | 参加完了メッセージが表示される |
| 12 | Step 5: お試しテスト（3問）を実施 | - 問題が大きな文字で表示される<br>- ヒントが利用可能<br>- タッチターゲットが56px以上 |
| 13 | 3問すべてに回答 | - 「上手にできましたね!」と表示される<br>- のうたんが喜ぶアニメーション |
| 14 | 「はじめる」ボタンをタップ | ホーム画面に遷移する |
| 15 | ホーム画面を確認 | - のうたんが「ヒナ」状態で表示される<br>- デイリーチャレンジボタンが表示される<br>- BottomNavが表示される |

**期待結果**:
- オンボーディングが5ステップ以内で完了する
- 全ステップで文字サイズ18px以上
- isOnboardingCompleted = true に更新される
- ファミリーグループ「田中家」に参加済み

---

### E2E-002: シニアの毎朝デイリーチャレンジフロー

**対応ユーザーストーリー**: US-001（シニアの毎朝のルーティン）

**ペルソナ**: 花子さん（75歳）

**前提条件**:
- 花子さんのアカウントがログイン済み・オンボーディング完了済み
- ファミリーグループ「田中家」に参加済み
- デイリーチャレンジが生成済み（0:00リセット後）

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | ホーム画面を表示 | - のうたんが「おはようございます、花子さん!」と表示<br>- デイリーチャレンジ「今日の脳トレ」ボタン表示 |
| 2 | 「今日の脳トレ」をタップ | デイリーチャレンジ画面（S-006）に遷移 |
| 3 | チャレンジ概要を確認 | - 5問構成の説明<br>- 「はじめる」ボタン<br>- 所要時間目安（約5分） |
| 4 | 「はじめる」をタップ | 1問目が表示される |
| 5 | 記憶力テスト（絵合わせ）に回答 | - カードが大きく表示される（シニアモード）<br>- 制限時間タイマーが表示<br>- ヒントボタンが利用可能 |
| 6 | 注意力テスト（ストループ）に回答 | - 4色の選択ボタンが大きい<br>- 1問3秒の制限時間 |
| 7 | 言語力テスト（アナグラム）に回答 | - ひらがなのみ（シニア設定）<br>- 最初の1文字がヒントとして表示 |
| 8 | 計算力テスト（暗算）に回答 | - 特大表示（シニア設定: 24px+）<br>- 2桁の足し算・引き算 |
| 9 | 空間認識テスト（図形回転）に回答 | - 2D回転、90度のみ<br>- 3択 |
| 10 | 全問回答完了 | テスト結果画面（S-007）に遷移 |
| 11 | 結果画面を確認 | - 「今日のスコア: XX点」表示<br>- カテゴリ別スコア表示<br>- のうたんのリアクション（スコアに応じた表情）<br>- 昨日比の変化表示<br>- ポジティブな表現のみ（シニア設定） |
| 12 | 「ホームに戻る」をタップ | - ホーム画面に遷移<br>- カレンダーに本日が「完了」マーク<br>- 連続日数が更新 |

**期待結果**:
- デイリーチャレンジが5分以内に完了可能
- スコアが正しく計算・保存される
- ファミリーダッシュボードにスコアが反映される
- 通知が家族に送信される（テスト完了通知）

---

### E2E-003: 親世代の見守りダッシュボード確認

**対応ユーザーストーリー**: US-002（親世代の見守りダッシュボード確認）

**ペルソナ**: 太郎さん（48歳）

**前提条件**:
- 太郎さんのアカウントがログイン済み
- ファミリーグループ「田中家」に管理者として参加
- 花子さん（母）が本日テストを完了済み（スコア82点）
- さくらちゃん（娘）が本日テスト完了済み（スコア90点）

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | BottomNavの「ファミリー」をタップ | ファミリーダッシュボード（S-009）に遷移 |
| 2 | メンバー一覧を確認 | - 花子さん: テスト完了済み、スコア82点、上昇トレンド、太陽マーク<br>- さくら: テスト完了済み、スコア90点<br>- 太郎さん(自分): 未実施<br>- 各メンバーのアバターとニックネームが表示 |
| 3 | 花子さんのカードをタップ | - 花子さんのスコア詳細画面が表示<br>- カテゴリ別スコア<br>- トレンドグラフ |
| 4 | 戻るボタンで一覧に戻る | ファミリーダッシュボードに戻る |
| 5 | 「励ます」ボタンをタップ | - スタンプピッカーが表示される<br>- 「すごいね、お母さん!」スタンプを選択 |
| 6 | スタンプを送信 | - 送信成功メッセージが表示<br>- 花子さんへの通知が送信される |
| 7 | 「ランキング」をタップ | ファミリーランキング画面（S-010）に遷移 |
| 8 | ランキングを確認 | - デイリーランキング: 1位さくら、2位花子<br>- 太郎さんの順位が表示（未実施の場合は「-」） |
| 9 | BottomNavの「ホーム」に戻る | ホーム画面に遷移 |

**期待結果**:
- ファミリーメンバーの状態がリアルタイムに表示される
- スタンプ送信が正常に動作する
- ランキングが正しい順位で表示される

---

### E2E-004: ファミリー招待（QRコード）→ 参加 → ダッシュボード確認

**対応ユーザーストーリー**: US-007

**前提条件**:
- 太郎さん（管理者）がログイン済み
- ゆりさん（太郎さんの妻）が新規アカウント作成済み・オンボーディング完了

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | 太郎さん: ファミリー管理画面を開く | S-016 グループ管理画面が表示 |
| 2 | 「メンバーを招待」をタップ | 招待方法選択画面が表示 |
| 3 | 「QRコード」を選択 | - QRコードが画面に表示される<br>- QRコードにfamily/joinのURLが含まれる |
| 4 | ゆりさん: QRコードをスキャン（テストではURL直接アクセス） | - ファミリー参加確認画面が表示<br>- 「田中家に参加しますか?」 |
| 5 | ゆりさん: 「参加する」をタップ | - 参加完了メッセージ<br>- ファミリーダッシュボードにゆりさんが表示される |
| 6 | 太郎さん: ダッシュボードを確認 | - ゆりさんがメンバーとして表示<br>- 「ゆりさんがファミリーに参加しました」通知 |
| 7 | ゆりさん: ダッシュボードを確認 | - 全メンバーが表示される<br>- 花子さん、太郎さん、さくらのカードが見える |

**期待結果**:
- QRコードによる招待が正常に完了する
- 参加後、両方のユーザーのダッシュボードに反映される
- 管理者に参加通知が届く

---

### E2E-005: ファミリー招待（招待コード）→ 参加

**対応ユーザーストーリー**: US-007

**前提条件**:
- 太郎さん（管理者）がログイン済み
- こうたくん（7歳、太郎の息子）のアカウントが作成済み

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | 太郎さん: グループ管理画面で招待コードを表示 | 6桁英数字コードが表示される |
| 2 | こうたくん: 「コードで参加」画面を開く | コード入力フィールドが表示される |
| 3 | こうたくん: 6桁コードを入力 | コードが正しく入力される |
| 4 | 「参加する」をタップ | - 参加完了<br>- ファミリーダッシュボードに遷移 |
| 5 | こうたくんがキッズ年齢層で表示 | - キッズUIが適用<br>- ageGroup='kids' |

**期待結果**:
- 招待コードによる参加が正常に完了する
- キッズユーザーとして適切に登録される

---

### E2E-006: ファミリー招待（招待リンク）→ 参加

**対応ユーザーストーリー**: US-007

**前提条件**:
- 太郎さん（管理者）がログイン済み
- 新規ユーザー（おじいちゃん・一郎さん80歳）がアカウント作成済み

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | 太郎さん: 「招待リンクをコピー」をタップ | リンクがクリップボードにコピーされる |
| 2 | 一郎さん: 招待リンクのURLにアクセス | - アプリ内参加確認画面が表示<br>- 「田中家」のグループ情報が表示 |
| 3 | 「参加する」をタップ | 参加完了 |
| 4 | ダッシュボードを確認 | メンバーとして表示される |

**期待結果**:
- 招待リンクの有効期限（7日間）が正しく機能する
- リンク経由の参加が正常に完了する

---

### E2E-007: 世代対抗戦の参加と結果確認

**対応ユーザーストーリー**: US-003（子供と祖父母の世代対抗戦）

**ペルソナ**: さくらちゃん（10歳）

**前提条件**:
- 田中家全員がファミリーグループに参加済み
- 今週の世代対抗戦が開催中（月曜〜日曜）
- シニアチーム（花子・一郎）、親チーム（太郎・ゆり）、キッズチーム（さくら・こうた）

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | ホーム画面で世代対抗戦バナーを確認 | - 「今週の世代対抗戦!」バナーが表示<br>- 現在のチームスコアが表示 |
| 2 | バナーをタップ | 世代対抗戦詳細画面に遷移 |
| 3 | チーム構成を確認 | - 3チームが表示される<br>- 自分がキッズチームに属している<br>- 各チームのメンバーと平均スコア |
| 4 | デイリーチャレンジを実施 | テストを完了（キッズ難易度） |
| 5 | 結果画面でチーム貢献を確認 | - 自分のスコアがチームスコアに反映<br>- チーム順位が更新される |
| 6 | 世代対抗戦画面に戻る | - キッズチームのスコアが更新<br>- 現在のリーダーチーム表示 |

**期待結果**:
- チームスコアが正しく計算される（メンバー平均）
- 少人数補正が適用される（1人チーム: x1.2、2人チーム: x1.1）
- チームランキングが正しく表示される

---

### E2E-008: テスト未実施の見守り通知と応答

**対応ユーザーストーリー**: US-004（テスト未実施の見守り通知）

**ペルソナ**: 太郎さん（48歳）→ 花子さん（75歳）

**前提条件**:
- 花子さんが本日テスト未実施
- 通知設定で「テスト未実施通知」がON

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | 太郎さん: アプリ内通知を確認 | - 「花子さんが今日まだテストしていません」通知が表示<br>- 通知優先度: 低 |
| 2 | 通知をタップ | 花子さんのメンバー詳細画面に遷移 |
| 3 | 「メッセージを送る」をタップ | メッセージ送信画面が表示 |
| 4 | ボイスメッセージを録音（テストではモック） | - 録音UIが表示<br>- 最大30秒<br>- 録音完了後プレビュー再生 |
| 5 | 送信する | メッセージ送信完了 |
| 6 | 花子さん: メッセージ通知を確認 | - 「太郎さんからボイスメッセージが届きました」通知 |
| 7 | 花子さん: ボイスメッセージを再生 | - 再生UIが表示<br>- 0.8x再生ボタンが利用可能 |
| 8 | 花子さん: デイリーチャレンジを開始 | テスト画面に遷移 |

**期待結果**:
- 未実施通知がタイミング正確に配信される
- ボイスメッセージの録音・送信・再生が一連で動作する
- 花子さんのダッシュボードが「テスト完了」に更新される

---

### E2E-009: 月次レポート閲覧とPDFダウンロード

**対応ユーザーストーリー**: US-005（月次レポートの医師共有）

**ペルソナ**: 太郎さん（48歳）

**前提条件**:
- 花子さんの1月分データが十分に蓄積（テスト実施日数5日以上）
- 月次レポートが生成済み

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | BottomNavの「レポート」をタップ | 月次レポート画面（S-014）に遷移 |
| 2 | 月選択で「2026年1月」を選択 | 1月のレポートが表示される |
| 3 | レポート内容を確認 | - 総合スコアの推移グラフ<br>- カテゴリ別スコアのレーダーチャート<br>- トレンド分析<br>- 前月比較（データがあれば）<br>- テスト実施日数・連続日数 |
| 4 | 「PDFをダウンロード」をタップ | - PDFファイルがダウンロードされる<br>- ファイル名に年月が含まれる |
| 5 | ファミリーメンバーのレポートを確認 | - 花子さんのレポートを選択可能（権限がparent以上）<br>- 花子さんのデータが表示される |
| 6 | 「メールで送信」をタップ（テストではモック） | メール送信ダイアログが表示される |

**期待結果**:
- レポートが正しいデータで生成される
- PDFダウンロードが機能する
- 権限に応じたデータ閲覧が制御される

---

### E2E-010: 連続ログインとバッジ獲得

**対応ユーザーストーリー**: US-006（連続ログインとバッジ獲得）

**ペルソナ**: 花子さん（75歳）

**前提条件**:
- 花子さんが29日連続テスト完了済み
- 本日テストを完了すると30日連続達成

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | ホーム画面を開く | - 連続日数「29日」が表示<br>- 「あと1日で30日連続達成!」メッセージ |
| 2 | デイリーチャレンジを開始 | テスト画面に遷移 |
| 3 | 全5問に回答 | 各問題が正常に動作 |
| 4 | テスト完了 | - スコア表示<br>- 「30日連続達成!」特別アニメーション |
| 5 | バッジ獲得演出を確認 | - 「1ヶ月マスター」シルバーバッジ獲得<br>- のうたんが特別アニメーション<br>- 紙吹雪エフェクト |
| 6 | コイン報酬を確認 | - 100コインが付与される<br>- 限定着せ替えアイテム(背景)解放通知 |
| 7 | バッジコレクション画面で確認 | - 「1ヶ月マスター」が獲得済みバッジに表示<br>- ティアが「シルバー」 |
| 8 | ファミリーへの通知を確認 | - 「花子さんが30日マスターバッジを獲得!」通知が送信 |

**期待結果**:
- 連続記録が正しくカウントされる
- バッジ獲得条件が正確に判定される
- 報酬（コイン・アイテム）が正しく付与される
- ファミリーへの自動通知が送信される

---

### E2E-011: キッズモードでのテスト実施

**対応ユーザーストーリー**: US-003

**ペルソナ**: さくらちゃん（10歳）

**前提条件**:
- さくらちゃんのアカウントがキッズ年齢層で登録済み
- デイリーチャレンジが生成済み

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | ホーム画面を確認 | - キッズUI: イラスト多め、漢字少なめ<br>- のうたんが元気なアニメーション<br>- デイリーチャレンジボタンが目立つ |
| 2 | デイリーチャレンジを開始 | テスト画面に遷移 |
| 3 | 記憶力テスト（絵合わせ）に回答 | - キッズ: 2x3（6枚/3ペア）<br>- 制限時間60秒<br>- イラストがかわいい |
| 4 | 注意力テスト（反応速度）に回答 | - ターゲット15回<br>- おとり5回<br>- 表示間隔1500-3000ms |
| 5 | 言語力テスト（しりとり）に回答 | - AI語彙: 小学1-3年レベル<br>- 制限時間30秒/ターン<br>- 音声入力対応 |
| 6 | 計算力テスト（暗算）に回答 | - 1桁の足し算・引き算<br>- 制限時間15秒<br>- 大きな表示 |
| 7 | 空間認識テスト（ジグソー）に回答 | - 4ピース（2x2）<br>- 制限時間60秒<br>- ドラッグ&ドロップ |
| 8 | 結果画面を確認 | - ポジティブな表現のみ<br>- のうたんが喜ぶ<br>- スコアが分かりやすく表示 |

**期待結果**:
- キッズ難易度のパラメータが正しく適用される
- UI要素（フォントサイズ18px、タッチターゲット52px）が適切
- ポジティブな結果表現のみ使用される

---

### E2E-012: ファミリーランキング確認

**対応ユーザーストーリー**: US-009（ファミリーランキングの盛り上がり）

**前提条件**:
- 田中家全員が今週テストを実施済み
- スコアデータが蓄積済み

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | ファミリーダッシュボードの「ランキング」をタップ | ランキング画面（S-010）に遷移 |
| 2 | デイリーランキングを確認 | - 順位、名前、スコアが表示<br>- 自分の順位がハイライト |
| 3 | ウィークリーランキングに切替 | ウィークリーデータで表示 |
| 4 | 連続記録ランキングに切替 | 連続日数でランキング表示 |
| 5 | カテゴリ別チャンピオンを確認 | - 5カテゴリ各1位が表示<br>- 「記憶力王: 花子」等 |

**期待結果**:
- 各ランキングが正しい順位で表示される
- 切替が正常に動作する

---

### E2E-013: 早期警告通知と家族のアクション

**対応ユーザーストーリー**: US-008（早期警告からの家族のアクション）

**ペルソナ**: 太郎さん（48歳）

**前提条件**:
- 花子さんの記憶力スコアが2週間で15%以上低下（warningレベル）
- 太郎さんがparent権限でトレンドアラート受信がON

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | アプリ内にトレンドアラート通知が表示 | - 「花子さんの記憶力スコアに変化が見られます」<br>- オレンジ色のアラートバッジ<br>- 優先度: 最高 |
| 2 | 通知をタップ | 花子さんのスコア詳細画面に遷移 |
| 3 | トレンドグラフを確認 | - 記憶力スコアの下降トレンドが可視化<br>- 2週間の変化が明確<br>- 下降トレンドの矢印（オレンジ色） |
| 4 | 「声をかける」ボタンをタップ | メッセージ送信画面に遷移 |
| 5 | 励ましスタンプを送信 | 送信完了 |
| 6 | 月次レポートへのリンクを確認 | レポート画面への導線が表示 |

**期待結果**:
- 早期警告が正しい閾値（15%低下 + 2カテゴリ以上）で発動する
- アラートの表示が適切（オレンジ色、赤は使用しない）
- 家族がアクションを取るための導線が明確

---

### E2E-014: オフライン → オンライン復帰の同期テスト

**対応ユーザーストーリー**: US-010（オフライン環境でのテスト実施）

**ペルソナ**: 花子さん（75歳）

**前提条件**:
- 花子さんのアカウントがログイン済み
- デイリーチャレンジが事前にキャッシュ済み
- Service Worker がインストール済み

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | ネットワークをオフラインに設定 | - context.setOffline(true)<br>- オフラインバナーが表示される |
| 2 | ホーム画面を確認 | - キャッシュされたデータで表示<br>- デイリーチャレンジボタンが利用可能 |
| 3 | デイリーチャレンジを開始 | - キャッシュ済みチャレンジが読み込まれる<br>- テスト画面が正常に表示 |
| 4 | 全5問に回答 | - 各テストが正常に動作<br>- 回答データがIndexedDBに保存 |
| 5 | テスト完了 | - スコアがローカルで計算・表示<br>- 「オフライン中のため、後で同期されます」メッセージ |
| 6 | SyncQueueを確認 | - 回答データとスコアがsyncQueueに追加<br>- status='pending' |
| 7 | ネットワークをオンラインに復帰 | - context.setOffline(false)<br>- オフラインバナーが消える |
| 8 | 自動同期を確認 | - SyncQueueのアイテムがAPI送信される<br>- status='completed'に更新 |
| 9 | ファミリーダッシュボードを確認 | - 花子さんのスコアが反映<br>- テスト完了済みマーク |
| 10 | スコア履歴を確認 | - オフラインで実施したスコアが含まれる<br>- 日付が正しい |

**期待結果**:
- オフライン中でもテストの実施・スコア計算が可能
- オンライン復帰時に自動的にデータが同期される
- ファミリーダッシュボードに正しく反映される
- 同期キューが正しく処理される（FIFO順）

---

### E2E-015: スタンプ送信・受信フロー

**対応ユーザーストーリー**: US-001

**前提条件**:
- 太郎さんと花子さんが同じファミリーグループに参加
- メッセージ画面が利用可能

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | 太郎さん: BottomNavの「ファミリー」→ メッセージをタップ | メッセージ画面（S-011）に遷移 |
| 2 | スタンプボタンをタップ | - スタンプピッカーが表示<br>- 4カテゴリ（励まし、お祝い、あいさつ、感情）が表示 |
| 3 | 「励まし」カテゴリの「がんばって!」スタンプを選択 | スタンプがプレビュー表示 |
| 4 | 送信先を花子さんに設定して送信 | - 送信完了<br>- メッセージ一覧にスタンプが表示 |
| 5 | 花子さん: メッセージ画面を確認 | - 未読バッジが表示<br>- 太郎さんからのスタンプが表示<br>- マスコットキャラクター付き |
| 6 | 花子さん: メッセージを開く | 既読に更新される |

**期待結果**:
- スタンプの選択・送信・受信が一連で動作する
- 未読カウントが正しく更新される
- マスコットキャラクター付きの表示

---

### E2E-016: ボイスメッセージ送信・受信

**対応ユーザーストーリー**: US-004

**前提条件**:
- 花子さんと太郎さんが同じファミリーグループに参加
- マイクの権限が許可済み（テストではモック）

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | 太郎さん: メッセージ画面でボイスボタンをタップ | 録音UIが表示される |
| 2 | 録音開始 | - 録音インジケータが表示<br>- 経過時間が表示<br>- 最大30秒 |
| 3 | 5秒間録音後、停止 | - 録音データがプレビュー可能<br>- 再生ボタンが表示 |
| 4 | プレビュー再生 | 録音内容が再生される |
| 5 | 送信 | - 送信完了<br>- 500KB以下のサイズ制限内か確認 |
| 6 | 花子さん: ボイスメッセージを受信 | - ボイスメッセージの通知<br>- 再生ボタンが表示 |
| 7 | 花子さん: 0.8x再生をタップ | - ゆっくり再生される<br>- 再生完了 |

**期待結果**:
- ボイスメッセージの録音・送信・再生が動作する
- 30秒制限が機能する
- 0.8x再生が利用可能

---

### E2E-017: キャラクター育成と着せ替え

**対応ユーザーストーリー**: US-006

**前提条件**:
- 花子さんのキャラクター（のうたん）が「子フクロウ」段階
- 花子さんがコイン150枚保有
- 着せ替えアイテムが複数解放済み

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | BottomNavの「キャラ」をタップ | キャラクター画面に遷移 |
| 2 | のうたんの現在の状態を確認 | - 「子フクロウ」段階の見た目<br>- 現在のコイン数表示 |
| 3 | 「着せ替え」をタップ | キャラクター着せ替え画面（S-013）に遷移 |
| 4 | アイテム一覧を確認 | - カテゴリ別（帽子、アクセサリー、背景、エフェクト）<br>- 解放済み/未解放の表示<br>- 各アイテムの価格（コイン）表示 |
| 5 | 帽子アイテムを選択 | - プレビューにのうたんが帽子を被った状態で表示 |
| 6 | 「購入して装着」をタップ（30コイン） | - コインが消費される（150→120）<br>- アイテムが装着される |
| 7 | 別の帽子に変更 | 即座に反映される |
| 8 | ホーム画面に戻る | のうたんが着せ替え状態で表示 |

**期待結果**:
- 着せ替えプレビューが正しく表示される
- コインの消費が正確
- 装着アイテムがホーム画面に反映される

---

### E2E-018: ウィークリーチャレンジ実施（中断・再開含む）

**対応ユーザーストーリー**: US-009

**前提条件**:
- ウィークリーチャレンジが月曜日に解放済み
- 太郎さんがログイン済み

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | ホーム画面で「ウィークリーチャレンジ」をタップ | ウィークリーチャレンジ画面（S-020）に遷移 |
| 2 | チャレンジ概要を確認 | - 15問構成（5カテゴリx各3問）<br>- 所要時間目安: 約15分<br>- 実施期限: 日曜23:59 |
| 3 | 「はじめる」をタップ | 1問目が表示される |
| 4 | 5問目まで回答 | 各テストが正常に動作 |
| 5 | アプリをバックグラウンドに移動（またはブラウザタブ切替） | 中断される |
| 6 | アプリに戻る | - 中断確認ダイアログが表示<br>- 「続きから再開」ボタン |
| 7 | 「続きから再開」をタップ | - 6問目から再開<br>- 前5問の回答が保持されている |
| 8 | 残り10問に回答 | 各テストが正常に動作 |
| 9 | テスト完了 | - ウィークリースコアが表示<br>- ファミリーランキングに反映<br>- デイリーより高い重み付け |

**期待結果**:
- ウィークリーチャレンジの中断・再開が正常に動作する
- 進捗データがIndexedDBに保存され、復元される
- ウィークリースコアがランキングに反映される

---

### E2E-019: アクセシビリティ設定変更と反映確認

**対応ユーザーストーリー**: US-007

**ペルソナ**: 花子さん（75歳）

**前提条件**:
- 花子さんがログイン済み
- デフォルト設定状態

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | 設定 → アクセシビリティ設定を開く | アクセシビリティ設定画面（S-018）に遷移 |
| 2 | 文字サイズを「特大」に変更 | - プレビューで文字サイズが変わる<br>- 32px相当 |
| 3 | ハイコントラストモードをON | - 配色が高コントラストに変更<br>- コントラスト比4.5:1以上 |
| 4 | 音声ガイドをON | 音声ガイドが有効化 |
| 5 | シンプルUIモードをON | - 装飾が排除<br>- 大きなボタン<br>- 最小限の要素 |
| 6 | ホーム画面に戻る | - すべての設定が反映<br>- 文字が特大<br>- コントラストが高い<br>- UIがシンプル |
| 7 | デイリーチャレンジを開始 | - テスト画面でも設定が反映<br>- タッチターゲットが64px以上 |
| 8 | 設定をデフォルトに戻す | 元の状態に復帰 |

**期待結果**:
- アクセシビリティ設定が即座に全画面に反映される
- 設定はlocalStorageに永続化される
- 各設定が独立して機能する

---

### E2E-020: 新規ユーザー登録 → オンボーディング → テスト → 結果共有の完全フロー

**対応ユーザーストーリー**: US-001, US-007（統合フロー）

**ペルソナ**: 新規ユーザー「みどりさん」（68歳、太郎さんの叔母）

**前提条件**:
- ファミリーグループ「田中家」が存在
- 太郎さんから招待コードを受け取っている

**テスト手順**:

| Step | 操作 | 検証ポイント |
|------|------|------------|
| 1 | アプリを開く | スプラッシュ画面が表示 |
| 2 | 「新規登録」をタップ | 新規登録画面（S-004）に遷移 |
| 3 | メールアドレスとパスワードを入力 | - メール形式バリデーション<br>- パスワード強度表示 |
| 4 | 「登録する」をタップ | - アカウント作成成功<br>- オンボーディング（Step 1）に遷移 |
| 5 | オンボーディング Step 1-3 を完了 | - 名前入力「みどり」<br>- 生年月日選択（1958年）<br>- 年齢層「シニア」と判定 |
| 6 | Step 4: 招待コードで「田中家」に参加 | ファミリーグループに参加完了 |
| 7 | Step 5: お試しテスト3問 | テスト完了 |
| 8 | ホーム画面に到着 | - のうたん（ヒナ段階）が表示<br>- デイリーチャレンジが利用可能 |
| 9 | デイリーチャレンジを実施（全5問） | - シニア難易度で出題<br>- ヒント利用可能<br>- フォント20px |
| 10 | テスト結果を確認 | - スコア表示<br>- カテゴリ別結果<br>- のうたんのリアクション |
| 11 | ファミリーへの共有を確認 | - テスト完了通知が田中家に配信<br>- ダッシュボードにみどりさんが表示 |
| 12 | 太郎さん: ダッシュボードでみどりさんを確認 | - みどりさんのカードが表示<br>- スコアとテスト完了マーク |
| 13 | 太郎さん: みどりさんにスタンプ送信 | 送信完了 |
| 14 | みどりさん: スタンプ受信確認 | 未読バッジとスタンプ表示 |

**期待結果**:
- 新規登録からテスト結果共有まで、全フローが中断なく完了する
- 各画面遷移が正しい
- データが正しく保存・共有される
- 年齢に応じたUI調整が適用される

---

## 3. テストデータ

### 3.1 テスト用ファミリー構成（3世代）

```typescript
// e2e/fixtures/family.ts

export const tanakiFamilyFixture = {
  family: {
    id: 'fam-tanaka-001',
    name: '田中家',
    inviteCode: 'ABC123',
    createdAt: '2026-01-01T00:00:00+09:00',
    ownerId: 'user-taro-001',
  },
  members: [
    {
      id: 'user-hanako-001',
      displayName: '花子',
      email: 'hanako@test.example.com',
      password: 'TestPass123!',
      birthDate: '1951-03-15',
      ageGroup: 'senior_plus',
      relationship: 'grandmother',
      role: 'member',
      avatar: 'preset-grandma-01',
    },
    {
      id: 'user-ichiro-001',
      displayName: '一郎',
      email: 'ichiro@test.example.com',
      password: 'TestPass123!',
      birthDate: '1946-08-20',
      ageGroup: 'senior_plus',
      relationship: 'grandfather',
      role: 'member',
      avatar: 'preset-grandpa-01',
    },
    {
      id: 'user-taro-001',
      displayName: '太郎',
      email: 'taro@test.example.com',
      password: 'TestPass123!',
      birthDate: '1978-07-20',
      ageGroup: 'standard',
      relationship: 'father',
      role: 'owner',
      avatar: 'preset-dad-01',
    },
    {
      id: 'user-yuri-001',
      displayName: 'ゆり',
      email: 'yuri@test.example.com',
      password: 'TestPass123!',
      birthDate: '1981-11-05',
      ageGroup: 'standard',
      relationship: 'mother',
      role: 'member',
      avatar: 'preset-mom-01',
    },
    {
      id: 'user-sakura-001',
      displayName: 'さくら',
      email: 'sakura@test.example.com',
      password: 'TestPass123!',
      birthDate: '2016-04-10',
      ageGroup: 'kids',
      relationship: 'granddaughter',
      role: 'member',
      avatar: 'preset-girl-01',
    },
    {
      id: 'user-kota-001',
      displayName: 'こうた',
      email: 'kota@test.example.com',
      password: 'TestPass123!',
      birthDate: '2019-09-25',
      ageGroup: 'kids',
      relationship: 'grandson',
      role: 'member',
      avatar: 'preset-boy-01',
    },
  ],
};

// 新規参加者テストデータ
export const newMemberFixture = {
  id: 'user-midori-001',
  displayName: 'みどり',
  email: 'midori@test.example.com',
  password: 'TestPass123!',
  birthDate: '1958-06-12',
  ageGroup: 'senior',
  relationship: 'aunt',
};
```

### 3.2 テスト用スコア履歴データ

```typescript
// e2e/fixtures/scores.ts

// 花子さん: 30日間のスコア履歴（上昇トレンド、記憶力のみ近2週で低下）
export const hanakoScoreHistory = generateScoreHistory({
  userId: 'user-hanako-001',
  startDate: '2026-01-16',
  endDate: '2026-02-14',
  totalScoreTrend: 'improving',
  categoryOverrides: {
    memory: {
      trend: 'declining', // 記憶力のみ低下傾向（US-008用）
      baseScore: 75,
      recentDrop: 15, // 直近2週間で15%低下
    },
    attention: { trend: 'stable', baseScore: 70 },
    language: { trend: 'improving', baseScore: 65 },
    calculation: { trend: 'stable', baseScore: 60 },
    spatial: { trend: 'improving', baseScore: 55 },
  },
  streakDays: 29, // 29日連続（E2E-010で30日達成テスト用）
});

// さくらちゃん: 2週間のスコア履歴（高スコア、安定）
export const sakuraScoreHistory = generateScoreHistory({
  userId: 'user-sakura-001',
  startDate: '2026-02-01',
  endDate: '2026-02-14',
  totalScoreTrend: 'stable',
  categoryOverrides: {
    memory: { trend: 'stable', baseScore: 85 },
    attention: { trend: 'stable', baseScore: 90 },
    language: { trend: 'improving', baseScore: 75 },
    calculation: { trend: 'stable', baseScore: 95 },
    spatial: { trend: 'stable', baseScore: 80 },
  },
  streakDays: 14,
});

// 太郎さん: 1週間のスコア履歴（不定期）
export const taroScoreHistory = generateScoreHistory({
  userId: 'user-taro-001',
  startDate: '2026-02-08',
  endDate: '2026-02-14',
  totalScoreTrend: 'stable',
  skipDays: [2, 5], // 一部の日にちスキップ
  categoryOverrides: {
    memory: { trend: 'stable', baseScore: 72 },
    attention: { trend: 'stable', baseScore: 78 },
    language: { trend: 'stable', baseScore: 80 },
    calculation: { trend: 'improving', baseScore: 85 },
    spatial: { trend: 'stable', baseScore: 70 },
  },
  streakDays: 3,
});

// スコア履歴生成ヘルパー
function generateScoreHistory(config: ScoreHistoryConfig): Score[] {
  const scores: Score[] = [];
  let currentDate = new Date(config.startDate);
  const endDate = new Date(config.endDate);
  let dayIndex = 0;

  while (currentDate <= endDate) {
    if (!config.skipDays?.includes(dayIndex)) {
      const categoryScores: Record<string, number> = {};
      for (const [category, settings] of Object.entries(config.categoryOverrides)) {
        const variation = Math.random() * 10 - 5; // +/- 5点のランダム変動
        let trendAdjust = 0;
        if (settings.trend === 'improving') trendAdjust = dayIndex * 0.5;
        if (settings.trend === 'declining') trendAdjust = -dayIndex * 0.5;
        categoryScores[category] = Math.max(0, Math.min(100,
          settings.baseScore + trendAdjust + variation
        ));
      }

      scores.push({
        id: `score-${config.userId}-${dayIndex}`,
        userId: config.userId,
        date: currentDate.toISOString().split('T')[0],
        totalScore: calculateWeightedAverage(categoryScores),
        categories: categoryScores,
        challengeType: 'daily',
        createdAt: currentDate.toISOString(),
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }

  return scores;
}
```

### 3.3 テスト用チャレンジデータ

```typescript
// e2e/fixtures/challenges.ts

export const dailyChallengeFixture = {
  id: 'challenge-daily-20260215',
  type: 'daily',
  date: '2026-02-15',
  status: 'available',
  questions: [
    {
      id: 'q-memory-001',
      category: 'memory',
      type: 'card_matching',
      // 各難易度のパラメータは年齢層に応じて動的に決定
    },
    {
      id: 'q-attention-001',
      category: 'attention',
      type: 'stroop',
    },
    {
      id: 'q-language-001',
      category: 'language',
      type: 'anagram',
    },
    {
      id: 'q-calculation-001',
      category: 'calculation',
      type: 'mental_arithmetic',
    },
    {
      id: 'q-spatial-001',
      category: 'spatial',
      type: 'shape_rotation',
    },
  ],
};

export const weeklyChallengeFixture = {
  id: 'challenge-weekly-20260210',
  type: 'weekly',
  weekStart: '2026-02-10',
  weekEnd: '2026-02-16',
  status: 'available',
  questions: [
    // 5カテゴリ x 3問 = 15問
    // 記憶力 x 3
    { id: 'wq-mem-1', category: 'memory', type: 'card_matching' },
    { id: 'wq-mem-2', category: 'memory', type: 'word_memory' },
    { id: 'wq-mem-3', category: 'memory', type: 'story_memory' },
    // 注意力 x 3
    { id: 'wq-att-1', category: 'attention', type: 'spot_difference' },
    { id: 'wq-att-2', category: 'attention', type: 'stroop' },
    { id: 'wq-att-3', category: 'attention', type: 'reaction_time' },
    // 言語力 x 3
    { id: 'wq-lng-1', category: 'language', type: 'shiritori' },
    { id: 'wq-lng-2', category: 'language', type: 'anagram' },
    { id: 'wq-lng-3', category: 'language', type: 'word_association' },
    // 計算力 x 3
    { id: 'wq-cal-1', category: 'calculation', type: 'mental_arithmetic' },
    { id: 'wq-cal-2', category: 'calculation', type: 'number_sequence' },
    { id: 'wq-cal-3', category: 'calculation', type: 'mental_arithmetic' },
    // 空間認識 x 3
    { id: 'wq-spt-1', category: 'spatial', type: 'jigsaw_puzzle' },
    { id: 'wq-spt-2', category: 'spatial', type: 'shape_rotation' },
    { id: 'wq-spt-3', category: 'spatial', type: 'jigsaw_puzzle' },
  ],
};
```

### 3.4 テスト用通知データ

```typescript
// e2e/fixtures/notifications.ts

export const notificationFixtures = {
  testCompleted: {
    type: 'test_completed',
    title: 'テスト完了',
    body: '花子さんがデイリーチャレンジを完了しました! スコア: 82点',
    priority: 'medium',
    targetUrl: '/family',
  },
  newRecord: {
    type: 'new_record',
    title: '新記録達成!',
    body: '花子さんが記憶力で新記録を達成! 92点',
    priority: 'high',
    targetUrl: '/scores',
  },
  trendAlert: {
    type: 'trend_alert',
    title: 'スコア変化のお知らせ',
    body: '花子さんの記憶力スコアに変化が見られます',
    priority: 'critical',
    targetUrl: '/family/member/user-hanako-001',
  },
  inactiveReminder: {
    type: 'inactive_reminder',
    title: 'テスト未実施',
    body: '花子さんが今日まだテストしていません',
    priority: 'low',
    targetUrl: '/family',
  },
  badgeEarned: {
    type: 'badge_earned',
    title: 'バッジ獲得!',
    body: '花子さんが「1ヶ月マスター」バッジを獲得!',
    priority: 'high',
    targetUrl: '/badges',
  },
};
```

---

## 4. 検証ポイント

### 4.1 画面遷移の検証

| 遷移パターン | 元画面 | 遷移先 | 検証方法 |
|-------------|--------|--------|---------|
| 未認証 → ログイン | スプラッシュ | ログイン画面 | URLが`/login`であること |
| ログイン → オンボーディング | ログイン | オンボーディング Step 1 | URLが`/setup/1`であること |
| ログイン → ホーム | ログイン | ホーム画面 | URLが`/home`であること（オンボーディング完了済み） |
| ホーム → デイリーチャレンジ | ホーム | チャレンジ画面 | URLが`/challenge/daily`であること |
| テスト完了 → 結果 | テストプレイ | テスト結果画面 | URLが`/challenge/*/result`であること |
| BottomNav遷移 | 各画面 | 対応する画面 | URLが正しいこと |

```typescript
// 検証コード例
await expect(page).toHaveURL('/home');
await expect(page.locator('[data-testid="bottom-nav-home"]')).toHaveAttribute('aria-current', 'page');
```

### 4.2 データ永続化の検証

| データ種別 | 保存先 | 検証方法 |
|-----------|--------|---------|
| ユーザー設定 | localStorage | `page.evaluate(() => localStorage.getItem('user-storage'))` |
| テスト回答 | IndexedDB | IndexedDBの`pendingAnswers`ストアを確認 |
| スコア履歴 | IndexedDB | IndexedDBの`scores`ストアを確認 |
| 同期キュー | IndexedDB | IndexedDBの`syncQueue`ストアを確認 |
| 認証トークン | localStorage | `localStorage`にrefreshTokenが存在すること |

```typescript
// IndexedDB検証例
const dbData = await page.evaluate(async () => {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('noukatsu-family-db', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const tx = db.transaction('scores', 'readonly');
  const store = tx.objectStore('scores');
  return new Promise<unknown[]>((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
});
expect(dbData).toHaveLength(greaterThan(0));
```

### 4.3 通知の検証

| 通知トリガー | 通知内容 | 配信先 | 検証方法 |
|------------|---------|--------|---------|
| テスト完了 | スコアと完了メッセージ | ファミリーメンバー | アプリ内通知一覧に表示されること |
| 新記録達成 | 新記録スコアとカテゴリ | ファミリーメンバー | 通知バナーが表示されること |
| 連続記録更新 | 連続日数 | ファミリーメンバー | 通知が配信されること |
| バッジ獲得 | バッジ名とティア | ファミリーメンバー | 通知が配信されること |
| 早期警告 | カテゴリとスコア変化 | parent権限メンバー | アラート通知が表示されること |
| テスト未実施 | 未実施メンバー名 | parent権限メンバー | 通知が配信されること |

```typescript
// 通知検証例
await expect(page.locator('[data-testid="notification-banner"]')).toBeVisible();
await expect(page.locator('[data-testid="notification-banner"]')).toContainText('花子さんがデイリーチャレンジを完了しました');
```

### 4.4 アクセシビリティの検証

| 検証項目 | 基準 | 検証方法 |
|---------|------|---------|
| 文字サイズ（シニア） | 20px以上 | `page.locator('body').evaluate(el => getComputedStyle(el).fontSize)` |
| 文字サイズ（シニアプラス） | 24px以上 | 同上 |
| タッチターゲット（シニア） | 56px以上 | ボタン要素のサイズを計測 |
| タッチターゲット（キッズ） | 52px以上 | 同上 |
| コントラスト比 | 4.5:1以上 | @axe-core/playwrightで検証 |
| aria-label | 全インタラクティブ要素 | `page.locator('button:not([aria-label])')` が0件 |
| キーボードナビゲーション | Tab移動可能 | `page.keyboard.press('Tab')` |
| 画面読み上げ | ラベル付き | axe-core自動検証 |

```typescript
// axe-core による自動検証
import AxeBuilder from '@axe-core/playwright';

const accessibilityScanResults = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();

expect(accessibilityScanResults.violations).toEqual([]);
```

### 4.5 パフォーマンスの検証

| 検証項目 | 基準 | 検証方法 |
|---------|------|---------|
| ページ初期表示 | 3秒以内 | `page.goto()`のレスポンス時間 |
| テスト開始までの遷移 | 2秒以内 | ナビゲーション時間を計測 |
| スコア計算 | 500ms以内 | テスト完了→結果表示の時間 |
| オフライン→オンライン同期 | 10秒以内 | 同期完了までの時間 |

---

## 5. テスト環境・設定

### 5.1 Playwright設定

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false, // データ依存があるため順次実行
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: '.test-logs/latest/tests/e2e-results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
  },
  projects: [
    // デスクトップ（親世代想定）
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // モバイル（シニア想定）
    {
      name: 'mobile-iphone',
      use: { ...devices['iPhone 14'] },
    },
    // タブレット
    {
      name: 'tablet-ipad',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 5.2 テストファイル配置

```
e2e/
├── fixtures/
│   ├── family.ts                  # ファミリー構成データ
│   ├── scores.ts                  # スコア履歴データ
│   ├── challenges.ts              # チャレンジデータ
│   ├── notifications.ts           # 通知データ
│   └── seed.ts                    # テストDB初期化
├── helpers/
│   ├── auth.ts                    # ログインヘルパー
│   ├── game.ts                    # テストプレイヘルパー（自動回答）
│   ├── network.ts                 # ネットワーク制御ヘルパー
│   ├── accessibility.ts           # アクセシビリティ検証ヘルパー
│   └── db.ts                      # IndexedDB操作ヘルパー
├── pages/
│   ├── home.page.ts               # ホーム画面POM
│   ├── login.page.ts              # ログイン画面POM
│   ├── onboarding.page.ts         # オンボーディング画面POM
│   ├── challenge.page.ts          # チャレンジ画面POM
│   ├── result.page.ts             # 結果画面POM
│   ├── family-dashboard.page.ts   # ファミリーダッシュボードPOM
│   ├── ranking.page.ts            # ランキング画面POM
│   ├── message.page.ts            # メッセージ画面POM
│   ├── settings.page.ts           # 設定画面POM
│   ├── badge.page.ts              # バッジ画面POM
│   ├── character.page.ts          # キャラクター画面POM
│   └── report.page.ts             # レポート画面POM
├── specs/
│   ├── e2e-001-onboarding.spec.ts
│   ├── e2e-002-daily-challenge-senior.spec.ts
│   ├── e2e-003-family-dashboard.spec.ts
│   ├── e2e-004-invite-qr.spec.ts
│   ├── e2e-005-invite-code.spec.ts
│   ├── e2e-006-invite-link.spec.ts
│   ├── e2e-007-team-battle.spec.ts
│   ├── e2e-008-inactive-notification.spec.ts
│   ├── e2e-009-monthly-report.spec.ts
│   ├── e2e-010-streak-badge.spec.ts
│   ├── e2e-011-kids-mode.spec.ts
│   ├── e2e-012-family-ranking.spec.ts
│   ├── e2e-013-early-warning.spec.ts
│   ├── e2e-014-offline-sync.spec.ts
│   ├── e2e-015-stamp-messaging.spec.ts
│   ├── e2e-016-voice-messaging.spec.ts
│   ├── e2e-017-character-dress-up.spec.ts
│   ├── e2e-018-weekly-challenge.spec.ts
│   ├── e2e-019-accessibility-settings.spec.ts
│   └── e2e-020-full-flow.spec.ts
└── global-setup.ts                # グローバルセットアップ（DB初期化）
```

### 5.3 テスト実行コマンド

```bash
# 全E2Eテスト実行
npx playwright test

# 特定のテスト実行
npx playwright test e2e-001

# デスクトップのみ
npx playwright test --project=desktop-chrome

# モバイルのみ
npx playwright test --project=mobile-iphone

# デバッグモード
npx playwright test --debug

# UIモード
npx playwright test --ui

# テストレポート表示
npx playwright show-report
```

### 5.4 Page Object Model (POM) 例

```typescript
// e2e/pages/home.page.ts
import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly mascot: Locator;
  readonly dailyChallengeButton: Locator;
  readonly streakCounter: Locator;
  readonly bottomNav: Locator;
  readonly notificationBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mascot = page.locator('[data-testid="mascot"]');
    this.dailyChallengeButton = page.locator('[data-testid="daily-challenge-button"]');
    this.streakCounter = page.locator('[data-testid="streak-counter"]');
    this.bottomNav = page.locator('[data-testid="bottom-nav"]');
    this.notificationBanner = page.locator('[data-testid="notification-banner"]');
  }

  async goto() {
    await this.page.goto('/home');
  }

  async startDailyChallenge() {
    await this.dailyChallengeButton.click();
    await this.page.waitForURL('**/challenge/daily');
  }

  async navigateToFamily() {
    await this.bottomNav.locator('[data-testid="nav-family"]').click();
    await this.page.waitForURL('**/family');
  }

  async getStreakCount(): Promise<number> {
    const text = await this.streakCounter.textContent();
    return parseInt(text?.match(/\d+/)?.[0] || '0', 10);
  }
}
```

### 5.5 認証ヘルパー

```typescript
// e2e/helpers/auth.ts
import { Page } from '@playwright/test';
import { tanakiFamilyFixture } from '../fixtures/family';

export async function loginAs(page: Page, userId: string) {
  const member = tanakiFamilyFixture.members.find(m => m.id === userId);
  if (!member) throw new Error(`User not found: ${userId}`);

  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', member.email);
  await page.fill('[data-testid="password-input"]', member.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('**/home');
}

export async function loginAsHanako(page: Page) {
  return loginAs(page, 'user-hanako-001');
}

export async function loginAsTaro(page: Page) {
  return loginAs(page, 'user-taro-001');
}

export async function loginAsSakura(page: Page) {
  return loginAs(page, 'user-sakura-001');
}
```

### 5.6 ゲームプレイヘルパー

```typescript
// e2e/helpers/game.ts
import { Page } from '@playwright/test';

export async function autoPlayDailyChallenge(page: Page) {
  // デイリーチャレンジの5問を自動回答
  for (let i = 0; i < 5; i++) {
    await page.waitForSelector('[data-testid="question-container"]');
    const questionType = await page.getAttribute('[data-testid="question-container"]', 'data-question-type');

    switch (questionType) {
      case 'card_matching':
        await autoPlayCardMatching(page);
        break;
      case 'stroop':
        await autoPlayStroop(page);
        break;
      case 'anagram':
        await autoPlayAnagram(page);
        break;
      case 'mental_arithmetic':
        await autoPlayArithmetic(page);
        break;
      case 'shape_rotation':
        await autoPlayShapeRotation(page);
        break;
      default:
        // 汎用: 最初の選択肢をクリック
        await page.click('[data-testid="answer-option"]:first-child');
    }

    // 次の問題へ（最後の問題でなければ）
    const nextButton = page.locator('[data-testid="next-question"]');
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
  }

  // 結果画面を待機
  await page.waitForURL('**/result');
}

async function autoPlayCardMatching(page: Page) {
  // 全カードを順番にクリック（テスト用簡易実装）
  const cards = page.locator('[data-testid="card"]');
  const count = await cards.count();
  for (let i = 0; i < count; i += 2) {
    await cards.nth(i).click();
    await cards.nth(i + 1).click();
    await page.waitForTimeout(500); // アニメーション待ち
  }
}

async function autoPlayStroop(page: Page) {
  // 正しい色のボタンをクリック
  const correctColor = await page.getAttribute('[data-testid="stroop-display"]', 'data-correct-color');
  await page.click(`[data-testid="color-button-${correctColor}"]`);
}

async function autoPlayAnagram(page: Page) {
  // 正解をdata属性から取得してクリック
  const answer = await page.getAttribute('[data-testid="anagram-container"]', 'data-answer');
  if (answer) {
    await page.fill('[data-testid="anagram-input"]', answer);
    await page.click('[data-testid="submit-answer"]');
  }
}

async function autoPlayArithmetic(page: Page) {
  const answer = await page.getAttribute('[data-testid="arithmetic-container"]', 'data-answer');
  if (answer) {
    await page.fill('[data-testid="arithmetic-input"]', answer);
    await page.click('[data-testid="submit-answer"]');
  }
}

async function autoPlayShapeRotation(page: Page) {
  const correctIndex = await page.getAttribute('[data-testid="rotation-container"]', 'data-correct-index');
  await page.click(`[data-testid="rotation-option-${correctIndex}"]`);
}
```

---

*Phase 2: 設計 - E2Eテスト設計書*
*CCAGI SDK v3.5.0*
