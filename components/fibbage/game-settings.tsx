"use client";

import { useState, useCallback } from "react";
import {
  Settings,
  Clock,
  Plus,
  Trash2,
  Zap,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { GameSettings, FibbageQuestion } from "@/lib/fibbage-room";
import { DEFAULT_SETTINGS, QUESTION_BANK_SIZE } from "@/lib/fibbage-room";

interface GameSettingsProps {
  settings: GameSettings;
  sendAction: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
}

const CATEGORIES: FibbageQuestion["category"][] = [
  "history",
  "attacks",
  "defense",
  "concepts",
  "people",
  "acronyms",
];

export function GameSettingsPanel({ settings, sendAction }: GameSettingsProps) {
  const [open, setOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(
    settings.customQuestions !== null && settings.customQuestions.length > 0
  );
  const [customQuestions, setCustomQuestions] = useState<FibbageQuestion[]>(
    settings.customQuestions || [
      { prompt: "", truth: "", category: "concepts" },
    ]
  );
  const [writingTime, setWritingTime] = useState(settings.writingTime);
  const [votingTime, setVotingTime] = useState(settings.votingTime);
  const [totalRounds, setTotalRounds] = useState(settings.totalRounds);
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (overrides: Partial<GameSettings> = {}) => {
      setSaving(true);
      const payload: Partial<GameSettings> = {
        writingTime,
        votingTime,
        totalRounds,
        customQuestions: isCustom ? customQuestions : null,
        ...overrides,
      };
      await sendAction("update_settings", { settings: payload });
      setSaving(false);
    },
    [writingTime, votingTime, totalRounds, isCustom, customQuestions, sendAction]
  );

  const toggleMode = () => {
    const next = !isCustom;
    setIsCustom(next);
    if (!next) {
      // Switching to quick play -- clear custom questions
      save({ customQuestions: null });
    } else {
      // Switching to custom -- initialize one empty question if needed
      if (customQuestions.length === 0) {
        setCustomQuestions([{ prompt: "", truth: "", category: "concepts" }]);
      }
    }
  };

  const addQuestion = () => {
    if (customQuestions.length >= 25) return;
    setCustomQuestions([
      ...customQuestions,
      { prompt: "", truth: "", category: "concepts" },
    ]);
  };

  const removeQuestion = (idx: number) => {
    const next = customQuestions.filter((_, i) => i !== idx);
    if (next.length === 0) next.push({ prompt: "", truth: "", category: "concepts" });
    setCustomQuestions(next);
  };

  const updateQuestion = (idx: number, field: keyof FibbageQuestion, value: string) => {
    setCustomQuestions((prev) =>
      prev.map((q, i) =>
        i === idx ? { ...q, [field]: value } : q
      )
    );
  };

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border-[2px] animate-fade-in"
      style={{
        borderColor: "rgba(255,184,0,0.25)",
        background: "var(--cc-card)",
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors"
        style={{ background: "rgba(255,184,0,0.04)" }}
      >
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" style={{ color: "#FFB800" }} />
          <span
            className="text-xs font-black uppercase tracking-widest"
            style={{ color: "#FFB800" }}
          >
            Game Settings
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4" style={{ color: "rgba(255,255,255,0.3)" }} />
        ) : (
          <ChevronDown className="h-4 w-4" style={{ color: "rgba(255,255,255,0.3)" }} />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-4 p-4">
          {/* Game Mode Toggle */}
          <div className="flex flex-col gap-2">
            <p
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Game Mode
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { if (isCustom) toggleMode(); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-[2px] px-3 py-2.5 text-sm font-bold transition-all"
                style={{
                  borderColor: !isCustom ? "#00E5FF" : "rgba(255,255,255,0.08)",
                  background: !isCustom
                    ? "rgba(0,229,255,0.08)"
                    : "rgba(255,255,255,0.02)",
                  color: !isCustom ? "#00E5FF" : "rgba(255,255,255,0.4)",
                }}
              >
                <Zap className="h-4 w-4" />
                Quick Play
              </button>
              <button
                onClick={() => { if (!isCustom) toggleMode(); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-[2px] px-3 py-2.5 text-sm font-bold transition-all"
                style={{
                  borderColor: isCustom ? "#FFB800" : "rgba(255,255,255,0.08)",
                  background: isCustom
                    ? "rgba(255,184,0,0.08)"
                    : "rgba(255,255,255,0.02)",
                  color: isCustom ? "#FFB800" : "rgba(255,255,255,0.4)",
                }}
              >
                <Pencil className="h-4 w-4" />
                Custom
              </button>
            </div>
          </div>

          {/* Timer Settings */}
          <div className="flex flex-col gap-3">
            <p
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Timers
            </p>
            <div className="flex flex-col gap-2">
              <TimerSlider
                label="Writing Time"
                value={writingTime}
                min={15}
                max={120}
                step={5}
                suffix="s"
                color="#00E5FF"
                onChange={(v) => { setWritingTime(v); }}
                onCommit={(v) => save({ writingTime: v })}
              />
              <TimerSlider
                label="Voting Time"
                value={votingTime}
                min={10}
                max={60}
                step={5}
                suffix="s"
                color="#FF2D78"
                onChange={(v) => { setVotingTime(v); }}
                onCommit={(v) => save({ votingTime: v })}
              />
            </div>
          </div>

          {/* Rounds / Custom Questions */}
          {!isCustom ? (
            <div className="flex flex-col gap-3">
              <p
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Rounds
              </p>
              <TimerSlider
                label="Number of Rounds"
                value={totalRounds}
                min={1}
                max={QUESTION_BANK_SIZE}
                step={1}
                suffix=""
                color="#39FF14"
                onChange={(v) => { setTotalRounds(v); }}
                onCommit={(v) => save({ totalRounds: v })}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Custom Questions ({customQuestions.length})
                </p>
                <button
                  onClick={addQuestion}
                  disabled={customQuestions.length >= 25}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-all disabled:opacity-30"
                  style={{
                    background: "rgba(57,255,20,0.08)",
                    color: "#39FF14",
                    border: "1px solid rgba(57,255,20,0.2)",
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>

              <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
                {customQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 rounded-xl border-[1px] p-3"
                    style={{
                      borderColor: "rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        Q{idx + 1}
                      </span>
                      <button
                        onClick={() => removeQuestion(idx)}
                        className="rounded-md p-1 transition-colors"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                        aria-label={`Remove question ${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Question prompt (use ___ for the blank)"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(idx, "prompt", e.target.value)}
                      className="w-full rounded-lg border-[1px] px-3 py-2 text-sm outline-none placeholder:opacity-30"
                      style={{
                        borderColor: "rgba(255,255,255,0.08)",
                        background: "rgba(0,0,0,0.3)",
                        color: "rgba(255,255,255,0.85)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Correct answer"
                      value={q.truth}
                      onChange={(e) => updateQuestion(idx, "truth", e.target.value)}
                      className="w-full rounded-lg border-[1px] px-3 py-2 text-sm outline-none placeholder:opacity-30"
                      style={{
                        borderColor: "rgba(255,255,255,0.08)",
                        background: "rgba(0,0,0,0.3)",
                        color: "#39FF14",
                      }}
                    />
                    <div className="flex gap-2">
                      <select
                        value={q.category}
                        onChange={(e) =>
                          updateQuestion(idx, "category", e.target.value)
                        }
                        className="flex-1 rounded-lg border-[1px] px-2 py-1.5 text-xs outline-none"
                        style={{
                          borderColor: "rgba(255,255,255,0.08)",
                          background: "rgba(0,0,0,0.3)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Fun fact (optional)"
                        value={q.funFact || ""}
                        onChange={(e) =>
                          updateQuestion(idx, "funFact", e.target.value)
                        }
                        className="flex-[2] rounded-lg border-[1px] px-2 py-1.5 text-xs outline-none placeholder:opacity-30"
                        style={{
                          borderColor: "rgba(255,255,255,0.08)",
                          background: "rgba(0,0,0,0.3)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Save custom questions */}
              <button
                onClick={() => save()}
                disabled={saving || customQuestions.every((q) => !q.prompt.trim() || !q.truth.trim())}
                className="flex items-center justify-center gap-2 rounded-xl border-[2px] px-4 py-2.5 text-sm font-bold transition-all disabled:opacity-40"
                style={{
                  borderColor: "#FFB800",
                  background: "rgba(255,184,0,0.08)",
                  color: "#FFB800",
                }}
              >
                {saving ? (
                  <div
                    className="h-4 w-4 rounded-full border-[2px] border-t-transparent animate-spin"
                    style={{ borderColor: "#FFB800", borderTopColor: "transparent" }}
                  />
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    Save Questions
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Reusable slider ─────────────────────────────────────────────────────── */

function TimerSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  color,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  color: string;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {label}
        </span>
        <span className="font-mono text-xs font-black" style={{ color }}>
          {value}
          {suffix}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseUp={(e) => onCommit(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => onCommit(Number((e.target as HTMLInputElement).value))}
          className="game-slider w-full"
          style={
            {
              "--slider-color": color,
              "--slider-pct": `${pct}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
