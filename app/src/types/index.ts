// ユーザー関連
export type AgeGroup = "senior" | "adult" | "teen" | "child";
export type UIMode = "senior" | "standard" | "kids";

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  ageGroup: AgeGroup;
  uiMode: UIMode;
  familyIds: string[];
  createdAt: string;
}

export interface UserSettings {
  uiMode: UIMode;
  fontSize: "normal" | "large" | "extra-large";
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationEnabled: boolean;
  dailyReminderTime: string; // "HH:MM"
  theme: "system" | "light" | "dark";
  language: "ja" | "en";
  reducedMotion: boolean;
}

// ファミリー
export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  members: FamilyMember[];
  createdAt: string;
}

export interface FamilyMember {
  userId: string;
  name: string;
  avatarUrl?: string;
  ageGroup: AgeGroup;
  role: "admin" | "parent" | "senior" | "child";
  lastActiveAt: string;
  todayCompleted: boolean;
  currentStreak: number;
}

// 認知機能テスト
export type ChallengeCategory = "memory" | "attention" | "language" | "math" | "spatial";
export type ChallengeType =
  | "card-match" | "word-memory" | "story-memory"
  | "spot-diff" | "stroop" | "reaction-time"
  | "shiritori" | "anagram" | "word-chain"
  | "mental-math" | "number-sequence"
  | "puzzle" | "shape-rotation";

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface Challenge {
  id: string;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: DifficultyLevel;
  questions: Question[];
  timeLimit: number; // seconds
  createdAt: string;
}

export interface Question {
  id: string;
  type: ChallengeType;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface Answer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  responseTimeMs: number;
  answeredAt: string;
}

// スコア
export interface Score {
  id: string;
  userId: string;
  challengeId: string;
  category: ChallengeCategory;
  rawScore: number;
  normalizedScore: number; // 0-100
  accuracy: number; // 0-1
  averageResponseTime: number;
  difficulty: DifficultyLevel;
  completedAt: string;
}

export interface CategoryScore {
  category: ChallengeCategory;
  score: number; // 0-100
  trend: "up" | "down" | "stable";
  changePercent: number;
}

export interface DailyScore {
  date: string; // YYYY-MM-DD
  totalScore: number;
  categoryScores: CategoryScore[];
  challengeCount: number;
}

// メッセージ
export type MessageType = "stamp" | "text" | "voice";

export interface Message {
  id: string;
  familyId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string; // スタンプID or テキスト or 音声URL
  relatedScoreId?: string;
  createdAt: string;
  readBy: string[];
}

// バッジ
export interface Badge {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  iconType: string;
  condition: string;
  earnedAt?: string;
}

// キャラクター
export type CharacterVariant = "hakase" | "sensei" | "kun";
export type CharacterEmotion = "happy" | "excited" | "thinking" | "encouraging" | "celebrating" | "sleeping";

export interface CharacterState {
  variant: CharacterVariant;
  emotion: CharacterEmotion;
  level: number; // 1-5
  coins: number;
  equippedItems: string[];
  ownedItems: string[];
}

// アラート
export type AlertLevel = "info" | "caution" | "warning";

export interface HealthAlert {
  id: string;
  userId: string;
  level: AlertLevel;
  category: ChallengeCategory;
  message: string;
  changePercent: number;
  detectedAt: string;
  acknowledgedBy: string[];
}

// チャレンジカテゴリ情報
export const CATEGORY_INFO: Record<ChallengeCategory, { nameJa: string; icon: string; color: string }> = {
  memory: { nameJa: "記憶力", icon: "brain", color: "#3D8B5F" },
  attention: { nameJa: "注意力", icon: "eye", color: "#E8845C" },
  language: { nameJa: "言語力", icon: "message-circle", color: "#5B9BD5" },
  math: { nameJa: "計算力", icon: "calculator", color: "#F2C94C" },
  spatial: { nameJa: "空間認識", icon: "box", color: "#9B72CF" },
};

// 難易度名
export const DIFFICULTY_NAMES: Record<DifficultyLevel, string> = {
  1: "やさしい",
  2: "ふつう",
  3: "ちょっとむずかしい",
  4: "むずかしい",
  5: "チャレンジ",
};
