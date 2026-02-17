"use client";

import { useState, useEffect, useCallback } from "react";
import type { FibbageRoom, AnswerOption, FibbagePlayer } from "@/lib/fibbage-room";
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
} from "lucide-react";

interface GameScreenProps {
  room: FibbageRoom;
  playerId: string;
  sendAction: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
  loading: boolean;
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

// ─── Writing Phase ──────────────────────────────────────────────────────────

function WritingPhase({ room, playerId, sendAction, loading }: GameScreenProps) {
  const [lie, setLie] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const timer = useTimer(room.phaseEndsAt);
  const question = room.questions[room.currentRound];
  const me = room.players.find((p) => p.id === playerId);
  const submittedCount = room.players.filter((p) => p.lie !== null).length;

  // If we already submitted (page refresh scenario)
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
    await sendAction("submit_lie", { lie: lie.trim() });
  }, [lie, submitted, sendAction]);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Timer + Round */}
      <div className="flex w-full items-center justify-between">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{ background: "rgba(255,45,120,0.1)", color: "#FF2D78" }}
        >
          Round {room.currentRound + 1}/{room.totalRounds}
        </span>
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{
            background: timer <= 10 ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.05)",
            color: timer <= 10 ? "#FF2D78" : "rgba(255,255,255,0.6)",
          }}
        >
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono text-sm font-bold">{timer}s</span>
        </div>
      </div>

      {/* Question */}
      <div
        className="w-full rounded-2xl border-[3px] p-5 animate-pop-in"
        style={{ borderColor: "#FFB800", background: "rgba(255,184,0,0.05)" }}
      >
        <div className="mb-2 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 shrink-0" style={{ color: "#FFB800" }} />
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "#FFB800" }}
          >
            Complete the fact
          </span>
        </div>
        <p className="text-lg font-bold leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
          {question.prompt}
        </p>
      </div>

      {/* Input or Submitted */}
      {!submitted ? (
        <div className="flex w-full flex-col gap-3 animate-slide-up">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.3)" }}
              htmlFor="lie-input"
            >
              Your fake answer
            </label>
            <input
              id="lie-input"
              type="text"
              value={lie}
              onChange={(e) => setLie(e.target.value.slice(0, 60))}
              placeholder="Write something believable..."
              maxLength={60}
              autoFocus
              className="rounded-xl border-[2px] px-4 py-3.5 font-bold placeholder:font-normal focus:outline-none"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                background: "var(--cc-card)",
                color: "white",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#FF2D78")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <div className="flex items-center justify-between">
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Make it convincing!
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
              background: "rgba(255,45,120,0.1)",
              color: "#FF2D78",
            }}
          >
            <Send className="h-4 w-4" />
            Submit Lie
          </button>
        </div>
      ) : (
        <div
          className="flex w-full flex-col items-center gap-3 rounded-2xl border-[2px] p-5 animate-pop-in"
          style={{ borderColor: "rgba(57,255,20,0.3)", background: "rgba(57,255,20,0.05)" }}
        >
          <Check className="h-8 w-8" style={{ color: "#39FF14" }} />
          <p className="font-bold" style={{ color: "#39FF14" }}>
            Lie submitted!
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Waiting for others... ({submittedCount}/{room.players.length})
          </p>
        </div>
      )}

      {/* Host advance button */}
      {room.hostId === playerId && submitted && (
        <button
          onClick={() => sendAction("advance")}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Zap className="h-3 w-3" />
          Skip Timer
        </button>
      )}
    </div>
  );
}

// ─── Voting Phase ───────────────────────────────────────────────────────────

