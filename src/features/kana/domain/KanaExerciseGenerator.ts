import type { ScriptedExerciseGenerator } from "../../exercises/domain/generator";
import {
  kana,
  kanaWords,
  katakanaOrigins,
  type Kana,
  type KanaWord,
  type Level,
} from "../data/kana";
import type {
  KanaChoiceQuestion,
  KanaExerciseSection,
  KanaExerciseSet,
  KanaMatchingQuestion,
  KanaQuestion,
  KanaWritingQuestion,
} from "./types";

type RandomSource = () => number;

const SECTION_META = {
  "sound-to-kana": {
    title: "听音辨字",
    description: "通过读音找到对应假名",
  },
  "kana-to-sound": {
    title: "看字辨音",
    description: "看到假名后选出正确读音",
  },
  "kana-writing": {
    title: "动手书写",
    description: "跟随动画提示写出假名",
  },
  "kana-matching": {
    title: "配对连线",
    description: "点击配对假名与读音",
  },
  "word-practice": {
    title: "词语应用",
    description: "在简单词语里认出假名与读音",
  },
  "word-reading-to-kana": {
    title: "读音找注音",
    description: "根据罗马音选择词语的假名注音",
  },
  "word-kana-to-reading": {
    title: "注音找读音",
    description: "根据假名注音选择罗马音",
  },
} as const;

function shuffle<T>(items: T[], random: RandomSource): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function choices(
  answer: string,
  pool: string[],
  random: RandomSource,
): string[] {
  const alternatives = shuffle(
    [...new Set(pool)].filter((option) => option !== answer),
    random,
  ).slice(0, 3);
  if (alternatives.length < 3)
    throw new Error(`题目「${answer}」没有足够的唯一干扰项`);
  return shuffle([answer, ...alternatives], random);
}

function itemAt<T>(items: T[], index: number): T {
  const item = items[index % items.length];
  if (!item) throw new Error("假名习题没有可用内容");
  return item;
}

function section(
  id: keyof typeof SECTION_META,
  questions: KanaQuestion[],
): KanaExerciseSection {
  return { id, ...SECTION_META[id], questions };
}

export class KanaExerciseGenerator implements ScriptedExerciseGenerator<
  Level,
  KanaExerciseSet
