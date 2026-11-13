import { Plant, SpeakerHigh, Trophy, X } from "@phosphor-icons/react";
import { useExerciseSession } from "../../exercises/useExerciseSession";
import SoundEffectsToggle from "../../exercises/components/SoundEffectsToggle";
import type { QuizResult } from "../../../lib/quiz";
import { speak } from "../../../lib/speech";
import type { KanaExerciseSet, KanaQuestion } from "../domain/types";
import KanaChoiceQuestion from "./KanaChoiceQuestion";
import KanaMatchingQuestion from "./KanaMatchingQuestion";
import KanaWritingQuestion from "./KanaWritingQuestion";

interface SessionQuestion {
  question: KanaQuestion;
  sectionTitle: string;
  sectionDescription: string;
}

function flatten(exerciseSet: KanaExerciseSet): SessionQuestion[] {
  return exerciseSet.sections.flatMap((section) =>
    section.questions.map((question) => ({
      question,
      sectionTitle: section.title,
      sectionDescription: section.description,
    })),
  );
}

function promptFor(question: KanaQuestion): string {
  if (question.kind === "kana-writing") return question.reading;
  if (question.kind === "kana-matching") return "假名与读音配对";
  return question.prompt;
}

export default function KanaQuizSession({
  title,
  subtitle,
  rebuild,
  finish,
  exit,
}: {
  title: string;
  subtitle: string;
  rebuild: () => KanaExerciseSet;
  finish: (result: QuizResult) => void;
  exit: () => void;
}) {
  const {
    questions,
    index,
    current,
    submission,
    score,
    mistakes,
    done,
    practice,
    result,
    soundEffectsEnabled,
    toggleSoundEffects,
    answer: submitAnswer,
    next,
    restart,
  } = useExerciseSession<SessionQuestion, string | null>(
    () => flatten(rebuild()),
    finish,
  );
  const question = current.question;
  const selected = submission?.response ?? null;
  const answered = submission !== null;
  const correct = submission?.correct ?? false;
  const sectionTitle = practice ? "错题巩固" : current.sectionTitle;
  const sectionDescription = practice
    ? "只复习刚才没有掌握的题目"
    : current.sectionDescription;
  const sectionTitles = practice
    ? ["错题巩固"]
    : [...new Set(questions.map((item) => item.sectionTitle))];
  const activeSection = sectionTitles.indexOf(sectionTitle);

  function answer(value: string): void {
    submitAnswer({ correct: value === question.answer, response: value });
  }

  function answerSelfCheck(isCorrect: boolean): void {
    submitAnswer({ correct: isCorrect, response: null });
  }

  if (done)
    return (
      <section className="quiz-card result-card kana-result-card">
        <div className="result-icon">
          {result.stars ? (
            <Trophy size={48} weight="regular" />
          ) : (
            <Plant size={48} weight="regular" />
          )}
        </div>
        <span className="eyebrow">
          {practice ? "MISTAKE PRACTICE" : "KANA PRACTICE COMPLETE"}
        </span>
        <h1>
          {practice
            ? "错题复习完成"
            : result.stars
              ? "五个部分都完成了！"
              : "已经走完整轮，再巩固一次。"}
        </h1>
        <div className="stars" aria-label={`${result.stars}颗星`}>
          {"★".repeat(result.stars)}
          {"☆".repeat(3 - result.stars)}
        </div>
        <p>
          答对{" "}
          <strong>
            {score} / {questions.length}
          </strong>{" "}
          题 · 正确率 {Math.round((score / questions.length) * 100)}%
        </p>
        <p className="muted">
          手写题为对照自评；配对题中途连错会记为本题需要再练。
        </p>
        {mistakes.length > 0 && (
          <div className="mistake-list">
            <h3>把这些再记一记</h3>
            {mistakes.map(({ question: item }) => (
              <div key={item.id}>
                <strong>{promptFor(item)}</strong>
                <span>{item.explanation}</span>
              </div>
            ))}
          </div>
        )}
        <div className="actions">
          {mistakes.length > 0 && (
            <button className="secondary" onClick={() => restart(true)}>
              练习错题
            </button>
          )}
          <button className="secondary" onClick={() => restart(false)}>
            再挑战一次
          </button>
          <button className="primary" onClick={exit}>
            返回闯关地图 →
          </button>
        </div>
      </section>
    );

  return (
    <section className="quiz-card kana-quiz-card">
      <div className="quiz-top">
        <button
          className="link"
          onClick={() => {
            if (confirm("退出会放弃本轮未完成的答题，已完成的关卡不受影响。"))
              exit();
          }}
          aria-label="退出本轮练习"
        >
          <X size={20} weight="regular" />
        </button>
        <div className="progress">
          <span style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
        <span>
          {index + 1} / {questions.length}
        </span>
        <SoundEffectsToggle
          enabled={soundEffectsEnabled}
          onToggle={toggleSoundEffects}
        />
      </div>

      <div className="kana-section-steps" aria-label="练习部分">
        {sectionTitles.map((sectionTitle, sectionIndex) => (
          <span
            key={sectionTitle}
            className={
              sectionIndex < activeSection
                ? "is-complete"
                : sectionIndex === activeSection
                  ? "is-current"
                  : ""
            }
            aria-current={sectionIndex === activeSection ? "step" : undefined}
          >
            <i>{sectionIndex + 1}</i>
            {sectionTitle}
          </span>
        ))}
      </div>

      <span className="eyebrow">
        {practice ? "错题巩固" : title} · {subtitle}
      </span>
      <div className="kana-section-heading">
        <span>
          第 {activeSection + 1} / {sectionTitles.length} 部分
        </span>
        <h2>{sectionTitle}</h2>
        <p>{sectionDescription}</p>
      </div>
      <h3 className="question-title">{question.hint}</h3>
      <button className="sound-button" onClick={() => speak(question.speak)}>
        <SpeakerHigh size={16} weight="regular" /> 听一听
      </button>

      {question.kind === "kana-writing" ? (
        <KanaWritingQuestion
          key={question.id}
          question={question}
          disabled={answered}
          onAnswer={answerSelfCheck}
        />
      ) : question.kind === "kana-matching" ? (
        <KanaMatchingQuestion
          key={question.id}
          question={question}
          disabled={answered}
          onAnswer={answerSelfCheck}
        />
      ) : (
        <KanaChoiceQuestion
          question={question}
          selected={selected}
          onSelect={answer}
        />
      )}

      <div
        className={`answer-feedback ${answered ? (correct ? "good" : "retry") : ""}`}
        role="status"
      >
        {answered ? (
          <>
            <strong>
              {correct ? "✓ 完成了！" : `再记一次：${question.answer}`}
            </strong>
            <p>{question.explanation}</p>
            {question.revealText && (
              <p className="kana-word-reveal">{question.revealText}</p>
            )}
          </>
        ) : (
          <p>
            {question.kind === "kana-writing"
              ? "先在方格中书写，再对照答案完成自评。"
              : question.kind === "kana-matching"
                ? "完成全部配对后即可继续。"
                : "选出你的答案，再继续下一题。"}
          </p>
        )}
        <button className="primary" disabled={!answered} onClick={next}>
          {index + 1 === questions.length ? "查看成绩" : "继续 →"}
        </button>
      </div>
    </section>
  );
}
