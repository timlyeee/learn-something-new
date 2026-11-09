import { describe, expect, it } from "vitest";
import { resultFor } from "../../../lib/quiz";
import { kana, levelsFor } from "../data/kana";
import { generateKanaExercises } from "./KanaExerciseGenerator";
import { isKanaLevelUnlocked } from "./progression";

function fixedRandom(): number {
  return 0.42;
}

describe("假名脚本习题生成器", () => {
  it("普通假名关按五部分生成15题", () => {
    for (const script of ["hiragana", "katakana"] as const) {
      const level = levelsFor(script)[0];
      const exerciseSet = generateKanaExercises(level, fixedRandom);
      expect(exerciseSet.sections.map((section) => section.id)).toEqual([
        "sound-to-kana",
        "kana-to-sound",
        "kana-writing",
        "kana-matching",
        "word-practice",
      ]);
      expect(
        exerciseSet.sections.every((section) => section.questions.length === 3),
      ).toBe(true);
      expect(exerciseSet.totalQuestions).toBe(15);
    }
  });

  it("词语专项按两个部分生成10题并包含日常写法", () => {
    const level = levelsFor("hiragana").at(-1)!;
    const exerciseSet = generateKanaExercises(level, fixedRandom);
    expect(exerciseSet.sections.map((section) => section.id)).toEqual([
      "word-reading-to-kana",
      "word-kana-to-reading",
    ]);
    expect(exerciseSet.totalQuestions).toBe(10);
    expect(
      exerciseSet.sections
        .flatMap((section) => section.questions)
        .every((question) => question.revealText?.startsWith("日常写法：")),
    ).toBe(true);
  });

  it("所有选择题都有四个唯一选项和唯一答案", () => {
    for (const script of ["hiragana", "katakana"] as const) {
      for (const level of levelsFor(script)) {
        const questions = generateKanaExercises(
          level,
          fixedRandom,
        ).sections.flatMap((section) => section.questions);
        for (const question of questions) {
          if (!("options" in question)) continue;
          expect(question.options).toHaveLength(4);
          expect(new Set(question.options).size).toBe(4);
          expect(
            question.options.filter((option) => option === question.answer),
          ).toHaveLength(1);
        }
      }
    }
  });

  it("同一输入与随机源会生成稳定且不重复的题目 ID", () => {
    const level = levelsFor("hiragana")[0];
    const first = generateKanaExercises(level, fixedRandom).sections.flatMap(
      (section) => section.questions.map((question) => question.id),
    );
    const second = generateKanaExercises(level, fixedRandom).sections.flatMap(
      (section) => section.questions.map((question) => question.id),
    );
    expect(first).toEqual(second);
    expect(new Set(first).size).toBe(first.length);
  });

  it("读音选假名不会放入另一个同音正确项", () => {
    for (const script of ["hiragana", "katakana"] as const) {
      for (const level of levelsFor(script).filter(
        (item) => item.kind === "kana",
      )) {
        const questions = generateKanaExercises(level, fixedRandom).sections[0]
          .questions;
        for (const question of questions) {
          if (question.kind !== "sound-to-kana") continue;
          const validGlyphs = kana
            .filter((item) => item.reading === question.prompt)
            .map((item) => item[script]);
          expect(
            question.options.filter((option) => validGlyphs.includes(option)),
          ).toHaveLength(1);
        }
      }
    }
  });

  it("只在达到80%时解锁下一关，两个路线分别记录", () => {
    const levels = levelsFor("hiragana");
    expect(isKanaLevelUnlocked(0, levels, {})).toBe(true);
    expect(
      isKanaLevelUnlocked(1, levels, {
        [levels[0].id]: resultFor(11, 15),
      }),
    ).toBe(false);
    expect(
      isKanaLevelUnlocked(1, levels, {
        [levels[0].id]: resultFor(12, 15),
      }),
    ).toBe(true);
    expect(
      isKanaLevelUnlocked(1, levelsFor("katakana"), {
        [levels[0].id]: resultFor(15, 15),
      }),
    ).toBe(false);
    expect([12, 14, 15].map((count) => resultFor(count, 15).stars)).toEqual([
      1, 2, 3,
    ]);
  });
});