function VotingPhase({ room, playerId, sendAction, loading }: GameScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const timer = useTimer(room.phaseEndsAt);
  const question = room.questions[room.currentRound];
  const round = room.rounds[room.currentRound];
  const me = room.players.find((p) => p.id === playerId);
  const votedCount = room.players.filter((p) => p.votedFor !== null).length;

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
    await sendAction("submit_vote", { answerId });
  };

  // Find which answer is mine (so I can't vote for it)
  const myAnswerId = round.answers.find((a: AnswerOption) => a.authorId === playerId)?.id;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Timer + Round */}
      <div className="flex w-full items-center justify-between">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{ background: "rgba(0,229,255,0.1)", color: "#00E5FF" }}
        >
          Pick the truth
        </span>
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{
            background: timer <= 5 ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.05)",
            color: timer <= 5 ? "#FF2D78" : "rgba(255,255,255,0.6)",
          }}
        >
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono text-sm font-bold">{timer}s</span>
        </div>
      </div>

      {/* Question reminder */}
      <div
        className="w-full rounded-xl border-[2px] px-4 py-3"
        style={{ borderColor: "rgba(255,184,0,0.2)", background: "rgba(255,184,0,0.03)" }}
      >
        <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
          {question.prompt}
        </p>
      </div>

      {/* Answer Options */}
      <div className="flex w-full flex-col gap-2.5">
        {round.answers.map((answer: AnswerOption, i: number) => {
          const isMyLie = answer.id === myAnswerId;
          const isSelected = selected === answer.id;

          return (
            <button
              key={answer.id}
              onClick={() => !isMyLie && handleVote(answer.id)}
              disabled={voted || isMyLie}
              className="w-full rounded-xl border-[2px] px-4 py-3.5 text-left font-bold transition-all duration-200 animate-slide-up disabled:cursor-default"
              style={{
                animationDelay: `${i * 100}ms`,
                borderColor: isSelected
                  ? "#00E5FF"
                  : isMyLie
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.08)",
                background: isSelected
                  ? "rgba(0,229,255,0.1)"
                  : isMyLie
                    ? "rgba(255,255,255,0.01)"
                    : "var(--cc-card)",
                color: isMyLie
                  ? "rgba(255,255,255,0.2)"
                  : isSelected
                    ? "#00E5FF"
                    : "rgba(255,255,255,0.85)",
                opacity: isMyLie ? 0.5 : 1,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{answer.text}</span>
                {isMyLie && (
                  <span className="shrink-0 text-xs font-normal" style={{ color: "rgba(255,255,255,0.2)" }}>
                    Your lie
                  </span>
                )}
                {isSelected && <Check className="h-4 w-4 shrink-0" style={{ color: "#00E5FF" }} />}
              </div>
            </button>
          );
        })}
      </div>

      {voted && (
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Waiting for others... ({votedCount}/{room.players.length})
        </p>
      )}

      {/* Host advance */}
      {room.hostId === playerId && voted && (
        <button
          onClick={() => sendAction("advance")}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Zap className="h-3 w-3" />
          Skip Timer
        </button>
      )}
    </div>
  );
}

// ─── Reveal Phase ───────────────────────────────────────────────────────────

