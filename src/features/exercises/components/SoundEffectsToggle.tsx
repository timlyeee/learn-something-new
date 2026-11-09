import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

export default function SoundEffectsToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  const label = enabled ? "关闭答对音效" : "开启答对音效";

  return (
    <button
      type="button"
      className="quiz-sound-toggle"
      aria-label={label}
      aria-pressed={enabled}
      title={label}
      onClick={onToggle}
    >
      {enabled ? (
        <SpeakerHigh size={19} weight="regular" aria-hidden="true" />
      ) : (
        <SpeakerSlash size={19} weight="regular" aria-hidden="true" />
      )}
    </button>
  );
}
