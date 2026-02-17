"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FibbageRoom, AnswerOption, FibbagePlayer } from "@/lib/fibbage-room";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import {
  Send,
  Clock,
  Check,
  HelpCircle,
  Trophy,
  Skull,
  Crown,
  Zap,
  RotateCcw,
  ArrowRight,
  Target,
  Users,
  Lightbulb,
  Volume2,
  VolumeX,
  Shield,
  Sparkles,
} from "lucide-react";

interface GameScreenProps {
  room: FibbageRoom;
  playerId: string;
  sendAction: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
  loading: boolean;
  sfx: ReturnType<typeof useSoundEffects>;
}

function useTimer(endsAt: number | null) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!endsAt) { setRemaining(0); return; }
    const update = () => setRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [endsAt]);
  return remaining;
}

// ── Progress Ring ──────────────────────────────────────────────────────────

function ProgressRing({ remaining, total, color }: { remaining: number; total: number; color: string }) {
  const pct = total > 0 ? remaining / total : 0;
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="absolute -rotate-90" width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="22" cy="22" r={r} fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <span className="font-mono text-sm font-black" style={{ color }}>{remaining}</span>
    </div>
  );
}

// ── Phase Badge ───────────────────────────────────────────────────────────

function PhaseBadge({ label, color, icon: Icon }: { label: string; color: string; icon: React.ElementType }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3.5 py-1.5"
      style={{ background: `${color}12`, border: `2px solid ${color}30` }}
    >
      <Icon className="h-3.5 w-3.5" style={{ color }} />
      <span className="text-xs font-black uppercase tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Writing Phase ──────────────────────────────────────────────────────────

function WritingPhase({ room, playerId, sendAction, loading, sfx }: GameScreenProps) {
  const [lie, setLie] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const timer = useTimer(room.phaseEndsAt);
  const question = room.questions[room.currentRound];
  const me = room.players.find((p) => p.id === playerId);
  const submittedCount = room.players.filter((p) => p.lie !== null).length;
  const prevTimerRef = useRef(timer);

  // Sound on timer tick for last 5 seconds
  useEffect(() => {
    if (timer !== prevTimerRef.current && timer > 0 && timer <= 5) {
      sfx.play(timer === 1 ? "countdownFinal" : "countdown");
    }
    prevTimerRef.current = timer;
  }, [timer, sfx]);

  // Play round start sound
  useEffect(() => {
    sfx.play("roundStart");
  }, [sfx]);

  useEffect(() => {
    if (me?.lie && me.lie !== "__submitted__") {
      setSubmitted(true);
    } else if (me?.lie === "__submitted__") {
      setSubmitted(true);
    }
  }, [me?.lie]);

  const handleSubmit = useCallback(async () => {
    if (!lie.trim() || submitted) return;
    setSubmitted(true);
    sfx.play("submit");
    await sendAction("submit_lie", { lie: lie.trim() });
  }, [lie, submitted, sendAction, sfx]);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Header bar */}
      <div className="flex w-full items-center justify-between">
        <PhaseBadge label={`Round ${room.currentRound + 1}/${room.totalRounds}`} color="#FF2D78" icon={Shield} />
        <ProgressRing remaining={timer} total={60} color={timer <= 5 ? "#FF2D78" : "#00E5FF"} />
      </div>

      {/* Question card */}
      <div
        className="w-full overflow-hidden rounded-2xl border-[3px] animate-pop-in"
        style={{ borderColor: "#FFB800", background: "rgba(255,184,0,0.04)" }}
      >
        <div
          className="flex items-center gap-2 px-5 py-2.5"
          style={{ background: "rgba(255,184,0,0.08)" }}
        >
          <HelpCircle className="h-4 w-4 shrink-0" style={{ color: "#FFB800" }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#FFB800" }}>
            Fill in the blank
          </span>
        </div>
        <div className="px-5 py-4">
          <p className="text-lg font-bold leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
            {question.prompt}
          </p>
        </div>
      </div>

      {/* Input or Submitted */}
      {!submitted ? (
        <div className="flex w-full flex-col gap-3 animate-slide-up">
          <label
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.3)" }}
            htmlFor="lie-input"
          >
            Your made-up answer
          </label>
          <div
            className="overflow-hidden rounded-xl border-[2px] transition-all duration-200 focus-within:border-[#FF2D78] focus-within:shadow-[0_0_20px_rgba(255,45,120,0.15)]"
            style={{ borderColor: "rgba(255,255,255,0.1)", background: "var(--cc-card)" }}
          >
            <input
              id="lie-input"
              type="text"
              value={lie}
              onChange={(e) => setLie(e.target.value.slice(0, 60))}
              placeholder="Type your made-up answer..."
              maxLength={60}
              autoFocus
              className="w-full bg-transparent px-4 py-3.5 font-bold placeholder:font-normal focus:outline-none"
              style={{ color: "white" }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <div className="flex items-center justify-between border-t px-4 py-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                Make it sound real!
              </span>
              <span
                className="font-mono text-xs"
                style={{ color: lie.length > 50 ? "#FF2D78" : "rgba(255,255,255,0.2)" }}
              >
                {lie.length}/60
              </span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !lie.trim()}
            className="jackbox-btn flex items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-3.5 text-base disabled:opacity-40"
            style={{
              borderColor: "#FF2D78",
              background: "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(255,45,120,0.05))",
              color: "#FF2D78",
            }}
          >
            <Send className="h-4 w-4" />
            Submit Answer
          </button>
        </div>
      ) : (
        <div
          className="flex w-full flex-col items-center gap-3 rounded-2xl border-[3px] p-6 animate-pop-in"
          style={{ borderColor: "rgba(57,255,20,0.4)", background: "rgba(57,255,20,0.06)" }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "rgba(57,255,20,0.1)" }}
          >
            <Check className="h-7 w-7" style={{ color: "#39FF14" }} />
          </div>
          <p className="text-lg font-black" style={{ color: "#39FF14" }}>
            Locked in!
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#39FF14" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Waiting for others... ({submittedCount}/{room.players.length})
            </p>
          </div>
        </div>
      )}

      {/* Host advance */}
      {room.hostId === playerId && submitted && (
        <button
          onClick={() => { sfx.play("click"); sendAction("advance"); }}
          disabled={loading}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Zap className="h-3 w-3" />
          Skip Timer
        </button>
      )}
    </div>
  );
}

