import type { Question, ChallengeType, DifficultyLevel } from "@/types";
import { shuffleArray, randomInt, generateId } from "@/lib/utils";

// ============================================================
// 認知機能スクリーニング検査ベースの問題生成
// 参考: HDS-R（長谷川式）, MMSE, MoCA-J
// ============================================================

// ============================================================
// 1. 記憶力テスト（HDS-R 項目4,7,8 / MMSE 項目3,5）
// 3〜5語の記銘・再認テスト
// ============================================================

const MEMORY_WORD_SETS = [
  { words: ["さくら", "ねこ", "でんしゃ"], hints: ["はな", "どうぶつ", "のりもの"] },
  { words: ["うめ", "いぬ", "じどうしゃ"], hints: ["はな", "どうぶつ", "のりもの"] },
  { words: ["ひまわり", "うさぎ", "ひこうき"], hints: ["はな", "どうぶつ", "のりもの"] },
  { words: ["あさがお", "さかな", "ふね"], hints: ["はな", "いきもの", "のりもの"] },
  { words: ["もみじ", "とり", "じてんしゃ"], hints: ["き", "どうぶつ", "のりもの"] },
  { words: ["すみれ", "かめ", "バス"], hints: ["はな", "どうぶつ", "のりもの"] },
  { words: ["たんぽぽ", "りす", "タクシー"], hints: ["はな", "どうぶつ", "のりもの"] },
];

// 同カテゴリの紛らわしい選択肢（MoCA遅延再生ヒント方式）
const MEMORY_SIMILAR_DISTRACTORS: Record<string, string[]> = {
  はな: ["ばら", "チューリップ", "すみれ", "あさがお", "ゆり", "もみじ"],
  どうぶつ: ["いぬ", "さる", "うま", "くま", "きつね", "たぬき"],
  いきもの: ["かに", "えび", "いか", "たこ", "くらげ", "かめ"],
  のりもの: ["バス", "タクシー", "しんかんせん", "ふね", "ひこうき", "じてんしゃ"],
  き: ["さくら", "まつ", "いちょう", "かえで", "たけ", "すぎ"],
};

export function generateWordMemoryQuestions(difficulty: DifficultyLevel): Question[] {
  const set = MEMORY_WORD_SETS[randomInt(0, MEMORY_WORD_SETS.length - 1)]!;
  const targetIdx = randomInt(0, set.words.length - 1);
  const targetWord = set.words[targetIdx]!;
  const hint = set.hints[targetIdx]!;

  // 同カテゴリの紛らわしい選択肢を使う（臨床検査の再認方式）
  const similarWords = (MEMORY_SIMILAR_DISTRACTORS[hint] ?? [])
    .filter((w) => w !== targetWord);
  const distractors = shuffleArray(similarWords).slice(0, 3);

  const options = shuffleArray([targetWord, ...distractors]);

  return [
    {
      id: generateId("wm"),
      type: "word-memory" as ChallengeType,
      prompt: `つぎの 3つの ことばを\nおぼえてください\n\n「${set.words[0]}」「${set.words[1]}」「${set.words[2]}」\n\nおぼえましたか？\nこの中に あった ことばは？`,
      options,
      correctAnswer: targetWord,
      metadata: { category: "memory", testType: "word-recognition" },
    },
  ];
}

// ============================================================
// 2. 見当識テスト（HDS-R 項目2 / MMSE 項目1 / MoCA 項目10）
// 日付・曜日・季節の認識
// ============================================================

const DAY_NAMES = [
  "にちようび",
  "げつようび",
  "かようび",
  "すいようび",
  "もくようび",
  "きんようび",
  "どようび",
];

const MONTH_NAMES = [
  "1がつ",
  "2がつ",
  "3がつ",
  "4がつ",
  "5がつ",
  "6がつ",
  "7がつ",
  "8がつ",
  "9がつ",
  "10がつ",
  "11がつ",
  "12がつ",
];

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "はる";
  if (month >= 6 && month <= 8) return "なつ";
  if (month >= 9 && month <= 11) return "あき";
  return "ふゆ";
}

function getSeasonOptions(): string[] {
  return ["はる", "なつ", "あき", "ふゆ"];
}

type OrientationGenerator = () => Question;

