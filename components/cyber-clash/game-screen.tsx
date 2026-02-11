"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Mail, Clock, Fish, ShieldCheck, CheckCircle2, XCircle, Lightbulb,
  ChevronRight, AlertTriangle, Lock, Flame, Zap, Sparkles, User, Eye,
  Search, Award, Info, Target, BarChart3, KeyRound, Globe, Link2,
} from "lucide-react";
import type { GameRoom, GameRound, PhishRound, PasswordRound, SpotURLRound } from "@/lib/game-room";
import { Leaderboard } from "./leaderboard";

interface GameScreenProps {
  room: GameRoom;
  playerId: string;
  isHost: boolean;
  onAnswer: (answer: number) => void;
  onShowResults: () => void;
  onNextQuestion: () => void;
}

const DIFFICULTY_COLORS = { easy: "#39FF14", medium: "#FFB800", hard: "#FF2D78" };
const DIFFICULTY_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard" };
const ROUND_TYPE_LABELS = { phish: "Phish or Legit?", password: "Password Strength", spot_url: "Spot the URL" };
const ROUND_TYPE_ICONS = { phish: Fish, password: KeyRound, spot_url: Globe };
const ROUND_TYPE_COLORS = { phish: "#00E5FF", password: "#A855F7", spot_url: "#F97316" };

function FloatingIcon({ icon: Icon, color, left, delay, size }: { icon: typeof Zap; color: string; left: string; delay: string; size: number }) {
  return (
    <div className="pointer-events-none absolute animate-float" aria-hidden="true"
      style={{ left, top: `${10 + Math.random() * 60}%`, animationDelay: delay, opacity: 0.08 }}>
      <Icon style={{ color, width: size, height: size }} />
    </div>
  );
}

