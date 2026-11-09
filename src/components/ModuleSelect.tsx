import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { modules } from "../data/modules";
import type { ModuleId } from "../types";

export default function ModuleSelect({
  onSelect,
}: {
  onSelect: (id: ModuleId) => void;
}) {
  return (
    <div className="module-select">
      <div className="module-select-head">
        <div className="brand">
          <Sparkle size={26} weight="regular" aria-hidden="true" />
          学点新的？
        </div>
        <div className="tagline">Learn sth new?</div>
      </div>
      <div className="module-hero">
        <span className="eyebrow">Learn sth new?</span>
        <h1>今天，想学点什么？</h1>
        <p>挑一个模块开始，其他主题会慢慢长出来。</p>
      </div>
      <div className="module-grid">
        {modules.map((m) => (
          <button
            key={m.id}
            className="module-card"
            onClick={() => onSelect(m.id)}
          >
            <span className="module-symbol" aria-hidden="true">
              {m.symbol}
            </span>
            <div className="module-meta">
              <strong>{m.name}</strong>
              <span>{m.description}</span>
            </div>
            <ArrowRight size={20} weight="regular" />
          </button>
        ))}
      </div>
      <p className="module-foot">每天一点，学点新的。</p>
    </div>
  );
}
