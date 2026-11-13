import { resultFor, type QuizResult } from "../../../lib/quiz";

export interface ExerciseAnswer<TResponse> {
  correct: boolean;
  response: TResponse;
}

export interface ExerciseSessionSnapshot<TQuestion, TResponse> {
  questions: readonly TQuestion[];
  index: number;
  current: TQuestion;
  answer: ExerciseAnswer<TResponse> | null;
  score: number;
  mistakes: readonly TQuestion[];
  done: boolean;
  practice: boolean;
  result: QuizResult;
}

export class ExerciseSession<TQuestion, TResponse> {
  private state: ExerciseSessionSnapshot<TQuestion, TResponse>;

  constructor(questions: readonly TQuestion[]) {
    this.state = this.start(questions, false);
  }

  get snapshot(): ExerciseSessionSnapshot<TQuestion, TResponse> {
    return this.state;
  }

  answer(answer: ExerciseAnswer<TResponse>): boolean {
    if (this.state.done || this.state.answer !== null) return false;
    const { score, mistakes, current, questions } = this.state;
    const nextScore = score + (answer.correct ? 1 : 0);
    this.state = {
      ...this.state,
      answer: { ...answer },
      score: nextScore,
      mistakes: answer.correct ? mistakes : [...mistakes, current],
      result: resultFor(nextScore, questions.length),
    };
    return true;
  }

  next(): QuizResult | null {
    if (this.state.done || this.state.answer === null) return null;
    const nextIndex = this.state.index + 1;
    if (nextIndex < this.state.questions.length) {
      this.state = {
        ...this.state,
        index: nextIndex,
        current: this.state.questions[nextIndex],
        answer: null,
      };
      return null;
    }
    this.state = { ...this.state, done: true };
    return this.state.practice ? null : this.state.result;
  }

  restart(questions: readonly TQuestion[]): void {
    this.state = this.start(questions, false);
  }

  reviewMistakes(): void {
    if (!this.state.done || this.state.mistakes.length === 0) return;
    this.state = this.start(this.state.mistakes, true);
  }

  private start(
    questions: readonly TQuestion[],
    practice: boolean,
  ): ExerciseSessionSnapshot<TQuestion, TResponse> {
    if (questions.length === 0) throw new Error("答题会话至少需要一道题目");
    const items = [...questions];
    return {
      questions: items,
      index: 0,
      current: items[0],
      answer: null,
      score: 0,
      mistakes: [],
      done: false,
      practice,
      result: resultFor(0, items.length),
    };
  }
}
