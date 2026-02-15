import type { Question, ChallengeType, DifficultyLevel } from "@/types";
import { shuffleArray, randomInt, generateId } from "@/lib/utils";

// ============================================================
// 記憶力: カードマッチ（絵合わせ）
// ============================================================

const CARD_MATCH_ITEMS = [
  "🍎", "🍊", "🍋", "🍇", "🍓", "🍑", "🌸", "🌻",
  "🐕", "🐈", "🐦", "🐟", "🌙", "⭐", "☀️", "🌈",
  "🏠", "🚗", "✈️", "🚢", "📚", "🎵", "🎨", "⚽",
];

export function generateCardMatchQuestions(difficulty: DifficultyLevel): Question[] {
  const pairCounts: Record<DifficultyLevel, number> = { 1: 3, 2: 4, 3: 6, 4: 8, 5: 10 };
  const count = pairCounts[difficulty];
  const selected = shuffleArray(CARD_MATCH_ITEMS).slice(0, count);
  const pairs = shuffleArray([...selected, ...selected]);

  return [{
    id: generateId("cm"),
    type: "card-match",
    prompt: "同じ絵柄のペアを見つけてね！",
    correctAnswer: selected,
    metadata: { cards: pairs, pairCount: count },
  }];
}

// ============================================================
// 記憶力: 単語記憶
// ============================================================

const WORD_LISTS: Record<DifficultyLevel, string[][]> = {
  1: [["りんご", "ねこ", "くるま"]],
  2: [["さくら", "うみ", "でんしゃ", "ほし"]],
  3: [["たんぽぽ", "かみなり", "れいぞうこ", "ひこうき", "めがね"]],
  4: [["ちょうちょう", "しんかんせん", "ひまわり", "かたつむり", "さんぽ", "とけい"]],
  5: [["こころ", "しあわせ", "おもいで", "やさしさ", "ありがとう", "えがお", "きぼう"]],
};

export function generateWordMemoryQuestions(difficulty: DifficultyLevel): Question[] {
  const lists = WORD_LISTS[difficulty];
  const words = shuffleArray(lists[randomInt(0, lists.length - 1)]!);

  return [
    {
      id: generateId("wm-show"),
      type: "word-memory",
      prompt: `これらの言葉を覚えてね！`,
      correctAnswer: words,
      metadata: { phase: "memorize", words, displayTime: 3000 + difficulty * 1000 },
    },
    {
      id: generateId("wm-recall"),
      type: "word-memory",
      prompt: "さっき見た言葉を選んでね！",
      options: [...words, ...shuffleArray(["かぜ", "やま", "つき", "はな", "そら", "いえ"]).slice(0, words.length)],
      correctAnswer: words,
      metadata: { phase: "recall" },
    },
  ];
}

// ============================================================
// 注意力: ストループテスト
// ============================================================

const COLORS = [
  { name: "あか", color: "#E8845C" },
  { name: "あお", color: "#5B9BD5" },
  { name: "みどり", color: "#3D8B5F" },
  { name: "きいろ", color: "#F2C94C" },
];

export function generateStroopQuestions(difficulty: DifficultyLevel): Question[] {
  const questionCount: Record<DifficultyLevel, number> = { 1: 5, 2: 7, 3: 10, 4: 12, 5: 15 };
  const count = questionCount[difficulty];

  return Array.from({ length: count }, () => {
    const textColor = COLORS[randomInt(0, COLORS.length - 1)]!;
    const displayColor = difficulty >= 3
      ? COLORS.filter(c => c.name !== textColor.name)[randomInt(0, COLORS.length - 2)]!
      : textColor;

    return {
      id: generateId("st"),
      type: "stroop" as ChallengeType,
      prompt: "文字の「色」を選んでね！（書いてある言葉ではないよ）",
      options: COLORS.map(c => c.name),
      correctAnswer: displayColor.name,
      metadata: { text: textColor.name, displayColor: displayColor.color },
    };
  });
}

// ============================================================
// 計算力: 暗算
// ============================================================

export function generateMentalMathQuestions(difficulty: DifficultyLevel): Question[] {
  const count: Record<DifficultyLevel, number> = { 1: 5, 2: 7, 3: 10, 4: 12, 5: 15 };
  const ranges: Record<DifficultyLevel, [number, number]> = {
    1: [1, 10], 2: [1, 20], 3: [1, 50], 4: [1, 100], 5: [10, 200],
  };
  const [min, max] = ranges[difficulty];

  return Array.from({ length: count[difficulty] }, () => {
    const ops = difficulty <= 2 ? ["+", "-"] : ["+", "-", "\u00d7"];
    const op = ops[randomInt(0, ops.length - 1)]!;
    let a = randomInt(min, max);
    let b = randomInt(min, Math.floor(max / 2));

    if (op === "-" && a < b) [a, b] = [b, a];

    const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
    const wrongAnswers = [answer + randomInt(1, 5), answer - randomInt(1, 5), answer + randomInt(-3, 3)].filter(w => w !== answer && w >= 0);

    return {
      id: generateId("mm"),
      type: "mental-math" as ChallengeType,
      prompt: `${a} ${op} ${b} = ?`,
      options: shuffleArray([String(answer), ...wrongAnswers.slice(0, 3).map(String)]),
      correctAnswer: String(answer),
    };
  });
}

// ============================================================
// 言語力: アナグラム
// ============================================================

const ANAGRAM_WORDS: Record<DifficultyLevel, { word: string; shuffled: string }[]> = {
  1: [{ word: "さくら", shuffled: "くらさ" }, { word: "うみ", shuffled: "みう" }],
  2: [{ word: "ひまわり", shuffled: "わりまひ" }, { word: "かぜ", shuffled: "ぜか" }],
  3: [{ word: "しんかんせん", shuffled: "んせかしんん" }, { word: "たんぽぽ", shuffled: "ぽんたぽ" }],
  4: [{ word: "れいぞうこ", shuffled: "こうぞれい" }, { word: "ちょうちょう", shuffled: "うちちょうょ" }],
  5: [{ word: "おもてなし", shuffled: "なしてもお" }, { word: "いただきます", shuffled: "すまきだたい" }],
};

export function generateAnagramQuestions(difficulty: DifficultyLevel): Question[] {
  const words = ANAGRAM_WORDS[difficulty];
  return words.map(w => ({
    id: generateId("ag"),
    type: "anagram" as ChallengeType,
    prompt: `「${w.shuffled}」を並べ替えて正しい言葉にしてね！`,
    correctAnswer: w.word,
    metadata: { shuffled: w.shuffled },
  }));
}

// ============================================================
// メイン生成関数
// ============================================================

export function generateQuestions(type: ChallengeType, difficulty: DifficultyLevel): Question[] {
  switch (type) {
    case "card-match": return generateCardMatchQuestions(difficulty);
    case "word-memory": return generateWordMemoryQuestions(difficulty);
    case "stroop": return generateStroopQuestions(difficulty);
    case "mental-math": return generateMentalMathQuestions(difficulty);
    case "anagram": return generateAnagramQuestions(difficulty);
    default: return generateMentalMathQuestions(difficulty);
  }
}
