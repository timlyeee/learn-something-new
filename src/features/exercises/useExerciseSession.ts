import { useReducer, useState } from "react";
import type { QuizResult } from "../../lib/quiz";
import { useSoundEffects } from "./audio/useSoundEffects";
import { ExerciseSession, type ExerciseAnswer } from "./domain/ExerciseSession";

export function useExerciseSession<TQuestion, TResponse>(
  rebuild: () => TQuestion[],
  finish: (result: QuizResult) => void,
) {
  const [session] = useState(
    () => new ExerciseSession<TQuestion, TResponse>(rebuild()),
  );
  const [, refresh] = useReducer((version: number) => version + 1, 0);
  const { playCorrect, ...soundEffects } = useSoundEffects();

  function answer(submission: ExerciseAnswer<TResponse>): void {
    if (!session.answer(submission)) return;
    refresh();
    if (submission.correct) playCorrect();
  }

  function next(): void {
    const result = session.next();
    refresh();
    if (result) finish(result);
  }

  function restart(onlyMistakes: boolean): void {
    if (onlyMistakes) session.reviewMistakes();
    else session.restart(rebuild());
    refresh();
  }

  const { answer: submission, ...snapshot } = session.snapshot;
  return { ...snapshot, ...soundEffects, submission, answer, next, restart };
}
