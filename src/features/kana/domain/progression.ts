import type { QuizResult } from "../../../lib/quiz";
import type { Level } from "../data/kana";

export function isKanaLevelUnlocked(
  index: number,
  levels: Level[],
  results: Record<string, QuizResult>,
): boolean {
  return index === 0 || (results[levels[index - 1].id]?.stars ?? 0) > 0;
}