function makeDayQuestion(): Question {
  const now = new Date();
  const correctDay = DAY_NAMES[now.getDay()]!;
  return {
    id: generateId("or"),
    type: "stroop" as ChallengeType,
    prompt: "きょうは なんようび ですか？",
    options: DAY_NAMES.slice(),
    correctAnswer: correctDay,
    metadata: { category: "attention", testType: "orientation-day" },
  };
}

function makeMonthQuestion(): Question {
  const now = new Date();
  const correctMonth = MONTH_NAMES[now.getMonth()]!;
  // 近い月を選択肢にする（より臨床的）
  const monthIdx = now.getMonth();
  const nearbyMonths = [
    MONTH_NAMES[(monthIdx - 1 + 12) % 12]!,
    correctMonth,
    MONTH_NAMES[(monthIdx + 1) % 12]!,
    MONTH_NAMES[(monthIdx + 2) % 12]!,
  ];
  return {
    id: generateId("or"),
    type: "stroop" as ChallengeType,
    prompt: "いまは なんがつ ですか？",
    options: shuffleArray(nearbyMonths),
    correctAnswer: correctMonth,
    metadata: { category: "attention", testType: "orientation-month" },
  };
}

function makeSeasonQuestion(): Question {
  const correctSeason = getCurrentSeason();
  return {
    id: generateId("or"),
    type: "stroop" as ChallengeType,
    prompt: "いまの きせつは なんですか？",
    options: getSeasonOptions(),
    correctAnswer: correctSeason,
    metadata: { category: "attention", testType: "orientation-season" },
  };
}

function makeDateQuestion(): Question {
  const now = new Date();
  const correctDate = now.getDate();
  // 近い日付を選択肢にする
  const options = shuffleArray([
    `${correctDate}にち`,
    `${correctDate - 1 > 0 ? correctDate - 1 : correctDate + 3}にち`,
    `${correctDate + 1}にち`,
    `${correctDate + 2}にち`,
  ]);
  return {
    id: generateId("or"),
    type: "stroop" as ChallengeType,
    prompt: "きょうは なんにち ですか？",
    options,
    correctAnswer: `${correctDate}にち`,
    metadata: { category: "attention", testType: "orientation-date" },
  };
}

const ORIENTATION_GENERATORS: OrientationGenerator[] = [
  makeDayQuestion,
  makeMonthQuestion,
  makeSeasonQuestion,
  makeDateQuestion,
];

export function generateStroopQuestions(difficulty: DifficultyLevel): Question[] {
  // 難易度に応じて出題数を変える
  const count = Math.min(difficulty + 1, ORIENTATION_GENERATORS.length);
  const generators = shuffleArray([...ORIENTATION_GENERATORS]).slice(0, count);
  return generators.map((gen) => gen());
}

// ============================================================
// 3. 計算テスト（HDS-R 項目5 / MMSE 項目4 / MoCA 項目6d）
// シリアル7引き算（100から7を引く）
// ============================================================

const SERIAL7_CHAIN = [
  { prompt: "100 から 7 を ひくと？", answer: 93 },
  { prompt: "93 から 7 を ひくと？", answer: 86 },
  { prompt: "86 から 7 を ひくと？", answer: 79 },
  { prompt: "79 から 7 を ひくと？", answer: 72 },
  { prompt: "72 から 7 を ひくと？", answer: 65 },
];

// 簡単な足し算・引き算（難易度1用の補助問題）
const SIMPLE_CALC = [
  { prompt: "8 たす 5 は？", answer: 13 },
  { prompt: "15 ひく 8 は？", answer: 7 },
  { prompt: "7 たす 6 は？", answer: 13 },
  { prompt: "20 ひく 3 は？", answer: 17 },
  { prompt: "9 たす 4 は？", answer: 13 },
  { prompt: "14 ひく 6 は？", answer: 8 },
  { prompt: "6 たす 7 は？", answer: 13 },
  { prompt: "18 ひく 9 は？", answer: 9 },
  { prompt: "11 たす 8 は？", answer: 19 },
  { prompt: "25 ひく 7 は？", answer: 18 },
];

