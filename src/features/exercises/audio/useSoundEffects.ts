import { useCallback, useState } from "react";
import {
  playCorrectSound,
  readSoundEffectsEnabled,
  saveSoundEffectsEnabled,
} from "./soundEffects";

export function useSoundEffects() {
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(
    readSoundEffectsEnabled,
  );

  const toggleSoundEffects = useCallback(() => {
    setSoundEffectsEnabled((enabled) => {
      const next = !enabled;
      saveSoundEffectsEnabled(next);
      return next;
    });
  }, []);

  const playCorrect = useCallback(() => {
    if (soundEffectsEnabled) playCorrectSound();
  }, [soundEffectsEnabled]);

  return {
    soundEffectsEnabled,
    toggleSoundEffects,
    playCorrect,
  };
}