export function GameScreen({ room, playerId, isHost, onAnswer, onShowResults, onNextQuestion }: GameScreenProps) {
  const round = room.questionSet[room.currentQuestion] as GameRound | undefined;
  const player = room.players.find((p) => p.id === playerId);
  const hasAnswered = player ? player.answers.length > room.currentQuestion : false;
  const [timeLeft, setTimeLeft] = useState(room.questionTimeLimit);
  const showingResults = room.status === "showing_results";
  const timerExpiredRef = useRef(false);
  const prevQuestionRef = useRef(room.currentQuestion);
  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFunFact, setShowFunFact] = useState(false);
  const [highlightClues, setHighlightClues] = useState(false);
  const [revealPhase, setRevealPhase] = useState(0);
  const [showScorePopup, setShowScorePopup] = useState(false);

  useEffect(() => {
    if (room.currentQuestion !== prevQuestionRef.current) {
      timerExpiredRef.current = false;
      prevQuestionRef.current = room.currentQuestion;
      setShowExplanation(false);
      setShowFunFact(false);
      setHighlightClues(false);
      setRevealPhase(0);
      setShowScorePopup(false);
    }
  }, [room.currentQuestion]);

  useEffect(() => {
    if (!showingResults) return;
    setRevealPhase(0);
    setShowScorePopup(true);
    const t1 = setTimeout(() => { setRevealPhase(1); setShowExplanation(true); }, 800);
    const t2 = setTimeout(() => { setRevealPhase(2); setHighlightClues(true); setShowFunFact(true); }, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [showingResults, room.currentQuestion]);

  useEffect(() => {
    if (room.status !== "playing" || !room.questionStartedAt) return;
    const tick = () => {
      const elapsed = (Date.now() - room.questionStartedAt!) / 1000;
      const remaining = Math.max(0, room.questionTimeLimit - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0 && isHost && !timerExpiredRef.current) {
        timerExpiredRef.current = true;
        onShowResults();
      }
    };
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [room.status, room.questionStartedAt, room.questionTimeLimit, isHost, onShowResults]);

  useEffect(() => {
    if (showingResults && isHost) {
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = setTimeout(() => onNextQuestion(), 8000);
      return () => { if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current); };
    }
  }, [showingResults, isHost, onNextQuestion, room.currentQuestion]);

  const handleAnswer = useCallback((answer: number) => {
    if (hasAnswered || timeLeft <= 0) return;
    onAnswer(answer);
  }, [hasAnswered, timeLeft, onAnswer]);

  const timerPercent = (timeLeft / room.questionTimeLimit) * 100;
  const timerColor = timeLeft > 12 ? "#00E5FF" : timeLeft > 6 ? "#FFB800" : "#FF2D78";
  const answeredCount = room.players.filter((p) => p.answers.length > room.currentQuestion).length;
  const wasCorrect = player && player.answers.length > room.currentQuestion ? player.answers[room.currentQuestion] : null;
  const playerStreak = player?.streak ?? 0;
  const roundType = round?.type ?? "phish";
  const RoundIcon = ROUND_TYPE_ICONS[roundType] ?? Fish;
  const roundColor = ROUND_TYPE_COLORS[roundType] ?? "#00E5FF";

  const bgIcons = useMemo(() => [
    { icon: ShieldCheck, color: "#00E5FF", left: "5%", delay: "0s", size: 32 },
    { icon: Fish, color: "#FF2D78", left: "85%", delay: "1.2s", size: 28 },
    { icon: Zap, color: "#FFB800", left: "45%", delay: "0.7s", size: 24 },
    { icon: Sparkles, color: "#39FF14", left: "70%", delay: "2s", size: 26 },
    { icon: Lock, color: "#A855F7", left: "20%", delay: "1.8s", size: 22 },
    { icon: KeyRound, color: "#F97316", left: "60%", delay: "0.3s", size: 20 },
  ], []);

  if (!round) return null;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ background: "var(--cc-dark)" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {bgIcons.map((props, i) => <FloatingIcon key={i} {...props} />)}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "linear-gradient(rgba(0,229,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="relative flex flex-1 flex-col px-3 py-4 sm:px-4 sm:py-6 lg:px-10 lg:py-8">
        {/* Top bar */}
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl"
              style={{ background: `${roundColor}15`, border: `2px solid ${roundColor}30` }}>
              <RoundIcon className="h-4 w-4 sm:h-6 sm:w-6" style={{ color: roundColor }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <p className="text-base font-black sm:text-xl" style={{ color: "#fff" }}>
                  {'Round '}
                  <span style={{ color: roundColor }}>{room.currentQuestion + 1}</span>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>{' of '}{room.totalQuestions}</span>
                </p>
                {round.difficulty && (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                    style={{ background: `${DIFFICULTY_COLORS[round.difficulty]}15`, color: DIFFICULTY_COLORS[round.difficulty], border: `1px solid ${DIFFICULTY_COLORS[round.difficulty]}30` }}>
                    {DIFFICULTY_LABELS[round.difficulty]}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: roundColor }}>
                {ROUND_TYPE_LABELS[roundType]}
                {round.category && <span style={{ color: "rgba(255,255,255,0.2)" }}>{' \u2022 '}{round.category}</span>}
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="hidden items-center gap-1.5 sm:flex" aria-label="Question progress">
            {Array.from({ length: room.totalQuestions }).map((_, i) => {
              const answered = player && player.answers.length > i;
              const correct = player && player.answers[i] === true;
              const qi = room.questionSet[i];
              const qColor = qi ? ROUND_TYPE_COLORS[qi.type] : "#fff";
              return (
                <div key={i} className="h-2.5 w-2.5 rounded-full transition-all duration-300"
                  style={{
                    background: answered ? (correct ? "#39FF14" : "#FF2D78") : i === room.currentQuestion ? qColor : "rgba(255,255,255,0.1)",
                    boxShadow: i === room.currentQuestion ? `0 0 8px ${qColor}60` : "none",
                    transform: i === room.currentQuestion ? "scale(1.3)" : "scale(1)",
                  }}
                />
              );
            })}
          </div>

          {/* Timer */}
          {!showingResults && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="-rotate-90" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke={timerColor} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${(timerPercent / 100) * 176} 176`}
                    style={{ transition: "stroke-dasharray 0.3s linear, stroke 0.3s ease", filter: `drop-shadow(0 0 6px ${timerColor}60)` }} />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-lg font-black tabular-nums ${timeLeft <= 5 ? "animate-countdown-pulse" : ""}`}
                  style={{ color: timerColor }}>{Math.ceil(timeLeft)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Streak */}
        {playerStreak >= 2 && !showingResults && (
          <div className="animate-pop-in mb-4 flex items-center justify-center gap-2 rounded-full py-2" style={{ background: "rgba(255,184,0,0.08)" }}>
            <Flame className="h-5 w-5" style={{ color: "#FFB800" }} />
            <span className="text-sm font-black uppercase tracking-wider" style={{ color: "#FFB800" }}>{playerStreak}x Streak!</span>
            {Array.from({ length: Math.min(playerStreak, 5) }).map((_, i) => (
              <Flame key={i} className="h-4 w-4" style={{ color: "#FFB800", opacity: 0.4 + (i * 0.15) }} />
            ))}
          </div>
        )}

        {/* Answered players tracker */}
        {!showingResults && (
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5">
              {room.players.map((p) => {
                const pAnswered = p.answers.length > room.currentQuestion;
                return (
                  <div key={p.id} className="relative h-8 w-8 rounded-lg text-[10px] font-black flex items-center justify-center transition-all duration-300"
                    style={{
                      background: pAnswered ? `${roundColor}15` : "rgba(255,255,255,0.04)",
                      border: `2px solid ${pAnswered ? `${roundColor}40` : "rgba(255,255,255,0.08)"}`,
                      color: pAnswered ? roundColor : "rgba(255,255,255,0.25)",
                    }} title={`${p.name}${pAnswered ? " (answered)" : ""}`}>
                    {p.name.charAt(0).toUpperCase()}
                    {pAnswered && <CheckCircle2 className="absolute -top-1 -right-1 h-3.5 w-3.5" style={{ color: roundColor, background: "var(--cc-dark)", borderRadius: "50%" }} />}
                  </div>
                );
              })}
            </div>
            <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>{answeredCount}/{room.players.length}</span>
          </div>
        )}

        {/* Investigate prompt */}
        {!showingResults && !hasAnswered && timeLeft > 0 && (
          <div className="mb-3 flex items-center justify-center gap-2">
            <Search className="h-4 w-4 animate-float" style={{ color: roundColor, animationDuration: "2s" }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: `${roundColor}80` }}>
              {roundType === "phish" ? "Read the email carefully. Look at the sender, links, and tone..." 
                : roundType === "password" ? "Analyze the password. Consider length, patterns, and character variety..." 
                : "Examine each URL closely. Check the root domain..."}
            </span>
          </div>
        )}

        {/* === ROUND CONTENT === */}
        {roundType === "phish" && <PhishContent round={round as PhishRound} showingResults={showingResults} highlightClues={highlightClues} />}
        {roundType === "password" && <PasswordContent round={round as PasswordRound} showingResults={showingResults} />}
        {roundType === "spot_url" && <URLContent round={round as SpotURLRound} showingResults={showingResults} highlightClues={highlightClues} />}

        {/* === ANSWER AREA === */}
        {!showingResults ? (
          <div className="flex flex-col gap-4 mt-4">
            {hasAnswered ? (
              <LockedInState players={room.players} currentQuestion={room.currentQuestion} answeredCount={answeredCount} color={roundColor} />
            ) : timeLeft <= 0 ? (
              <TimesUpState />
            ) : roundType === "phish" ? (
              <PhishButtons onAnswer={handleAnswer} />
            ) : roundType === "password" ? (
              <PasswordButtons round={round as PasswordRound} onAnswer={handleAnswer} />
            ) : (
              <URLButtons round={round as SpotURLRound} onAnswer={handleAnswer} />
            )}
          </div>
        ) : (
          <ResultsReveal
            round={round}
            room={room}
            wasCorrect={wasCorrect}
            playerStreak={playerStreak}
            showScorePopup={showScorePopup}
            showExplanation={showExplanation}
            highlightClues={highlightClues}
            showFunFact={showFunFact}
            isHost={isHost}
            onNextQuestion={() => { if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current); onNextQuestion(); }}
          />
        )}
      </div>

      {/* Sidebar leaderboard */}
      <div className="hidden w-80 shrink-0 flex-col p-6 lg:flex" style={{ borderLeft: "3px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)" }}>
        <Leaderboard players={room.players} myPlayerId={playerId} />
        {!showingResults && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl py-3" style={{ background: "rgba(255,255,255,0.03)" }}>
            <User className="h-4 w-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>{answeredCount}/{room.players.length} answered</span>
          </div>
        )}
      </div>
      <div className="px-3 pb-4 sm:px-4 sm:pb-6 lg:hidden">
        <Leaderboard players={room.players} myPlayerId={playerId} compact />
      </div>
    </div>
  );
}