function RevealPhase({ room, playerId, sendAction, loading }: GameScreenProps) {
  const question = room.questions[room.currentRound];
  const round = room.rounds[room.currentRound];
  const isHost = room.hostId === playerId;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 animate-pop-in">
        <Target className="h-8 w-8" style={{ color: "#FFB800" }} />
        <h3 className="text-lg font-black uppercase" style={{ color: "#FFB800" }}>
          The Truth Revealed
        </h3>
      </div>

      {/* Question */}
      <div
        className="w-full rounded-xl border-[2px] px-4 py-3"
        style={{ borderColor: "rgba(255,184,0,0.2)", background: "rgba(255,184,0,0.03)" }}
      >
        <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
          {question.prompt}
        </p>
      </div>

      {/* Answers with reveals */}
      <div className="flex w-full flex-col gap-3">
        {round.answers.map((answer: AnswerOption, i: number) => {
          const isTruth = answer.authorId === null;
          const author = answer.authorId
            ? room.players.find((p) => p.id === answer.authorId)
            : null;
          const voters = room.players.filter((p) => round.votes[p.id] === answer.id);

          return (
            <div
              key={answer.id}
              className="w-full rounded-xl border-[3px] p-4 animate-slide-up"
              style={{
                animationDelay: `${i * 150}ms`,
                borderColor: isTruth ? "#39FF14" : "#FF2D78",
                background: isTruth ? "rgba(57,255,20,0.05)" : "rgba(255,45,120,0.03)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p
                    className="text-base font-bold"
                    style={{ color: isTruth ? "#39FF14" : "rgba(255,255,255,0.85)" }}
                  >
                    {answer.text}
                  </p>
                  <p className="text-xs font-medium" style={{ color: isTruth ? "#39FF14" : "#FF2D78" }}>
                    {isTruth ? "THE TRUTH" : `Written by ${author?.name || "Unknown"}`}
                  </p>
                </div>
                {isTruth ? (
                  <Check className="h-5 w-5 shrink-0" style={{ color: "#39FF14" }} />
                ) : (
                  <Skull className="h-5 w-5 shrink-0" style={{ color: "#FF2D78" }} />
                )}
              </div>

              {/* Who voted for this */}
              {voters.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {voters.map((voter) => (
                    <span
                      key={voter.id}
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{
                        background: isTruth ? "rgba(57,255,20,0.1)" : "rgba(255,45,120,0.1)",
                        color: isTruth ? "#39FF14" : "#FF2D78",
                      }}
                    >
                      {voter.name} {isTruth ? "+1000" : "fooled!"}
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
          className="w-full rounded-xl border-[2px] p-4 animate-fade-in"
          style={{ borderColor: "rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.03)" }}
        >
          <div className="mb-1.5 flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5" style={{ color: "#00E5FF" }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#00E5FF" }}>
              Did you know?
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            {question.funFact}
          </p>
        </div>
      )}

      {/* Host advance */}
      {isHost && (
        <button
          onClick={() => sendAction("advance")}
          disabled={loading}
          className="jackbox-btn flex items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-3 text-sm"
          style={{
            borderColor: "#FFB800",
            background: "rgba(255,184,0,0.1)",
            color: "#FFB800",
          }}
        >
          <ArrowRight className="h-4 w-4" />
          Show Scores
        </button>
      )}
    </div>
  );
}

// ─── Scores Phase ───────────────────────────────────────────────────────────

function ScoresPhase({ room, playerId, sendAction, loading }: GameScreenProps) {
  const isHost = room.hostId === playerId;
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const isLastRound = room.currentRound >= room.totalRounds - 1;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-2 animate-pop-in">
        <Trophy className="h-8 w-8" style={{ color: "#FFB800" }} />
        <h3 className="text-lg font-black uppercase" style={{ color: "#FFB800" }}>
          Scoreboard
        </h3>
        <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
          Round {room.currentRound + 1} of {room.totalRounds}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        {sorted.map((player, i) => {
          const medal =
            i === 0
              ? { color: "#FFB800", bg: "rgba(255,184,0,0.1)" }
              : i === 1
                ? { color: "rgba(192,192,192,0.8)", bg: "rgba(192,192,192,0.05)" }
                : i === 2
                  ? { color: "#CD7F32", bg: "rgba(205,127,50,0.08)" }
                  : { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.02)" };

          return (
            <div
              key={player.id}
              className="flex items-center gap-3 rounded-xl border-[2px] px-4 py-3 animate-slide-up"
              style={{
                animationDelay: `${i * 100}ms`,
                borderColor: i === 0 ? "rgba(255,184,0,0.3)" : "rgba(255,255,255,0.06)",
                background: medal.bg,
              }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black"
                style={{ background: medal.bg, color: medal.color }}
              >
                {i + 1}
              </div>
              <div className="flex flex-1 flex-col">
                <span
                  className="font-bold"
                  style={{ color: player.id === playerId ? "#FF2D78" : "rgba(255,255,255,0.85)" }}
                >
                  {player.name}
                  {player.id === playerId && (
                    <span className="ml-1.5 text-xs font-normal" style={{ color: "rgba(255,255,255,0.3)" }}>
                      (you)
                    </span>
                  )}
                </span>
                {player.totalFools > 0 && (
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Fooled {player.totalFools} {player.totalFools === 1 ? "player" : "players"}
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

      {/* Host advance */}
      {isHost && (
        <button
          onClick={() => sendAction("advance")}
          disabled={loading}
          className="jackbox-btn flex items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-3 text-sm"
          style={{
            borderColor: isLastRound ? "#FF2D78" : "#39FF14",
            background: isLastRound ? "rgba(255,45,120,0.1)" : "rgba(57,255,20,0.1)",
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

function GameOverPhase({ room, playerId, sendAction, loading }: GameScreenProps) {
  const isHost = room.hostId === playerId;
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Winner */}
      <div className="flex flex-col items-center gap-3 animate-bounce-in">
        <Crown className="h-12 w-12" style={{ color: "#FFB800" }} />
        <h2 className="text-2xl font-black uppercase" style={{ color: "#FFB800" }}>
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
              borderColor: i === 0 ? "rgba(255,184,0,0.3)" : "rgba(255,255,255,0.06)",
              background: i === 0 ? "rgba(255,184,0,0.08)" : "var(--cc-card)",
            }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black"
              style={{
                background:
                  i === 0 ? "rgba(255,184,0,0.15)" : i === 1 ? "rgba(192,192,192,0.08)" : "rgba(255,255,255,0.03)",
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
                Fooled {player.totalFools} total
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

      {/* Best liar award */}
      {(() => {
        const bestLiar = [...room.players].sort((a, b) => b.totalFools - a.totalFools)[0];
        if (bestLiar.totalFools > 0) {
          return (
            <div
              className="w-full rounded-xl border-[2px] p-4 text-center animate-fade-in"
              style={{ borderColor: "rgba(255,45,120,0.2)", background: "rgba(255,45,120,0.05)" }}
            >
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#FF2D78" }}>
                Best Liar Award
              </p>
              <p className="mt-1 text-lg font-black" style={{ color: "#FF2D78" }}>
                {bestLiar.name}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Fooled {bestLiar.totalFools} {bestLiar.totalFools === 1 ? "player" : "players"} total
              </p>
            </div>
          );
        }
        return null;
      })()}

      {/* Play again */}
      {isHost && (
        <button
          onClick={() => sendAction("play_again")}
          disabled={loading}
          className="jackbox-btn flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-4 text-lg"
          style={{
            borderColor: "#39FF14",
            background: "rgba(57,255,20,0.1)",
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

export function GameScreen(props: GameScreenProps) {
  const { room } = props;

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
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {room.players.filter((p: FibbagePlayer) => p.connected).length}/{room.players.length}
            </span>
          </div>
        </div>

        {/* Phase content */}
        {room.status === "writing" && <WritingPhase {...props} />}
        {room.status === "voting" && <VotingPhase {...props} />}
        {room.status === "reveal" && <RevealPhase {...props} />}
        {room.status === "scores" && <ScoresPhase {...props} />}
        {room.status === "game_over" && <GameOverPhase {...props} />}
      </div>
    </div>
  );
}
