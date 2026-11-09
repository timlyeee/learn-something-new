import { useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Eraser, Eye } from "@phosphor-icons/react";
import type { KanaWritingQuestion as KanaWritingQuestionData } from "../domain/types";

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 8;
  context.strokeStyle = getComputedStyle(canvas).color;
}

export default function KanaWritingQuestion({
  question,
  disabled,
  onAnswer,
}: {
  question: KanaWritingQuestionData;
  disabled: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const [hasInk, setHasInk] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [guideReplay, setGuideReplay] = useState(0);

  function clear(): void {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
    }
    setHasInk(false);
    setReviewing(false);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resizeCanvas(canvas);
    const onResize = () => {
      resizeCanvas(canvas);
      setHasInk(false);
      setReviewing(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [question.id]);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>): void {
    if (disabled || reviewing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    lastPoint.current = point(event);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>): void {
    if (!drawing.current || disabled || reviewing) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const nextPoint = point(event);
    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(nextPoint.x, nextPoint.y);
    context.stroke();
    lastPoint.current = nextPoint;
    setHasInk(true);
  }

  function stop(event: React.PointerEvent<HTMLCanvasElement>): void {
    drawing.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className="kana-writing-question">
      <div className="kana-writing-reading">
        <span>请写出</span>
        <strong>{question.reading}</strong>
      </div>
      {showGuide && (
        <div
          className="kana-stroke-guide"
          aria-label={`书写提示：${question.glyph}`}
        >
          <svg key={guideReplay} viewBox="0 0 180 180" role="img">
            <text x="90" y="132" textAnchor="middle">
              {question.glyph}
            </text>
          </svg>
          <span>动画轮廓提示</span>
        </div>
      )}
      <div className="kana-writing-pad">
        <canvas
          ref={canvasRef}
          aria-label={`书写 ${question.reading} 对应的假名`}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
        />
      </div>
      <div className="kana-writing-controls">
        <button
          type="button"
          className="secondary"
          onClick={clear}
          disabled={disabled}
        >
          <Eraser size={18} weight="regular" aria-hidden="true" /> 清空
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setShowGuide(true);
            setGuideReplay((value) => value + 1);
          }}
          disabled={disabled}
        >
          <ArrowCounterClockwise
            size={18}
            weight="regular"
            aria-hidden="true"
          />
          重播提示
        </button>
        {!reviewing && (
          <button
            type="button"
            className="primary"
            disabled={!hasInk || disabled}
            onClick={() => {
              setReviewing(true);
              setShowGuide(true);
            }}
          >
            <Eye size={18} weight="regular" aria-hidden="true" /> 对照答案
          </button>
        )}
      </div>
      {reviewing && !disabled && (
        <div className="kana-writing-review" role="group" aria-label="手写自评">
          <p>
            对照 <strong>{question.glyph}</strong>
            ，你的字形和主要笔画方向一致吗？
          </p>
          <button
            type="button"
            className="secondary"
            onClick={() => onAnswer(false)}
          >
            需要再练
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => onAnswer(true)}
          >
            我写对了
          </button>
        </div>
      )}
    </div>
  );
}