function makeCalcOptions(answer: number): string[] {
  const wrongs = new Set<number>();
  wrongs.add(answer + 1);
  wrongs.add(answer - 1);
  wrongs.add(answer + 2);
  wrongs.add(answer - 2);
  // 近い数字だけにする（臨床検査的に意味のある誤答）
  const wrongArr = Array.from(wrongs)
    .filter((n) => n !== answer && n >= 0)
    .slice(0, 3);
  return shuffleArray([String(answer), ...wrongArr.map(String)]);
}

export function generateMentalMathQuestions(
  difficulty: DifficultyLevel
): Question[] {
  if (difficulty <= 2) {
    // 難易度1-2: シリアル7を1〜2問 + 簡単な計算
    const serial7Count = difficulty;
    const questions: Question[] = [];

    for (let i = 0; i < serial7Count; i++) {
      const item = SERIAL7_CHAIN[i]!;
      questions.push({
        id: generateId("mm"),
        type: "mental-math" as ChallengeType,
        prompt: item.prompt,
        options: makeCalcOptions(item.answer),
        correctAnswer: String(item.answer),
        metadata: { category: "math", testType: "serial-7" },
      });
    }

    // 補助的な簡単計算
    const simpleCount = 2 - serial7Count;
    const simples = shuffleArray(SIMPLE_CALC).slice(0, simpleCount);
    for (const item of simples) {
      questions.push({
        id: generateId("mm"),
        type: "mental-math" as ChallengeType,
        prompt: item.prompt,
        options: makeCalcOptions(item.answer),
        correctAnswer: String(item.answer),
        metadata: { category: "math", testType: "simple-calc" },
      });
    }

    return questions.slice(0, 1); // 1問返す
  }

  // 難易度3以上: シリアル7を3〜5問
  const count = Math.min(difficulty, SERIAL7_CHAIN.length);
  return SERIAL7_CHAIN.slice(0, count).map((item) => ({
    id: generateId("mm"),
    type: "mental-math" as ChallengeType,
    prompt: item.prompt,
    options: makeCalcOptions(item.answer),
    correctAnswer: String(item.answer),
    metadata: { category: "math", testType: "serial-7" },
  }));
}

// ============================================================
// 4. 言語・カテゴリテスト
// HDS-R 項目9（野菜の名前）/ MoCA 項目8（抽象概念）
// カテゴリ分類・仲間はずれ探し・共通点発見
// ============================================================

interface CategoryQuestion {
  prompt: string;
  options: string[];
  correctAnswer: string;
  testType: string;
}

// カテゴリ分類問題：「この中で〇〇はどれ？」
const CATEGORY_ID_QUESTIONS: CategoryQuestion[] = [
  {
    prompt: "この中で「やさい」は どれですか？",
    options: ["にんじん", "さくら", "すずめ", "えんぴつ"],
    correctAnswer: "にんじん",
    testType: "category-id",
  },
  {
    prompt: "この中で「くだもの」は どれですか？",
    options: ["りんご", "たまねぎ", "いす", "くつ"],
    correctAnswer: "りんご",
    testType: "category-id",
  },
  {
    prompt: "この中で「どうぶつ」は どれですか？",
    options: ["きりん", "チューリップ", "ピアノ", "くるま"],
    correctAnswer: "きりん",
    testType: "category-id",
  },
  {
    prompt: "この中で「のりもの」は どれですか？",
    options: ["しんかんせん", "とうふ", "たいよう", "ぼうし"],
    correctAnswer: "しんかんせん",
    testType: "category-id",
  },
  {
    prompt: "この中で「からだの ぶぶん」は どれですか？",
    options: ["ひざ", "くも", "はさみ", "みかん"],
    correctAnswer: "ひざ",
    testType: "category-id",
  },
  {
    prompt: "この中で「きせつ」は どれですか？",
    options: ["あき", "テレビ", "さかな", "かばん"],
    correctAnswer: "あき",
    testType: "category-id",
  },
];