> {
  readonly id = "kana";

  constructor(private readonly random: RandomSource = Math.random) {}

  generate(level: Level): KanaExerciseSet {
    const sections =
      level.kind === "word"
        ? this.generateWordSections(level)
        : this.generateKanaSections(level);
    return {
      levelId: level.id,
      script: level.script,
      sections,
      totalQuestions: sections.reduce(
        (total, current) => total + current.questions.length,
        0,
      ),
    };
  }

  private generateKanaSections(level: Level): KanaExerciseSection[] {
    const targets = shuffle(
      kana.filter((item) => level.rows.includes(item.row)),
      this.random,
    );
    if (!targets.length) throw new Error(`关卡 ${level.id} 没有假名内容`);

    return [
      section(
        "sound-to-kana",
        Array.from({ length: 3 }, (_, index) =>
          this.soundToKana(level, itemAt(targets, index), index),
        ),
      ),
      section(
        "kana-to-sound",
        Array.from({ length: 3 }, (_, index) =>
          this.kanaToSound(level, itemAt(targets, index + 3), index),
        ),
      ),
      section(
        "kana-writing",
        Array.from({ length: 3 }, (_, index) =>
          this.writing(level, itemAt(targets, index + 6), index),
        ),
      ),
      section(
        "kana-matching",
        Array.from({ length: 3 }, (_, index) =>
          this.matching(level, targets, index),
        ),
      ),
      section(
        "word-practice",
        Array.from({ length: 3 }, (_, index) =>
          index % 2 === 0
            ? this.wordReadingToKana(
                level,
                itemAt(this.wordsFor(level), index),
                index,
                "word-practice",
              )
            : this.wordKanaToReading(
                level,
                itemAt(this.wordsFor(level), index),
                index,
                "word-practice",
              ),
        ),
      ),
    ];
  }

  private generateWordSections(level: Level): KanaExerciseSection[] {
    const words = shuffle(this.wordsFor(level), this.random);
    return [
      section(
        "word-reading-to-kana",
        Array.from({ length: 5 }, (_, index) =>
          this.wordReadingToKana(
            level,
            itemAt(words, index),
            index,
            "word-reading-to-kana",
          ),
        ),
      ),
      section(
        "word-kana-to-reading",
        Array.from({ length: 5 }, (_, index) =>
          this.wordKanaToReading(
            level,
            itemAt(words, index + 5),
            index,
            "word-kana-to-reading",
          ),
        ),
      ),
    ];
  }

  private soundToKana(
    level: Level,
    target: Kana,
    index: number,
  ): KanaChoiceQuestion {
    const answer = target[level.script];
    const pool = kana
      .filter((item) => item.reading !== target.reading)
      .map((item) => item[level.script]);
    return {
      id: `${level.id}-sound-${index}`,
      sectionId: "sound-to-kana",
      kind: "sound-to-kana",
      hint: "这个读音对应哪个假名？",
      prompt: target.reading,
      promptStyle: "reading",
      speak: answer,
      answer,
      options: choices(answer, pool, this.random),
      explanation: `${answer} 的读音是 ${target.reading}。`,
    };
  }

  private kanaToSound(
    level: Level,
    target: Kana,
    index: number,
  ): KanaChoiceQuestion {
    const glyph = target[level.script];
    const origin =
      level.script === "katakana" ? katakanaOrigins[glyph] : undefined;
    return {
      id: `${level.id}-reading-${index}`,
      sectionId: "kana-to-sound",
      kind: "kana-to-sound",
      hint: "这个假名怎么读？",
      prompt: glyph,
      promptStyle: "kana",
      speak: glyph,
      answer: target.reading,
      options: choices(
        target.reading,
        kana.map((item) => item.reading),
        this.random,
      ),
      explanation: origin
        ? `${glyph} 读作 ${target.reading}。${origin.story}`
        : `${glyph} 读作 ${target.reading}。`,
    };
  }

  private writing(
    level: Level,
    target: Kana,
    index: number,
  ): KanaWritingQuestion {
    const glyph = target[level.script];
    return {
      id: `${level.id}-writing-${index}`,
      sectionId: "kana-writing",
      kind: "kana-writing",
      hint: "听读音，在方格里写出假名",
      reading: target.reading,
      glyph,
      speak: glyph,
      answer: glyph,
      explanation: `${target.reading} 对应 ${glyph}。本题成绩由你对照笔画后自评。`,
    };
  }

  private matching(
    level: Level,
    targets: Kana[],
    index: number,
  ): KanaMatchingQuestion {
    const uniqueTargets = targets.filter(
      (target, targetIndex, all) =>
        all.findIndex((item) => item.reading === target.reading) ===
        targetIndex,
    );
    const rotated = uniqueTargets.map(
      (_, targetIndex) =>
        uniqueTargets[(targetIndex + index) % uniqueTargets.length],
    );
    const pairs = shuffle(rotated, this.random)
      .slice(0, Math.min(4, uniqueTargets.length))
      .map((target, pairIndex) => ({
        id: `${level.id}-match-${index}-${pairIndex}`,
        glyph: target[level.script],
        reading: target.reading,
      }));
    return {
      id: `${level.id}-matching-${index}`,
      sectionId: "kana-matching",
      kind: "kana-matching",
      hint: "依次点击左侧假名和右侧读音完成配对",
      speak: pairs.map((pair) => pair.glyph).join("、"),
      answer: "__all-matched__",
      pairs,
      explanation: `完成了 ${pairs.length} 组假名与读音配对。`,
    };
  }

  private wordReadingToKana(
    level: Level,
    word: KanaWord,
    index: number,
    sectionId: "word-practice" | "word-reading-to-kana",
  ): KanaChoiceQuestion {
    return {
      id: `${level.id}-word-kana-${index}`,
      sectionId,
      kind: "word-reading-to-kana",
      hint: "根据读音选择词语的假名注音",
      prompt: word.romaji,
      promptStyle: "reading",
      speak: word.text,
      answer: word.text,
      options: choices(
        word.text,
        this.wordsFor(level).map((item) => item.text),
        this.random,
      ),
      explanation: `${word.romaji} 写作 ${word.text}，意思是「${word.meaning}」。`,
      revealText: `日常写法：${word.written}`,
    };
  }

  private wordKanaToReading(
    level: Level,
    word: KanaWord,
    index: number,
    sectionId: "word-practice" | "word-kana-to-reading",
  ): KanaChoiceQuestion {
    return {
      id: `${level.id}-word-reading-${index}`,
      sectionId,
      kind: "word-kana-to-reading",
      hint: "这个假名注音对应哪个读音？",
      prompt: word.text,
      promptStyle: "word",
      speak: word.text,
      answer: word.romaji,
      options: choices(
        word.romaji,
        this.wordsFor(level).map((item) => item.romaji),
        this.random,
      ),
      explanation: `${word.text} 读作 ${word.romaji}，意思是「${word.meaning}」。`,
      revealText: `日常写法：${word.written}`,
    };
  }

  private wordsFor(level: Level): KanaWord[] {
    const words = kanaWords.filter((word) => word.script === level.script);
    if (words.length < 4) throw new Error(`${level.script} 词语不足 4 个`);
    return words;
  }
}

export function generateKanaExercises(
  level: Level,
  random: RandomSource = Math.random,
): KanaExerciseSet {
  return new KanaExerciseGenerator(random).generate(level);
}
