import type { KanaChoiceQuestion as KanaChoiceQuestionData } from "../domain/types";

export default function KanaChoiceQuestion({
  question,
  selected,
  onSelect,
}: {
  question: KanaChoiceQuestionData;
  selected: string | null;
  onSelect: (answer: string) => void;
}) {
  return (
    <>
      <div
        className={`kana-question-prompt is-${question.promptStyle}`}
        lang={question.promptStyle === "reading" ? undefined : "ja"}
      >
        {question.prompt}
      </div>
      <div className="answer-grid kana-choice-grid">
        {question.options.map((option, optionIndex) => (
          <button
            key={option}
            type="button"
            disabled={selected !== null}
            className={`answer-option ${selected !== null && option === question.answer ? "is-correct" : selected === option ? "is-wrong" : ""}`}
            onClick={() => onSelect(option)}
          >
            <span className="option-number">{optionIndex + 1}</span>
            {option}
          </button>
        ))}
      </div>
    </>
  );
}