// 仲間はずれ問題：「仲間はずれはどれ？」
const ODD_ONE_OUT_QUESTIONS: CategoryQuestion[] = [
  {
    prompt: "なかまはずれは どれですか？",
    options: ["りんご", "みかん", "ぶどう", "たまねぎ"],
    correctAnswer: "たまねぎ",
    testType: "odd-one-out",
  },
  {
    prompt: "なかまはずれは どれですか？",
    options: ["いぬ", "ねこ", "うさぎ", "バラ"],
    correctAnswer: "バラ",
    testType: "odd-one-out",
  },
  {
    prompt: "なかまはずれは どれですか？",
    options: ["でんしゃ", "バス", "タクシー", "ピアノ"],
    correctAnswer: "ピアノ",
    testType: "odd-one-out",
  },
  {
    prompt: "なかまはずれは どれですか？",
    options: ["はる", "なつ", "あき", "げつようび"],
    correctAnswer: "げつようび",
    testType: "odd-one-out",
  },
  {
    prompt: "なかまはずれは どれですか？",
    options: ["にんじん", "だいこん", "キャベツ", "コップ"],
    correctAnswer: "コップ",
    testType: "odd-one-out",
  },
  {
    prompt: "なかまはずれは どれですか？",
    options: ["め", "みみ", "はな", "くつ"],
    correctAnswer: "くつ",
    testType: "odd-one-out",
  },
];

// 共通点発見問題（MoCA 項目8: 抽象概念）
const ABSTRACT_QUESTIONS: CategoryQuestion[] = [
  {
    prompt: "「でんしゃ」と「じてんしゃ」の\nきょうつうてんは？",
    options: ["のりもの", "たべもの", "どうぶつ", "きせつ"],
    correctAnswer: "のりもの",
    testType: "abstract",
  },
  {
    prompt: "「バナナ」と「みかん」の\nきょうつうてんは？",
    options: ["くだもの", "やさい", "のりもの", "どうぶつ"],
    correctAnswer: "くだもの",
    testType: "abstract",
  },
  {
    prompt: "「とけい」と「ものさし」の\nきょうつうてんは？",
    options: ["はかるもの", "たべもの", "のりもの", "いきもの"],
    correctAnswer: "はかるもの",
    testType: "abstract",
  },
  {
    prompt: "「テーブル」と「いす」の\nきょうつうてんは？",
    options: ["かぐ", "のりもの", "どうぶつ", "たべもの"],
    correctAnswer: "かぐ",
    testType: "abstract",
  },
  {
    prompt: "「さくら」と「ひまわり」の\nきょうつうてんは？",
    options: ["はな", "どうぶつ", "のりもの", "たべもの"],
    correctAnswer: "はな",
    testType: "abstract",
  },
];

export function generateAnagramQuestions(
  difficulty: DifficultyLevel
): Question[] {
  // 難易度に応じて問題タイプを混ぜる
  const allQuestions: CategoryQuestion[] = [];

  if (difficulty <= 2) {
    // 難易度1-2: カテゴリ分類と仲間はずれ
    allQuestions.push(...CATEGORY_ID_QUESTIONS, ...ODD_ONE_OUT_QUESTIONS);
  } else {
    // 難易度3以上: 抽象概念も追加
    allQuestions.push(
      ...CATEGORY_ID_QUESTIONS,
      ...ODD_ONE_OUT_QUESTIONS,
      ...ABSTRACT_QUESTIONS
    );
  }

  const selected = shuffleArray(allQuestions).slice(0, 1)[0]!;

  return [
    {
      id: generateId("cat"),
      type: "anagram" as ChallengeType,
      prompt: selected.prompt,
      options: selected.options,
      correctAnswer: selected.correctAnswer,
      metadata: { category: "language", testType: selected.testType },
    },
  ];
}

// ============================================================
// 5. 数字の逆唱・順序テスト（HDS-R 項目6 / MoCA 項目6b）
// 作業記憶（ワーキングメモリ）の評価
// ============================================================

interface DigitSpanQuestion {
  prompt: string;
  options: string[];
  correctAnswer: string;
  testType: string;
}

function generateDigitSpanReverse(): DigitSpanQuestion {
  // HDS-R式: 3桁の逆唱
  const digits3 = [randomInt(1, 9), randomInt(1, 9), randomInt(1, 9)];
  // 全て異なる数字にする
  while (digits3[1] === digits3[0]) digits3[1] = randomInt(1, 9);
  while (digits3[2] === digits3[0] || digits3[2] === digits3[1])
    digits3[2] = randomInt(1, 9);

  const reversed = [...digits3].reverse();
  const correctAnswer = reversed.join(" - ");

  // 紛らわしい選択肢
  const wrong1 = digits3.join(" - "); // そのまま
  const wrong2 = [digits3[2], digits3[0], digits3[1]].join(" - "); // 別の順番
  const wrong3 = [digits3[1], digits3[0], digits3[2]].join(" - "); // さらに別

  return {
    prompt: `「${digits3.join(" ・ ")}」を\nぎゃくから いうと？`,
    options: shuffleArray([correctAnswer, wrong1, wrong2, wrong3]),
    correctAnswer,
    testType: "digit-span-reverse",
  };
}

