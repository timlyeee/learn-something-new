import { useMemo, useState } from "react";
import type { KanaMatchingQuestion as KanaMatchingQuestionData } from "../domain/types";

export default function KanaMatchingQuestion({
  question,
  disabled,
  onAnswer,
}: {
  question: KanaMatchingQuestionData;
  disabled: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  const readings = useMemo(() => [...question.pairs].reverse(), [question]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(() => new Set());
  const [hadMistake, setHadMistake] = useState(false);
  const [status, setStatus] = useState("先选择左侧假名，再选择右侧读音。");
  const linePosition = (index: number) =>
    ((index + 0.5) / question.pairs.length) * 100;

  function selectReading(pairId: string): void {
    if (disabled || matchedIds.has(pairId)) return;
    if (!selectedId) {
      setStatus("请先选择左侧的一个假名。");
      return;
    }
    if (selectedId !== pairId) {
      setHadMistake(true);
      setSelectedId(null);
      setStatus("还没有连对，再试一次。");
      return;
    }
    const next = new Set(matchedIds);
    next.add(pairId);
    setMatchedIds(next);
    setSelectedId(null);
    if (next.size === question.pairs.length) {
      setStatus("全部配对完成。");
      onAnswer(!hadMistake);
    } else {
      setStatus(`已完成 ${next.size} / ${question.pairs.length} 组。`);
    }
  }

  return (
    <div className="kana-matching-question">
      <div className="kana-match-columns">
        <div className="kana-match-column" aria-label="假名">
          {question.pairs.map((pair) => (
            <button
              type="button"
              key={pair.id}
              disabled={disabled || matchedIds.has(pair.id)}
              className={selectedId === pair.id ? "is-selected" : ""}
              aria-pressed={selectedId === pair.id}
              onClick={() => {
                setSelectedId(pair.id);
                setStatus(`已选择 ${pair.glyph}，请选择对应读音。`);
              }}
            >
              {pair.glyph}
            </button>
          ))}
        </div>
        <div className="kana-match-lines" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            {question.pairs.map((pair, leftIndex) => {
              const rightIndex = readings.findIndex(
                (reading) => reading.id === pair.id,
              );
              return (
                <line
                  key={pair.id}
                  className={matchedIds.has(pair.id) ? "is-matched" : ""}
                  x1="0"
                  y1={linePosition(leftIndex)}
                  x2="100"
                  y2={linePosition(rightIndex)}
                />
              );
            })}
          </svg>
        </div>
        <div className="kana-match-column" aria-label="读音">
          {readings.map((pair) => (
            <button
              type="button"
              key={pair.id}
              disabled={disabled || matchedIds.has(pair.id)}
              className={matchedIds.has(pair.id) ? "is-matched" : ""}
              onClick={() => selectReading(pair.id)}
            >
              {pair.reading}
            </button>
          ))}
        </div>
      </div>
      <p className="kana-match-status" role="status">
        {status}
      </p>
    </div>
  );
}
