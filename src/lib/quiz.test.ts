import { describe, expect, it } from "vitest";
import { questionsFromCards } from "./quiz";
import type { Card } from "../types";

describe("卡片动态出题", () => {
  it("按卡片字段生成题目，字段多题就多", () => {
    const cards: Card[] = [
      {
        id: "a",
        kind: "word",
        front: "猫",
        back: "猫（动物）",
        reading: "neko",
        example: "猫が好きです。",
      },
      { id: "b", kind: "grammar", front: "…です", back: "是……" },
    ];
    const questions = questionsFromCards(cards, cards);
    expect(questions).toHaveLength(4);
    for (const q of questions) {
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
});