// 数列の次の数を当てる
function generateNumberSequence(): DigitSpanQuestion {
  const sequences = [
    { seq: [2, 4, 6, 8], next: "10", rule: "2ずつ増える" },
    { seq: [1, 3, 5, 7], next: "9", rule: "2ずつ増える" },
    { seq: [3, 6, 9, 12], next: "15", rule: "3ずつ増える" },
    { seq: [5, 10, 15, 20], next: "25", rule: "5ずつ増える" },
    { seq: [10, 20, 30, 40], next: "50", rule: "10ずつ増える" },
    { seq: [1, 2, 4, 8], next: "16", rule: "2倍になる" },
    { seq: [50, 45, 40, 35], next: "30", rule: "5ずつ減る" },
    { seq: [100, 90, 80, 70], next: "60", rule: "10ずつ減る" },
  ];

  const item = sequences[randomInt(0, sequences.length - 1)]!;
  const answer = Number(item.next);

  const wrongs = [answer + 1, answer - 1, answer + 2]
    .filter((n) => n !== answer && n > 0)
    .map(String);

  return {
    prompt: `つぎの かずは なんですか？\n\n${item.seq.join("、")}、？`,
    options: shuffleArray([item.next, ...wrongs.slice(0, 3)]),
    correctAnswer: item.next,
    testType: "number-sequence",
  };
}

export function generateNumberSequenceQuestions(
  difficulty: DifficultyLevel
): Question[] {
  // 難易度1-2: 逆唱か数列のどちらか
  // 難易度3以上: 両方から出題
  const generators =
    difficulty <= 2
      ? [generateDigitSpanReverse, generateNumberSequence]
      : [generateDigitSpanReverse, generateNumberSequence];

  const gen = generators[randomInt(0, generators.length - 1)]!;
  const q = gen();

  return [
    {
      id: generateId("ds"),
      type: "number-sequence" as ChallengeType,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer,
      metadata: { category: "spatial", testType: q.testType },
    },
  ];
}

// ============================================================
// カードマッチ（既存互換 - 使用しない場合も残す）
// ============================================================

const CARD_MATCH_ITEMS = [
  "🍎", "🍊", "🍋", "🍇", "🍓", "🍑", "🌸", "🌻",
  "🐕", "🐈", "🐦", "🐟", "🌙", "⭐", "☀️", "🌈",
];

export function generateCardMatchQuestions(
  difficulty: DifficultyLevel
): Question[] {
  const pairCounts: Record<DifficultyLevel, number> = {
    1: 3,
    2: 4,
    3: 6,
    4: 8,
    5: 10,
  };
  const count = pairCounts[difficulty];
  const selected = shuffleArray(CARD_MATCH_ITEMS).slice(0, count);
  const pairs = shuffleArray([...selected, ...selected]);

  return [
    {
      id: generateId("cm"),
      type: "card-match",
      prompt: "同じ絵柄のペアを見つけてね！",
      correctAnswer: selected,
      metadata: { cards: pairs, pairCount: count },
    },
  ];
}

// ============================================================
// メイン生成関数
// ============================================================

export function generateQuestions(
  type: ChallengeType,
  difficulty: DifficultyLevel
): Question[] {
  switch (type) {
    case "card-match":
      return generateCardMatchQuestions(difficulty);
    case "word-memory":
      return generateWordMemoryQuestions(difficulty);
    case "stroop":
      return generateStroopQuestions(difficulty);
    case "mental-math":
      return generateMentalMathQuestions(difficulty);
    case "anagram":
      return generateAnagramQuestions(difficulty);
    case "number-sequence":
      return generateNumberSequenceQuestions(difficulty);
    default:
      return generateMentalMathQuestions(difficulty);
  }
}
