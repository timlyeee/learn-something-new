const SOUND_EFFECTS_STORAGE_KEY = "learnnew-sound-effects";

type AudioContextConstructor = new () => AudioContext;

interface WebkitAudioWindow extends Window {
  webkitAudioContext?: AudioContextConstructor;
}

let audioContext: AudioContext | null = null;

function contextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext
  );
}

function getAudioContext(): AudioContext | null {
  if (audioContext && audioContext.state !== "closed") return audioContext;
  const AudioContextClass = contextConstructor();
  if (!AudioContextClass) return null;
  try {
    audioContext = new AudioContextClass();
    return audioContext;
  } catch {
    return null;
  }
}

function scheduleCorrectChime(context: AudioContext): void {
  const startAt = context.currentTime + 0.01;
  const notes = [
    { frequency: 523.25, delay: 0, duration: 0.18, volume: 0.055 },
    { frequency: 659.25, delay: 0.07, duration: 0.2, volume: 0.05 },
    { frequency: 783.99, delay: 0.14, duration: 0.24, volume: 0.045 },
  ];

  notes.forEach(({ frequency, delay, duration, volume }) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = startAt + delay;
    const noteEnd = noteStart + duration;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteEnd + 0.02);
  });
}

function tryScheduleCorrectChime(context: AudioContext): void {
  try {
    scheduleCorrectChime(context);
  } catch {
    // Audio feedback must never interrupt scoring or navigation.
  }
}

export function readSoundEffectsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SOUND_EFFECTS_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function saveSoundEffectsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SOUND_EFFECTS_STORAGE_KEY,
      enabled ? "on" : "off",
    );
  } catch {
    // Storage can be unavailable in privacy modes; the current session still works.
  }
}

export function playCorrectSound(): void {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    void context
      .resume()
      .then(() => tryScheduleCorrectChime(context))
      .catch(() => undefined);
    return;
  }

  tryScheduleCorrectChime(context);
}
