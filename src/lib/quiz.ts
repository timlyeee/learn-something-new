import type { Card } from "../types";
export interface Question {
  id: string;
  kind: "card-meaning" | "card-reading" | "card-choice";
  prompt: string;
  hint: string;
  reading?: string;
  speak: string;
  answer: string;
  options: string[];
  explanation: string;
}
export interface QuizResult {
  correct: number;
  total: number;
  stars: number;
}
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function choices(answer: string, pool: string[], random: () => number) {
  return shuffle(
    [
      answer,
      ...shuffle(
        [...new Set(pool)].filter((option) => option !== answer),
        random,
      ).slice(0, 3),
    ],
    random,
  );
}
function strings(items: (string | undefined)[]): string[] {
  return items.filter((item): item is string => typeof item === "string");
}

export function questionsFromCards(
  cards: Card[],
  pool: Card[] = cards,
  random = Math.random,
): Question[] {
  const questions: Question[] = [];
  for (const card of cards) {
    questions.push({
      id: `${card.id}-meaning`,
      kind: "card-meaning",
      prompt: card.front,
      hint:
        card.kind === "grammar"
          ? "这个句型表示什么？"
          : card.kind === "dialogue"
            ? "这句话是什么意思？"
            : "这个词是什么意思？",
      speak: card.example ?? card.front,
      answer: card.back,
      options: choices(card.back, strings(pool.map((c) => c.back)), random),
      explanation: card.note
        ? `「${card.front}」的意思是「${card.back}」。${card.note}`
        : `「${card.front}」的意思是「${card.back}」。`,
    });
    if (card.reading) {
      questions.push({
        id: `${card.id}-reading`,
        kind: "card-reading",
        prompt: card.front,
        hint: "这个读音（罗马音）是什么？",
        speak: card.front,
        answer: card.reading,
        options: choices(
          card.reading,
          strings(pool.map((c) => c.reading)),
          random,
        ),
        explanation: `「${card.front}」读作 ${card.reading}。`,
      });
    }
    if (card.example) {
      questions.push({
        id: `${card.id}-example`,
        kind: "card-choice",
        prompt: card.front,
        hint:
          card.kind === "grammar"
            ? "哪个例句正确体现了这个句型？"
            : "哪个例句正确使用了这个词？",
        speak: card.example,
        answer: card.example,
        options: choices(
          card.example,
          strings(pool.map((c) => c.example)),
          random,
        ),
        explanation: `「${card.example}」${card.exampleMeaning ? `（${card.exampleMeaning}）` : ""}。`,
      });
    }
  }
  return shuffle(questions, random);
}
export function resultFor(correct: number, total: number): QuizResult {
  const ratio = total ? correct / total : 0;
  return {
    correct,
    total,
    stars: ratio === 1 ? 3 : ratio >= 0.9 ? 2 : ratio >= 0.8 ? 1 : 0,
  };
}