// ─── Voting Phase ───────────────────────────────────────────────────────────

function VotingPhase({ room, playerId, sendAction, loading, sfx }: GameScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const timer = useTimer(room.phaseEndsAt);
  const question = room.questions[room.currentRound];
  const round = room.rounds[room.currentRound];
  const me = room.players.find((p) => p.id === playerId);
  const votedCount = room.players.filter((p) => p.votedFor !== null).length;
  const prevTimerRef = useRef(timer);

  useEffect(() => {
    if (timer !== prevTimerRef.current && timer > 0 && timer <= 5) {
      sfx.play(timer === 1 ? "countdownFinal" : "tick");
    }
    prevTimerRef.current = timer;
  }, [timer, sfx]);

  useEffect(() => {
    sfx.play("whoosh");
  }, [sfx]);

  useEffect(() => {
    if (me?.votedFor) {
      setVoted(true);
      setSelected(me.votedFor);
    }
  }, [me?.votedFor]);

  const handleVote = async (answerId: string) => {
    if (voted) return;
    setSelected(answerId);
    setVoted(true);
    sfx.play("vote");
    await sendAction("submit_vote", { answerId });
  };

  const myAnswerId = round.answers.find((a: AnswerOption) => a.authorId === playerId)?.id;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex w-full items-center justify-between">
        <PhaseBadge label="Pick the truth" color="#00E5FF" icon={Target} />
        <ProgressRing remaining={timer} total={30} color={timer <= 5 ? "#FF2D78" : "#00E5FF"} />
      </div>

      {/* Question reminder */}
      <div
        className="w-full rounded-xl border-[2px] px-4 py-3"
        style={{ borderColor: "rgba(255,184,0,0.15)", background: "rgba(255,184,0,0.03)" }}
      >
        <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          {question.prompt}
        </p>
      </div>

      {/* Answer Options */}
      <div className="flex w-full flex-col gap-2.5">
        {round.answers.map((answer: AnswerOption, i: number) => {
          const isMyLie = answer.id === myAnswerId;
          const isSelected = selected === answer.id;
          const letterLabel = String.fromCharCode(65 + i); // A, B, C, D...

          return (
            <button
              key={answer.id}
              onClick={() => !isMyLie && handleVote(answer.id)}
              disabled={voted || isMyLie}
              className="group w-full rounded-xl border-[2px] px-4 py-3.5 text-left transition-all duration-200 animate-slide-up disabled:cursor-default"
              style={{
                animationDelay: `${i * 80}ms`,
                borderColor: isSelected
                  ? "#00E5FF"
                  : isMyLie ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
                background: isSelected
                  ? "rgba(0,229,255,0.1)"
                  : isMyLie ? "rgba(255,255,255,0.01)" : "var(--cc-card)",
                opacity: isMyLie ? 0.4 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black transition-all duration-200"
                  style={{
                    background: isSelected ? "rgba(0,229,255,0.15)" : "rgba(255,255,255,0.04)",
                    color: isSelected ? "#00E5FF" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {isSelected ? <Check className="h-4 w-4" /> : letterLabel}
                </div>
                <span
                  className="flex-1 font-bold"
                  style={{ color: isMyLie ? "rgba(255,255,255,0.2)" : isSelected ? "#00E5FF" : "rgba(255,255,255,0.85)" }}
                >
                  {answer.text}
                </span>
                {isMyLie && (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.15)" }}>
                    Yours
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {voted && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#00E5FF" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Waiting for others... ({votedCount}/{room.players.length})
          </p>
        </div>
      )}

      {room.hostId === playerId && voted && (
        <button
          onClick={() => { sfx.play("click"); sendAction("advance"); }}
          disabled={loading}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Zap className="h-3 w-3" />
          Skip Timer
        </button>
      )}
    </div>
  );
}

// ─── Reveal Phase ───────────────────────────────────────────────────────────

function RevealPhase({ room, playerId, sendAction, loading, sfx }: GameScreenProps) {
  const question = room.questions[room.currentRound];
  const round = room.rounds[room.currentRound];
  const isHost = room.hostId === playerId;
  const me = room.players.find((p) => p.id === playerId);
  const myVote = me?.votedFor ? round.votes[playerId] : null;
  const truthAnswer = round.answers.find((a: AnswerOption) => a.authorId === null);
  const gotItRight = myVote === truthAnswer?.id;

  useEffect(() => {
    sfx.play("reveal");
    const t = setTimeout(() => sfx.play(gotItRight ? "correct" : "wrong"), 600);
    return () => clearTimeout(t);
  }, [sfx, gotItRight]);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Result banner */}
      <div
        className="flex w-full items-center justify-center gap-3 rounded-2xl border-[3px] py-4 animate-pop-in"
        style={{
          borderColor: gotItRight ? "#39FF14" : "#FF2D78",
          background: gotItRight ? "rgba(57,255,20,0.06)" : "rgba(255,45,120,0.06)",
        }}
      >
        {gotItRight ? (
          <>
            <Sparkles className="h-6 w-6" style={{ color: "#39FF14" }} />
            <span className="text-lg font-black uppercase" style={{ color: "#39FF14" }}>You got it right!</span>
          </>
        ) : (
          <>
            <Skull className="h-6 w-6" style={{ color: "#FF2D78" }} />
            <span className="text-lg font-black uppercase" style={{ color: "#FF2D78" }}>You were tricked!</span>
          </>
        )}
      </div>

      {/* Question */}
      <div
        className="w-full rounded-xl border-[2px] px-4 py-3"
        style={{ borderColor: "rgba(255,184,0,0.15)", background: "rgba(255,184,0,0.03)" }}
      >
        <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          {question.prompt}
        </p>
      </div>

      {/* Answers with reveals */}
      <div className="flex w-full flex-col gap-3">
        {round.answers.map((answer: AnswerOption, i: number) => {
          const isTruth = answer.authorId === null;
          const author = answer.authorId ? room.players.find((p) => p.id === answer.authorId) : null;
          const voters = room.players.filter((p) => round.votes[p.id] === answer.id);

          return (
            <div
              key={answer.id}
              className="w-full overflow-hidden rounded-xl border-[3px] animate-slide-up"
              style={{
                animationDelay: `${i * 150}ms`,
                borderColor: isTruth ? "#39FF14" : "rgba(255,45,120,0.4)",
                background: isTruth ? "rgba(57,255,20,0.04)" : "rgba(255,45,120,0.02)",
              }}
            >
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex flex-col gap-1">
                  <p
                    className="text-base font-bold"
                    style={{ color: isTruth ? "#39FF14" : "rgba(255,255,255,0.85)" }}
                  >
                    {answer.text}
                  </p>
                  <p className="text-xs font-bold" style={{ color: isTruth ? "#39FF14" : "#FF2D78" }}>
                    {isTruth ? "THE CORRECT ANSWER" : `Written by ${author?.name || "Unknown"}`}
                  </p>
                </div>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: isTruth ? "rgba(57,255,20,0.15)" : "rgba(255,45,120,0.1)" }}
                >
                  {isTruth ? (
                    <Check className="h-4 w-4" style={{ color: "#39FF14" }} />
                  ) : (
                    <Skull className="h-4 w-4" style={{ color: "#FF2D78" }} />
                  )}
                </div>
              </div>

              {/* Voters */}
              {voters.length > 0 && (
                <div
                  className="flex flex-wrap gap-1.5 border-t px-4 py-2.5"
                  style={{ borderColor: isTruth ? "rgba(57,255,20,0.1)" : "rgba(255,45,120,0.08)" }}
                >
                  {voters.map((voter) => (
                    <span
                      key={voter.id}
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{
                        background: isTruth ? "rgba(57,255,20,0.1)" : "rgba(255,45,120,0.1)",
                        color: isTruth ? "#39FF14" : "#FF2D78",
                      }}
                    >
                      {voter.name} {isTruth ? "+1000" : "tricked!"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fun fact */}
      {question.funFact && (
        <div
          className="w-full overflow-hidden rounded-xl border-[2px] animate-fade-in"
          style={{ borderColor: "rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.03)" }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{ background: "rgba(0,229,255,0.05)" }}
          >
            <Lightbulb className="h-3.5 w-3.5" style={{ color: "#00E5FF" }} />
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#00E5FF" }}>
              Did you know?
            </span>
          </div>
          <p className="px-4 py-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            {question.funFact}
          </p>
        </div>
      )}

      {/* Host advance */}
      {isHost && (
        <button
          onClick={() => { sfx.play("click"); sendAction("advance"); }}
          disabled={loading}
          className="jackbox-btn flex items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-3 text-sm"
          style={{ borderColor: "#FFB800", background: "linear-gradient(135deg, rgba(255,184,0,0.12), rgba(255,184,0,0.04))", color: "#FFB800" }}
        >
          <ArrowRight className="h-4 w-4" />
          Show Scores
        </button>
      )}
    </div>
  );
}

// ─── Scores Phase ───────────────────────────────────────────────────────────

function ScoresPhase({ room, playerId, sendAction, loading, sfx }: GameScreenProps) {
  const isHost = room.hostId === playerId;
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const isLastRound = room.currentRound >= room.totalRounds - 1;

  useEffect(() => {
    sfx.play("score");
  }, [sfx]);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-2 animate-pop-in">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "rgba(255,184,0,0.1)" }}
        >
          <Trophy className="h-7 w-7" style={{ color: "#FFB800" }} />
        </div>
        <h3 className="text-xl font-black uppercase" style={{ color: "#FFB800" }}>
          Scoreboard
        </h3>
        <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
          Round {room.currentRound + 1} of {room.totalRounds}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        {sorted.map((player, i) => {
          const isLeader = i === 0;
          const medal =
            i === 0
              ? { color: "#FFB800", bg: "rgba(255,184,0,0.08)", border: "rgba(255,184,0,0.25)" }
              : i === 1
                ? { color: "rgba(192,192,192,0.8)", bg: "rgba(192,192,192,0.04)", border: "rgba(192,192,192,0.12)" }
                : i === 2
                  ? { color: "#CD7F32", bg: "rgba(205,127,50,0.06)", border: "rgba(205,127,50,0.15)" }
                  : { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.05)" };

          return (
            <div
              key={player.id}
              className="flex items-center gap-3 rounded-xl border-[2px] px-4 py-3 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms`, borderColor: medal.border, background: medal.bg }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black"
                style={{ background: `${medal.color}15`, color: medal.color }}
              >
                {isLeader ? <Crown className="h-4 w-4" /> : i + 1}
              </div>
              <div className="flex flex-1 flex-col">
                <span
                  className="font-bold"
                  style={{ color: player.id === playerId ? "#FF2D78" : "rgba(255,255,255,0.85)" }}
                >
                  {player.name}
                  {player.id === playerId && (
                    <span className="ml-1.5 text-xs font-normal" style={{ color: "rgba(255,255,255,0.3)" }}>(you)</span>
                  )}
                </span>
                {player.totalFools > 0 && (
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Tricked {player.totalFools} {player.totalFools === 1 ? "player" : "players"}
                  </span>
                )}
              </div>
              <span className="font-mono text-lg font-black" style={{ color: medal.color }}>
                {player.score.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {isHost && (
        <button
          onClick={() => { sfx.play("click"); sendAction("advance"); }}
          disabled={loading}
          className="jackbox-btn flex items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-3 text-sm"
          style={{
            borderColor: isLastRound ? "#FF2D78" : "#39FF14",
            background: isLastRound
              ? "linear-gradient(135deg, rgba(255,45,120,0.12), rgba(255,45,120,0.04))"
              : "linear-gradient(135deg, rgba(57,255,20,0.12), rgba(57,255,20,0.04))",
            color: isLastRound ? "#FF2D78" : "#39FF14",
          }}
        >
          <ArrowRight className="h-4 w-4" />
          {isLastRound ? "Final Results" : "Next Round"}
        </button>
      )}
    </div>
  );
}

// ─── Game Over ──────────────────────────────────────────────────────────────

function GameOverPhase({ room, playerId, sendAction, loading, sfx }: GameScreenProps) {
  const isHost = room.hostId === playerId;
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  useEffect(() => {
    sfx.play("winner");
  }, [sfx]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Winner spotlight */}
      <div className="flex flex-col items-center gap-4 animate-bounce-in">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full animate-glow-pulse"
          style={{ background: "rgba(255,184,0,0.1)", boxShadow: "0 0 40px rgba(255,184,0,0.2)" }}
        >
          <Crown className="h-10 w-10" style={{ color: "#FFB800" }} />
        </div>
        <h2 className="text-center text-2xl font-black uppercase" style={{ color: "#FFB800" }}>
          {winner.name} Wins!
        </h2>
        <p className="font-mono text-3xl font-black" style={{ color: "#39FF14" }}>
          {winner.score.toLocaleString()} pts
        </p>
      </div>

      {/* Final standings */}
      <div className="flex w-full flex-col gap-2">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className="flex items-center gap-3 rounded-xl border-[2px] px-4 py-3 animate-slide-up"
            style={{
              animationDelay: `${i * 100}ms`,
              borderColor: i === 0 ? "rgba(255,184,0,0.25)" : "rgba(255,255,255,0.06)",
              background: i === 0 ? "rgba(255,184,0,0.06)" : "var(--cc-card)",
            }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black"
              style={{
                background: i === 0 ? "rgba(255,184,0,0.15)" : i === 1 ? "rgba(192,192,192,0.06)" : "rgba(255,255,255,0.03)",
                color: i === 0 ? "#FFB800" : i === 1 ? "rgba(192,192,192,0.8)" : "rgba(255,255,255,0.3)",
              }}
            >
              {i + 1}
            </div>
            <div className="flex flex-1 flex-col">
              <span
                className="font-bold"
                style={{ color: player.id === playerId ? "#FF2D78" : "rgba(255,255,255,0.85)" }}
              >
                {player.name}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                Tricked {player.totalFools} total
              </span>
            </div>
            <span
              className="font-mono text-base font-black"
              style={{ color: i === 0 ? "#FFB800" : "rgba(255,255,255,0.5)" }}
            >
              {player.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Master of Disguise award */}
      {(() => {
        const bestTrickster = [...room.players].sort((a, b) => b.totalFools - a.totalFools)[0];
        if (bestTrickster.totalFools > 0) {
          return (
            <div
              className="w-full overflow-hidden rounded-xl border-[2px] animate-fade-in"
              style={{ borderColor: "rgba(255,45,120,0.2)", background: "rgba(255,45,120,0.04)" }}
            >
              <div className="flex items-center justify-center gap-2 py-2" style={{ background: "rgba(255,45,120,0.06)" }}>
                <Sparkles className="h-3.5 w-3.5" style={{ color: "#FF2D78" }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#FF2D78" }}>
                  Master of Disguise
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-4">
                <p className="text-lg font-black" style={{ color: "#FF2D78" }}>
                  {bestTrickster.name}
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Tricked {bestTrickster.totalFools} {bestTrickster.totalFools === 1 ? "player" : "players"} total
                </p>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Play again */}
      {isHost && (
        <button
          onClick={() => { sfx.play("click"); sendAction("play_again"); }}
          disabled={loading}
          className="jackbox-btn flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-4 text-lg"
          style={{
            borderColor: "#39FF14",
            background: "linear-gradient(135deg, rgba(57,255,20,0.12), rgba(57,255,20,0.04))",
            color: "#39FF14",
          }}
        >
          <RotateCcw className="h-5 w-5" />
          Play Again
        </button>
      )}

      {!isHost && (
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Waiting for host to start a new game...
        </p>
      )}
    </div>
  );
}

// ─── Main Game Screen ───────────────────────────────────────────────────────

export function GameScreen({ room, playerId, sendAction, loading, sfx }: GameScreenProps & { sfx: ReturnType<typeof useSoundEffects> }) {
  return (
    <div
      className="flex min-h-dvh flex-col items-center px-4 py-6"
      style={{ background: "var(--cc-dark)" }}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        {/* Game header */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Skull className="h-5 w-5" style={{ color: "#FF2D78" }} />
            <span className="font-mono text-sm font-black uppercase" style={{ color: "#FF2D78" }}>
              CyberFib
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
              <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                {room.players.filter((p: FibbagePlayer) => p.connected).length}/{room.players.length}
              </span>
            </div>
          </div>
        </div>

        {/* Phase content */}
        {room.status === "writing" && <WritingPhase room={room} playerId={playerId} sendAction={sendAction} loading={loading} sfx={sfx} />}
        {room.status === "voting" && <VotingPhase room={room} playerId={playerId} sendAction={sendAction} loading={loading} sfx={sfx} />}
        {room.status === "reveal" && <RevealPhase room={room} playerId={playerId} sendAction={sendAction} loading={loading} sfx={sfx} />}
        {room.status === "scores" && <ScoresPhase room={room} playerId={playerId} sendAction={sendAction} loading={loading} sfx={sfx} />}
        {room.status === "game_over" && <GameOverPhase room={room} playerId={playerId} sendAction={sendAction} loading={loading} sfx={sfx} />}
      </div>
    </div>
  );
}
