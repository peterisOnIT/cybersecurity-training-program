"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SoundName =
  | "click"
  | "submit"
  | "correct"
  | "wrong"
  | "reveal"
  | "gameStart"
  | "roundStart"
  | "vote"
  | "score"
  | "winner"
  | "whoosh"
  | "pop";

export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMutedState] = useState(false);
  const mutedRef = useRef(false);
  const readyRef = useRef(false);

  // Create and warm up the AudioContext on first user gesture
  const ensureReady = useCallback(() => {
    if (readyRef.current && ctxRef.current?.state === "running") return true;

    if (!ctxRef.current) {
      try {
        ctxRef.current = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )();
      } catch {
        return false;
      }
    }

    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().then(() => {
        readyRef.current = true;
      });
      return false; // Not ready yet this frame, but will be next call
    }

    readyRef.current = true;
    return true;
  }, []);

  // Warm up the AudioContext on any user interaction with the page
  useEffect(() => {
    const warmUp = () => {
      ensureReady();
      // Remove after first interaction
      if (readyRef.current) {
        document.removeEventListener("click", warmUp);
        document.removeEventListener("touchstart", warmUp);
        document.removeEventListener("keydown", warmUp);
      }
    };

    document.addEventListener("click", warmUp, { passive: true });
    document.addEventListener("touchstart", warmUp, { passive: true });
    document.addEventListener("keydown", warmUp, { passive: true });

    return () => {
      document.removeEventListener("click", warmUp);
      document.removeEventListener("touchstart", warmUp);
      document.removeEventListener("keydown", warmUp);
    };
  }, [ensureReady]);

  const play = useCallback(
    (sound: SoundName) => {
      if (mutedRef.current) return;

      // Try to ensure audio is ready
      ensureReady();

      const ctx = ctxRef.current;
      if (!ctx || ctx.state !== "running") return;

      try {
        const now = ctx.currentTime;

        switch (sound) {
          case "click": {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
            break;
          }

          case "submit": {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            const gain2 = ctx.createGain();
            osc1.connect(gain1).connect(ctx.destination);
            osc2.connect(gain2).connect(ctx.destination);
            osc1.type = "sine";
            osc2.type = "sine";
            osc1.frequency.setValueAtTime(523, now);
            osc2.frequency.setValueAtTime(659, now + 0.1);
            gain1.gain.setValueAtTime(0.12, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            gain2.gain.setValueAtTime(0.001, now);
            gain2.gain.setValueAtTime(0.12, now + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc1.start(now);
            osc1.stop(now + 0.15);
            osc2.start(now + 0.1);
            osc2.stop(now + 0.25);
            break;
          }

          case "correct": {
            [523, 659, 784].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain).connect(ctx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, now + i * 0.08);
              gain.gain.setValueAtTime(0.001, now);
              gain.gain.setValueAtTime(0.1, now + i * 0.08);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
              osc.start(now + i * 0.08);
              osc.stop(now + 0.5);
            });
            break;
          }

          case "wrong": {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
          }

          case "reveal": {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.4);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.setValueAtTime(0.12, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
            break;
          }



          case "gameStart": {
            [392, 523, 659, 784].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain).connect(ctx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, now + i * 0.12);
              gain.gain.setValueAtTime(0.001, now);
              gain.gain.setValueAtTime(0.12, now + i * 0.12);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
              osc.start(now + i * 0.12);
              osc.stop(now + 0.8);
            });
            break;
          }

          case "roundStart": {
            [440, 660].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain).connect(ctx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, now + i * 0.1);
              gain.gain.setValueAtTime(0.001, now);
              gain.gain.setValueAtTime(0.1, now + i * 0.1);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
              osc.start(now + i * 0.1);
              osc.stop(now + 0.3);
            });
            break;
          }

          case "vote": {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = "triangle";
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(800, now + 0.05);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;
          }

          case "score": {
            for (let i = 0; i < 4; i++) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain).connect(ctx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(1200 + i * 200, now + i * 0.06);
              gain.gain.setValueAtTime(0.001, now);
              gain.gain.setValueAtTime(0.08, now + i * 0.06);
              gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.1);
              osc.start(now + i * 0.06);
              osc.stop(now + i * 0.06 + 0.1);
            }
            break;
          }

          case "winner": {
            const notes = [523, 659, 784, 1046];
            notes.forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain).connect(ctx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, now + i * 0.15);
              gain.gain.setValueAtTime(0.001, now);
              gain.gain.setValueAtTime(0.15, now + i * 0.15);
              gain.gain.exponentialRampToValueAtTime(0.02, now + 1.2);
              osc.start(now + i * 0.15);
              osc.stop(now + 1.2);
            });
            break;
          }



          case "whoosh": {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            break;
          }

          case "pop": {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
          }
        }
      } catch {
        // Web Audio not supported or context error, fail silently
      }
    },
    [ensureReady]
  );

  const setMuted = useCallback((val: boolean) => {
    mutedRef.current = val;
    setMutedState(val);
  }, []);

  return { play, setMuted, muted };
}
