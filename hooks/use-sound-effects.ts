"use client";

import { useCallback, useRef } from "react";

type SoundName =
  | "click"
  | "submit"
  | "correct"
  | "wrong"
  | "reveal"
  | "countdown"
  | "countdownFinal"
  | "gameStart"
  | "roundStart"
  | "vote"
  | "score"
  | "winner"
  | "tick"
  | "whoosh"
  | "pop";

export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (sound: SoundName) => {
      if (mutedRef.current) return;
      try {
        const ctx = getCtx();
        const now = ctx.currentTime;

        switch (sound) {
          case "click": {
            // Short crisp click
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
            // Ascending two-tone confirmation
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
            // Triumphant ascending chord
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
            // Descending buzz
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
            // Dramatic rising sweep
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

          case "countdown": {
            // Soft tick
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
          }

          case "countdownFinal": {
            // Louder final countdown beep
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = "square";
            osc.frequency.setValueAtTime(1046, now);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;
          }

          case "gameStart": {
            // Fanfare-style ascending
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
            // Two quick ascending tones
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
            // Soft lock-in sound
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
            // Coins / points accumulating
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
            // Big victory fanfare
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

          case "tick": {
            // Ultra-short tick
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(1000, now);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            osc.start(now);
            osc.stop(now + 0.03);
            break;
          }

          case "whoosh": {
            // Quick frequency sweep
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
            // Bubbly pop
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
        // Web Audio not supported, fail silently
      }
    },
    [getCtx]
  );

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
  }, []);

  return { play, setMuted, isMuted: () => mutedRef.current };
}
