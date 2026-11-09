import type { Script } from "../data/kana";

export type KanaExerciseSectionId =
  | "sound-to-kana"
  | "kana-to-sound"
  | "kana-writing"
  | "kana-matching"
  | "word-practice"
  | "word-reading-to-kana"
  | "word-kana-to-reading";

interface KanaQuestionBase {
  id: string;
  sectionId: KanaExerciseSectionId;
  hint: string;
  speak: string;
  answer: string;
  explanation: string;
  revealText?: string;
}

export interface KanaChoiceQuestion extends KanaQuestionBase {
  kind:
    | "sound-to-kana"
    | "kana-to-sound"
    | "word-reading-to-kana"
    | "word-kana-to-reading";
  prompt: string;
  options: string[];
  promptStyle: "kana" | "reading" | "word";
}

export interface KanaWritingQuestion extends KanaQuestionBase {
  kind: "kana-writing";
  reading: string;
  glyph: string;
}

export interface KanaMatchPair {
  id: string;
  glyph: string;
  reading: string;
}

export interface KanaMatchingQuestion extends KanaQuestionBase {
  kind: "kana-matching";
  pairs: KanaMatchPair[];
}

export type KanaQuestion =
  KanaChoiceQuestion | KanaWritingQuestion | KanaMatchingQuestion;

export interface KanaExerciseSection {
  id: KanaExerciseSectionId;
  title: string;
  description: string;
  questions: KanaQuestion[];
}

export interface KanaExerciseSet {
  levelId: string;
  script: Script;
  sections: KanaExerciseSection[];
  totalQuestions: number;
}