/* ────────────────── PHISH ROUND CONTENT ──────────────────── */

function PhishContent({ round, showingResults, highlightClues }: { round: PhishRound; showingResults: boolean; highlightClues: boolean }) {
  return (
    <div className="animate-slide-up mb-1 overflow-hidden rounded-3xl border-[3px]"
      style={{
        background: "var(--cc-card)",
        borderColor: showingResults ? (round.isPhishing ? "rgba(255,45,120,0.4)" : "rgba(57,255,20,0.4)") : "rgba(255,255,255,0.08)",
        transition: "border-color 0.5s ease",
        boxShadow: showingResults ? `0 0 40px ${round.isPhishing ? "rgba(255,45,120,0.1)" : "rgba(57,255,20,0.1)"}` : "none",
      }}>
      <div className="px-4 py-3 sm:px-6 sm:py-4" style={{ borderBottom: "3px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>From</span>
            <span className="text-sm font-bold" style={{ color: "#00E5FF" }}>
              {round.from}{" "}
              <span className="font-mono text-xs" style={{
                color: showingResults && highlightClues && round.isPhishing ? "#FF2D78" : "rgba(255,255,255,0.35)",
                background: showingResults && highlightClues && round.isPhishing ? "rgba(255,45,120,0.1)" : "transparent",
                padding: showingResults && highlightClues && round.isPhishing ? "2px 6px" : "0",
                borderRadius: "6px", transition: "all 0.5s ease",
              }}>{"<"}{round.fromEmail}{">"}</span>
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Subject</span>
            <span className="text-sm font-bold" style={{ color: "#fff" }}>{round.subject}</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        <p className="whitespace-pre-line font-mono text-xs leading-relaxed sm:text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{round.body}</p>
      </div>
      {showingResults && (
        <div className="animate-pop-in flex items-center justify-center gap-3 px-6 py-5"
          style={{ background: round.isPhishing ? "rgba(255,45,120,0.08)" : "rgba(57,255,20,0.08)", borderTop: `3px solid ${round.isPhishing ? "rgba(255,45,120,0.2)" : "rgba(57,255,20,0.2)"}` }}>
          {round.isPhishing ? <Fish className="h-7 w-7" style={{ color: "#FF2D78" }} /> : <ShieldCheck className="h-7 w-7" style={{ color: "#39FF14" }} />}
          <span className="text-2xl font-black uppercase tracking-wider" style={{ color: round.isPhishing ? "#FF2D78" : "#39FF14" }}>
            {round.isPhishing ? "Phishing!" : "Legitimate!"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ────────────────── PASSWORD ROUND CONTENT ──────────────────── */

function PasswordContent({ round, showingResults }: { round: PasswordRound; showingResults: boolean }) {
  const strengthColors = ["#39FF14", "#FFB800", "#FF2D78"];
  const correctColor = strengthColors[round.correctAnswer] ?? "#FFB800";

  return (
    <div className="animate-slide-up mb-1 overflow-hidden rounded-3xl border-[3px]"
      style={{
        background: "var(--cc-card)",
        borderColor: showingResults ? `${correctColor}40` : "rgba(255,255,255,0.08)",
        transition: "border-color 0.5s ease",
      }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "3px solid rgba(255,255,255,0.06)", background: "rgba(168,85,247,0.03)" }}>
        <KeyRound className="h-5 w-5" style={{ color: "#A855F7" }} />
        <span className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: "#A855F7" }}>Rate This Password</span>
      </div>
      <div className="flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="rounded-2xl border-[3px] px-5 py-4 sm:px-8 sm:py-5" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="font-mono text-xl font-bold tracking-wider sm:text-2xl md:text-3xl" style={{ color: "#fff", wordBreak: "break-all" }}>
            {round.password}
          </p>
        </div>
      </div>
      {showingResults && (
        <div className="animate-pop-in flex items-center justify-center gap-3 px-6 py-5"
          style={{ background: `${correctColor}08`, borderTop: `3px solid ${correctColor}20` }}>
          <span className="text-2xl font-black uppercase tracking-wider" style={{ color: correctColor }}>
            {round.options[round.correctAnswer]}
          </span>
        </div>
      )}
    </div>
  );
}

/* ────────────────── URL ROUND CONTENT ──────────────────── */

function URLContent({ round, showingResults, highlightClues }: { round: SpotURLRound; showingResults: boolean; highlightClues: boolean }) {
  return (
    <div className="animate-slide-up mb-1 overflow-hidden rounded-3xl border-[3px]"
      style={{
        background: "var(--cc-card)",
        borderColor: showingResults ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)",
        transition: "border-color 0.5s ease",
      }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "3px solid rgba(255,255,255,0.06)", background: "rgba(249,115,22,0.03)" }}>
        <Globe className="h-5 w-5" style={{ color: "#F97316" }} />
        <span className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: "#F97316" }}>Spot the Real URL</span>
      </div>
      <div className="px-6 py-6">
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{round.scenario}</p>
      </div>
      {showingResults && (
        <div className="flex flex-col gap-2 px-6 pb-6">
          {round.urls.map((u, i) => (
            <div key={i} className="animate-pop-in flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: i === round.correctIndex ? "rgba(57,255,20,0.08)" : "rgba(255,45,120,0.05)",
                border: `2px solid ${i === round.correctIndex ? "rgba(57,255,20,0.3)" : "rgba(255,45,120,0.15)"}`,
                animationDelay: `${i * 0.1}s`,
              }}>
              {i === round.correctIndex ? <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#39FF14" }} /> : <XCircle className="h-5 w-5 shrink-0" style={{ color: "#FF2D78" }} />}
              <span className="font-mono text-sm" style={{ color: i === round.correctIndex ? "#39FF14" : "#FF2D78", wordBreak: "break-all" }}>{u.url}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────── ANSWER BUTTONS ──────────────────── */

function PhishButtons({ onAnswer }: { onAnswer: (a: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <button onClick={() => onAnswer(1)}
        className="jackbox-btn group flex flex-col items-center gap-2 rounded-2xl border-[3px] px-4 py-5 sm:gap-4 sm:rounded-3xl sm:px-6 sm:py-8"
        style={{ background: "rgba(255,45,120,0.06)", borderColor: "rgba(255,45,120,0.25)" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF2D78"; e.currentTarget.style.background = "rgba(255,45,120,0.12)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,45,120,0.15)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,45,120,0.25)"; e.currentTarget.style.background = "rgba(255,45,120,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
        <Fish className="h-10 w-10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-8deg] sm:h-14 sm:w-14" style={{ color: "#FF2D78" }} />
        <span className="text-lg font-black uppercase tracking-wide sm:text-2xl" style={{ color: "#FF2D78" }}>Phishing</span>
        <span className="hidden text-[11px] font-bold sm:block" style={{ color: "rgba(255,255,255,0.3)" }}>{"It's a scam!"}</span>
      </button>
      <button onClick={() => onAnswer(0)}
        className="jackbox-btn group flex flex-col items-center gap-2 rounded-2xl border-[3px] px-4 py-5 sm:gap-4 sm:rounded-3xl sm:px-6 sm:py-8"
        style={{ background: "rgba(57,255,20,0.04)", borderColor: "rgba(57,255,20,0.25)" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#39FF14"; e.currentTarget.style.background = "rgba(57,255,20,0.10)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(57,255,20,0.15)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(57,255,20,0.25)"; e.currentTarget.style.background = "rgba(57,255,20,0.04)"; e.currentTarget.style.boxShadow = "none"; }}>
        <ShieldCheck className="h-10 w-10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[8deg] sm:h-14 sm:w-14" style={{ color: "#39FF14" }} />
        <span className="text-lg font-black uppercase tracking-wide sm:text-2xl" style={{ color: "#39FF14" }}>Legit</span>
        <span className="hidden text-[11px] font-bold sm:block" style={{ color: "rgba(255,255,255,0.3)" }}>{"It's real!"}</span>
      </button>
    </div>
  );
}

function PasswordButtons({ round, onAnswer }: { round: PasswordRound; onAnswer: (a: number) => void }) {
  const colors = ["#39FF14", "#FFB800", "#FF2D78"];
  const icons = [ShieldCheck, AlertTriangle, XCircle];
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {round.options.map((opt, i) => {
        const Icon = icons[i];
        const color = colors[i];
        return (
          <button key={i} onClick={() => onAnswer(i)}
            className="jackbox-btn group flex flex-col items-center gap-2 rounded-2xl border-[3px] px-2 py-4 sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-6"
            style={{ background: `${color}08`, borderColor: `${color}25` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}15`; e.currentTarget.style.boxShadow = `0 0 25px ${color}20`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}25`; e.currentTarget.style.background = `${color}08`; e.currentTarget.style.boxShadow = "none"; }}>
            <Icon className="h-7 w-7 transition-transform duration-200 group-hover:scale-110 sm:h-10 sm:w-10" style={{ color }} />
            <span className="text-sm font-black uppercase tracking-wide sm:text-lg" style={{ color }}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function URLButtons({ round, onAnswer }: { round: SpotURLRound; onAnswer: (a: number) => void }) {
  const colors = ["#00E5FF", "#FF2D78", "#FFB800"];
  return (
    <div className="flex flex-col gap-3">
      {round.urls.map((u, i) => (
        <button key={i} onClick={() => onAnswer(i)}
          className="jackbox-btn group flex items-center gap-3 rounded-2xl border-[3px] px-3 py-3 text-left sm:gap-4 sm:px-5 sm:py-5"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors[i % colors.length]; e.currentTarget.style.background = `${colors[i % colors.length]}08`; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black"
            style={{ background: `${colors[i % colors.length]}15`, color: colors[i % colors.length] }}>
            {String.fromCharCode(65 + i)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm font-bold" style={{ color: "#fff", wordBreak: "break-all" }}>{u.url}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{u.label}</p>
          </div>
          <Link2 className="h-5 w-5 shrink-0 opacity-30 transition-opacity group-hover:opacity-100" style={{ color: colors[i % colors.length] }} />
        </button>
      ))}
    </div>
  );
}

/* ────────────────── SHARED STATES ──────────────────── */

function LockedInState({ players, currentQuestion, answeredCount, color }: { players: GameRoom["players"]; currentQuestion: number; answeredCount: number; color: string }) {
  return (
    <div className="animate-pop-in flex flex-col items-center gap-3 rounded-2xl border-[3px] px-5 py-5 sm:gap-4 sm:rounded-3xl sm:px-8 sm:py-8"
      style={{ background: "var(--cc-card)", borderColor: `${color}20` }}>
      <Lock className="h-8 w-8 animate-float sm:h-12 sm:w-12" style={{ color }} />
      <p className="text-lg font-black uppercase sm:text-2xl" style={{ color: "#fff" }}>Answer Locked In!</p>
      <div className="flex items-center gap-1.5">
        {players.map((p) => {
          const pAnswered = p.answers.length > currentQuestion;
          return <div key={p.id} className="h-3 w-3 rounded-full transition-all duration-300"
            style={{ background: pAnswered ? color : "rgba(255,255,255,0.1)", boxShadow: pAnswered ? `0 0 6px ${color}60` : "none" }} />;
        })}
      </div>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
        {answeredCount === players.length ? "All players answered! Revealing..." : `${answeredCount}/${players.length} players answered`}
      </span>
    </div>
  );
}

function TimesUpState() {
  return (
    <div className="animate-pop-in flex flex-col items-center gap-3 rounded-2xl border-[3px] px-5 py-5 sm:gap-4 sm:rounded-3xl sm:px-8 sm:py-8"
      style={{ background: "rgba(255,45,120,0.04)", borderColor: "rgba(255,45,120,0.2)" }}>
      <AlertTriangle className="h-8 w-8 animate-wiggle sm:h-12 sm:w-12" style={{ color: "#FF2D78" }} />
      <p className="text-lg font-black uppercase sm:text-2xl" style={{ color: "#FF2D78" }}>{"Time's Up!"}</p>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>You did not answer in time</span>
    </div>
  );
}

/* ────────────────── RESULTS REVEAL ──────────────────── */

function ResultsReveal({ round, room, wasCorrect, playerStreak, showScorePopup, showExplanation, highlightClues, showFunFact, isHost, onNextQuestion }: {
  round: GameRound; room: GameRoom; wasCorrect: boolean | null; playerStreak: number; showScorePopup: boolean;
  showExplanation: boolean; highlightClues: boolean; showFunFact: boolean; isHost: boolean; onNextQuestion: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Score popup */}
      {showScorePopup && (
        <div className="flex items-center justify-center gap-6">
          <div className="animate-pop-in flex items-center gap-3 rounded-2xl px-4 py-3 sm:gap-4 sm:px-6 sm:py-4"
            style={{
              background: wasCorrect ? "rgba(57,255,20,0.08)" : wasCorrect === false ? "rgba(255,45,120,0.08)" : "rgba(255,184,0,0.08)",
              border: `3px solid ${wasCorrect ? "rgba(57,255,20,0.3)" : wasCorrect === false ? "rgba(255,45,120,0.3)" : "rgba(255,184,0,0.3)"}`,
            }}>
            {wasCorrect === true ? (
              <>
                <CheckCircle2 className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" style={{ color: "#39FF14" }} />
                <div>
                  <p className="text-xl font-black uppercase sm:text-2xl" style={{ color: "#39FF14" }}>Correct!</p>
                  <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{playerStreak >= 2 ? `${playerStreak}x streak bonus!` : "Nice catch!"}</p>
                </div>
                <div className="ml-2 flex items-center gap-1">
                  <Award className="h-5 w-5" style={{ color: "#FFB800" }} />
                  <span className="text-xl font-black" style={{ color: "#FFB800" }}>+100</span>
                </div>
              </>
            ) : wasCorrect === false ? (
              <>
                <XCircle className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" style={{ color: "#FF2D78" }} />
                <div>
                  <p className="text-xl font-black uppercase sm:text-2xl" style={{ color: "#FF2D78" }}>Wrong!</p>
                  <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>Better luck next round</p>
                </div>
              </>
            ) : (
              <>
                <Clock className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" style={{ color: "#FFB800" }} />
                <div>
                  <p className="text-xl font-black uppercase sm:text-2xl" style={{ color: "#FFB800" }}>{"Time's Up!"}</p>
                  <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>No answer submitted</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Player answers grid */}
      <div className="animate-slide-up flex flex-wrap items-center justify-center gap-3 rounded-3xl border-[3px] px-6 py-4"
        style={{ background: "var(--cc-card)", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="mb-2 flex w-full items-center justify-center gap-2">
          <BarChart3 className="h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />
          <span className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>How everyone answered</span>
        </div>
        {room.players.map((p) => {
          const pAnswered = p.answers.length > room.currentQuestion;
          const pCorrect = pAnswered ? p.answers[room.currentQuestion] : null;
          return (
            <div key={p.id} className="flex flex-col items-center gap-1.5" title={p.name}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black transition-all duration-300"
                style={{
                  background: pCorrect === true ? "rgba(57,255,20,0.15)" : pCorrect === false ? "rgba(255,45,120,0.15)" : "rgba(255,184,0,0.1)",
                  border: `2px solid ${pCorrect === true ? "rgba(57,255,20,0.3)" : pCorrect === false ? "rgba(255,45,120,0.3)" : "rgba(255,184,0,0.2)"}`,
                  color: pCorrect === true ? "#39FF14" : pCorrect === false ? "#FF2D78" : "#FFB800",
                }}>
                {pCorrect === true ? <CheckCircle2 className="h-5 w-5" /> : pCorrect === false ? <XCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <span className="max-w-[52px] truncate text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{p.name}</span>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && round.explanation && (
        <div className="animate-slide-up flex gap-4 rounded-3xl border-[3px] px-6 py-5" style={{ background: "rgba(255,184,0,0.04)", borderColor: "rgba(255,184,0,0.15)" }}>
          <Lightbulb className="mt-0.5 h-6 w-6 shrink-0" style={{ color: "#FFB800" }} />
          <div>
            <p className="mb-2 text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: "#FFB800" }}>Explanation</p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{round.explanation}</p>
          </div>
        </div>
      )}

      {/* Clues */}
      {highlightClues && "clues" in round && round.clues.length > 0 && (
        <div className="animate-slide-up flex gap-4 rounded-3xl border-[3px] px-6 py-5" style={{ background: "rgba(0,229,255,0.03)", borderColor: "rgba(0,229,255,0.12)" }}>
          <Eye className="mt-0.5 h-6 w-6 shrink-0" style={{ color: "#00E5FF" }} />
          <div>
            <p className="mb-3 text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: "#00E5FF" }}>Key Clues</p>
            <div className="flex flex-wrap gap-2">
              {round.clues.map((clue: string, i: number) => (
                <span key={i} className="animate-pop-in flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
                  style={{ background: "rgba(0,229,255,0.08)", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.15)", animationDelay: `${i * 0.12}s` }}>
                  <Target className="h-3 w-3" /> {clue}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fun fact */}
      {showFunFact && round.funFact && (
        <div className="animate-slide-up flex gap-4 rounded-3xl border-[3px] px-6 py-5" style={{ background: "rgba(168,85,247,0.04)", borderColor: "rgba(168,85,247,0.12)" }}>
          <Info className="mt-0.5 h-6 w-6 shrink-0" style={{ color: "#A855F7" }} />
          <div>
            <p className="mb-2 text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: "#A855F7" }}>Did You Know?</p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{round.funFact}</p>
          </div>
        </div>
      )}

      {/* Next button */}
      {isHost ? (
        <button onClick={onNextQuestion}
          className="jackbox-btn flex items-center justify-center gap-3 rounded-2xl px-6 py-5 text-lg"
          style={{ background: "#00E5FF", color: "var(--cc-dark)", boxShadow: "0 4px 30px rgba(0,229,255,0.3)" }}>
          {room.currentQuestion < room.totalQuestions - 1 ? "Next Round" : "See Final Results"}
          <ChevronRight className="h-5 w-5" />
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 py-3">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#00E5FF" }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>Next round loading...</span>
        </div>
      )}
    </div>
  );
}
