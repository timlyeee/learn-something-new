import { useRef, useState } from "react";
import { X, SpeakerHigh, Trophy, Plant } from "@phosphor-icons/react";
import { useSoundEffects } from "../features/exercises/audio/useSoundEffects";
import SoundEffectsToggle from "../features/exercises/components/SoundEffectsToggle";
import { resultFor, type Question, type QuizResult } from "../lib/quiz";
import { speak } from "../lib/speech";

export default function QuizSession({
  title,
  subtitle,
  rebuild,
  finish,
  exit,
}: {
  title: string;
  subtitle: string;
  rebuild: () => Question[];
  finish: (result: QuizResult) => void;
  exit: () => void;
}) {
  const [questions, setQuestions] = useState(rebuild);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const [done, setDone] = useState(false);
  const [practice, setPractice] = useState(false);
  const { soundEffectsEnabled, toggleSoundEffects, playCorrect } =
    useSoundEffects();
  const recorded = useRef(false);
  const question = questions[index];
  const correct = selected === question?.answer;
  const result = resultFor(score, questions.length);

  function restart(onlyMistakes: boolean) {
    setQuestions(onlyMistakes ? mistakes : rebuild());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setMistakes([]);
    setDone(false);
    setPractice(onlyMistakes);
    recorded.current = false;
  }
  function next() {
    if (selected === null) return;
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      return;
    }
    if (!recorded.current && !practice) {
      recorded.current = true;
      finish(result);
    }
    setDone(true);
  }
  function answer(value: string): void {
    if (selected !== null) return;
    setSelected(value);
    if (value === question.answer) {
      setScore((currentScore) => currentScore + 1);
      playCorrect();
    } else {
      setMistakes((items) => [...items, question]);
    }
  }
  if (done)
    return (
      <section className="quiz-card result-card">
        <div className="result-icon">
          {result.stars ? (
            <Trophy size={48} weight="regular" />
          ) : (
            <Plant size={48} weight="regular" />
          )}
        </div>
        <span className="eyebrow">
          {practice ? "MISTAKE PRACTICE" : "LESSON COMPLETE"}
        </span>
        <h1>
          {practice
            ? "错题复习完成"
            : result.stars
              ? "又向前走了一小步！"
              : "慢慢来，再练一次。"}
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
          {practice
            ? "复习不会改变本关成绩，再挑战一次来点亮星星。"
            : result.stars
              ? "成绩已保存，下一关已解锁。"
              : "达到 80% 正确率就能解锁下一关，没有次数限制。"}
        </p>
        {mistakes.length > 0 && (
          <div className="mistake-list">
            <h3>把这些再记一记</h3>
            {mistakes.map((q) => (
              <div key={q.id}>
                <strong>{q.prompt}</strong>
                <span>{q.explanation}</span>
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
    <section className="quiz-card">
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
      <span className="eyebrow">
        {practice ? "错题巩固" : title} · {subtitle}
      </span>
      <h2 className="question-title">{question.hint}</h2>
      <div className="question-prompt" lang="ja">
        {question.prompt}
      </div>
      <button className="sound-button" onClick={() => speak(question.speak)}>
        <SpeakerHigh size={16} weight="regular" /> 听一听
      </button>
      <div className="answer-grid">
        {question.options.map((option, optionIndex) => (
          <button
            key={option}
            disabled={selected !== null}
            className={`answer-option ${selected !== null && option === question.answer ? "is-correct" : selected === option ? "is-wrong" : ""}`}
            onClick={() => answer(option)}
          >
            <span className="option-number">{optionIndex + 1}</span>
            {option}
          </button>
        ))}
      </div>
      <div
        className={`answer-feedback ${selected !== null ? (correct ? "good" : "retry") : ""}`}
        role="status"
      >
        {selected !== null ? (
          <>
            <strong>
              {correct ? "✓ 答对了！" : `再记一次：${question.answer}`}
            </strong>
            <p>{question.explanation}</p>
          </>
        ) : (
          <p>选出你的答案，再继续下一题。</p>
        )}
        <button className="primary" disabled={selected === null} onClick={next}>
          {index + 1 === questions.length ? "查看成绩" : "继续 →"}
        </button>
      </div>
    </section>
  );
}
