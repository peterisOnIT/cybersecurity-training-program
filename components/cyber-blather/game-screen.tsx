"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Clock, MessageSquare, CheckCircle2, Eye, Shield, Users, XCircle, ChevronRight } from "lucide-react";
import type { BlatherRoom } from "@/lib/blather-room";

const AVATAR_COLORS = ["#FFB800", "#00E5FF", "#39FF14", "#FF2D78", "#A855F7", "#F97316", "#06B6D4", "#EC4899"];

interface GameScreenProps {
  room: BlatherRoom;
  playerId: string;
  isHost: boolean;
  onSendSentence: (template: string, filled: string) => void;
  onSubmitGuess: (guess: string) => void;
  onEndRound: () => void;
  onNextRound: () => void;
}

export function BlatherGameScreen({
  room,
  playerId,
  isHost,
  onSendSentence,
  onSubmitGuess,
  onEndRound,
  onNextRound,
}: GameScreenProps) {
  const round = room.rounds[room.currentRound];
  const isDescriber = round?.describerId === playerId;
  const word = room.wordBank[round?.wordIndex ?? 0];
  const isRoundResults = room.status === "round_results";

  const [timeLeft, setTimeLeft] = useState(90);
  const [guess, setGuess] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const sentencesEndRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (!round || isRoundResults) return;
    const tick = () => {
      const elapsed = (Date.now() - round.startedAt) / 1000;
      const remaining = Math.max(0, round.timeLimit - elapsed);
      setTimeLeft(Math.ceil(remaining));
      if (remaining <= 0) {
        if (isHost || isDescriber) {
          onEndRound();
        }
      }
    };
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [round, isRoundResults, isHost, isDescriber, onEndRound]);

  // Auto-scroll sentences
  useEffect(() => {
    sentencesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [round?.sentencesSent.length]);

  const handleSendSentence = useCallback(() => {
    if (selectedTemplate === null || !selectedOption || !word) return;
    const template = word.sentences[selectedTemplate].template;
    const filled = template.replace("___", selectedOption);
    onSendSentence(template, filled);
    setSelectedTemplate(null);
    setSelectedOption(null);
  }, [selectedTemplate, selectedOption, word, onSendSentence]);

  const handleGuess = useCallback(() => {
    if (!guess.trim()) return;
    onSubmitGuess(guess.trim());
    setGuess("");
  }, [guess, onSubmitGuess]);

  const me = room.players.find((p) => p.id === playerId);
  const describer = room.players.find((p) => p.id === round?.describerId);
  const describerIndex = room.players.findIndex((p) => p.id === round?.describerId);
  const describerColor = AVATAR_COLORS[describerIndex % AVATAR_COLORS.length];

  const timerColor = timeLeft > 30 ? "#39FF14" : timeLeft > 10 ? "#FFB800" : "#FF2D78";

  // Round results view
  if (isRoundResults) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-3 sm:p-4" style={{ background: "var(--cc-dark)" }}>
        <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6 sm:gap-8">
          {/* Answer reveal */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              The answer was
            </p>
            <h2 className="animate-pop-in text-3xl font-black sm:text-5xl" style={{ color: "#FFB800" }}>
              {word?.word ?? "???"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                style={{ background: "rgba(0,229,255,0.1)", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.2)" }}>
                {word?.category}
              </span>
              <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                style={{
                  background: word?.difficulty === "easy" ? "rgba(57,255,20,0.1)" : word?.difficulty === "medium" ? "rgba(255,184,0,0.1)" : "rgba(255,45,120,0.1)",
                  color: word?.difficulty === "easy" ? "#39FF14" : word?.difficulty === "medium" ? "#FFB800" : "#FF2D78",
                  border: `1px solid ${word?.difficulty === "easy" ? "rgba(57,255,20,0.2)" : word?.difficulty === "medium" ? "rgba(255,184,0,0.2)" : "rgba(255,45,120,0.2)"}`,
                }}>
                {word?.difficulty}
              </span>
            </div>
          </div>

          {/* Described by */}
          <div className="flex items-center gap-3 rounded-2xl border-[3px] px-4 py-3" style={{ borderColor: `${describerColor}30`, background: `${describerColor}08` }}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black"
              style={{ background: describerColor, color: "var(--cc-dark)" }}
            >
              {describer?.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
              Described by <span style={{ color: describerColor }} className="font-black">{describer?.name}</span>
            </p>
          </div>

          {/* Who guessed correctly */}
          <div className="w-full">
            <h3 className="mb-3 text-center text-xs font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              Correct Guesses
            </h3>
            <div className="flex flex-col gap-2">
              {round.correctGuessers.length === 0 ? (
                <p className="text-center text-sm font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Nobody guessed it this round
                </p>
              ) : (
                round.correctGuessers.map((gId, i) => {
                  const guesser = room.players.find((p) => p.id === gId);
                  const gIdx = room.players.findIndex((p) => p.id === gId);
                  const gColor = AVATAR_COLORS[gIdx % AVATAR_COLORS.length];
                  return (
                    <div
                      key={gId}
                      className="animate-slide-in-left flex items-center gap-3 rounded-xl border-[3px] px-3 py-2 sm:px-4 sm:py-3"
                      style={{
                        background: `${gColor}08`,
                        borderColor: `${gColor}25`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-black" style={{ background: gColor, color: "var(--cc-dark)" }}>
                        {i + 1}
                      </span>
                      <p className="flex-1 text-sm font-black" style={{ color: gColor }}>
                        {guesser?.name}
                      </p>
                      <CheckCircle2 className="h-4 w-4" style={{ color: "#39FF14" }} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Scoreboard snapshot */}
          <div className="w-full">
            <h3 className="mb-3 text-center text-xs font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              Scores
            </h3>
            <div className="flex flex-col gap-1.5">
              {[...room.players]
                .sort((a, b) => b.score - a.score)
                .map((p, i) => {
                  const pIdx = room.players.findIndex((pl) => pl.id === p.id);
                  const pColor = AVATAR_COLORS[pIdx % AVATAR_COLORS.length];
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <span className="w-5 text-center text-xs font-black" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {i + 1}
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-black" style={{ background: pColor, color: "var(--cc-dark)" }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="flex-1 text-sm font-bold" style={{ color: p.id === playerId ? pColor : "#fff" }}>
                        {p.name}
                      </p>
                      <span className="text-sm font-black tabular-nums" style={{ color: pColor }}>
                        {p.score}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Next round button (host only) */}
          {isHost && (
            <button
              onClick={onNextRound}
              className="jackbox-btn flex items-center gap-2 rounded-2xl border-[3px] px-8 py-4 text-lg"
              style={{ borderColor: "#39FF14", background: "rgba(57,255,20,0.1)", color: "#39FF14" }}
            >
              <ChevronRight className="h-5 w-5" />
              {room.currentRound + 1 >= room.totalRounds ? "See Final Results" : "Next Round"}
            </button>
          )}

          {!isHost && (
            <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
              Waiting for host to continue...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Active describing round
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: "var(--cc-dark)" }}>
      {/* Header bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b-[3px] px-3 py-2.5 sm:px-5 sm:py-3" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(11,15,26,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" style={{ color: "#FFB800" }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
            Round {room.currentRound + 1}/{room.totalRounds}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ color: timerColor }} />
          <span className="text-lg font-black tabular-nums" style={{ color: timerColor }}>
            {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />
          <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
            {round.correctGuessers.length}/{room.players.length - 1} guessed
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center p-3 sm:p-4">
        <div className="flex w-full max-w-2xl flex-1 flex-col gap-4">
          {/* Describer info bar */}
          <div className="flex items-center gap-3 rounded-2xl border-[3px] px-4 py-3" style={{ borderColor: `${describerColor}30`, background: `${describerColor}08` }}>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black"
              style={{ background: describerColor, color: "var(--cc-dark)" }}
            >
              {describer?.name.charAt(0).toUpperCase()}
            </div>
            {isDescriber ? (
              <div className="flex-1">
                <p className="text-sm font-black" style={{ color: describerColor }}>
                  {"You are describing!"}
                </p>
                <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {"Select sentence templates below to give clues"}
                </p>
              </div>
            ) : (
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <span style={{ color: describerColor }} className="font-black">{describer?.name}</span> is describing
                </p>
                <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Watch the clues and type your guess below
                </p>
              </div>
            )}
          </div>

          {/* Secret word (only for describer) */}
          {isDescriber && word && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border-[3px] px-5 py-4" style={{ borderColor: "rgba(255,184,0,0.3)", background: "rgba(255,184,0,0.06)" }}>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                Your secret word
              </p>
              <h2 className="text-2xl font-black sm:text-3xl" style={{ color: "#FFB800" }}>
                {word.word}
              </h2>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider" style={{ background: "rgba(0,229,255,0.1)", color: "#00E5FF" }}>
                  {word.category}
                </span>
              </div>
              {word.tabooWords.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                  <XCircle className="h-3 w-3" style={{ color: "#FF2D78" }} />
                  <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>Taboo:</span>
                  {word.tabooWords.map((tw) => (
                    <span key={tw} className="rounded-md px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,45,120,0.1)", color: "#FF2D78" }}>
                      {tw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clues / sentences sent */}
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border-[3px] p-3 sm:p-4" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", minHeight: "120px", maxHeight: "300px" }}>
            <p className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
              Clues Given
            </p>
            {round.sentencesSent.length === 0 ? (
              <p className="py-6 text-center text-sm font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>
                {isDescriber ? "Send your first clue below!" : "Waiting for clues..."}
              </p>
            ) : (
              round.sentencesSent.map((s, i) => (
                <div
                  key={i}
                  className="animate-slide-in-left flex items-start gap-2 rounded-xl px-3 py-2"
                  style={{ background: "rgba(255,184,0,0.06)", animationDelay: `${i * 50}ms` }}
                >
                  <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#FFB800" }} />
                  <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {s.filled}
                  </p>
                </div>
              ))
            )}
            <div ref={sentencesEndRef} />
          </div>

          {/* Who has guessed indicator */}
          <div className="flex flex-wrap items-center gap-2">
            {room.players
              .filter((p) => p.id !== round.describerId)
              .map((p) => {
                const pIdx = room.players.findIndex((pl) => pl.id === p.id);
                const pColor = AVATAR_COLORS[pIdx % AVATAR_COLORS.length];
                const guessed = p.hasGuessedCorrectly;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{
                      background: guessed ? "rgba(57,255,20,0.1)" : "rgba(255,255,255,0.03)",
                      border: `2px solid ${guessed ? "rgba(57,255,20,0.3)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div className="h-2 w-2 rounded-full" style={{ background: guessed ? "#39FF14" : pColor }} />
                    <span className="text-[10px] font-bold" style={{ color: guessed ? "#39FF14" : "rgba(255,255,255,0.4)" }}>
                      {p.name}
                    </span>
                    {guessed && <CheckCircle2 className="h-3 w-3" style={{ color: "#39FF14" }} />}
                  </div>
                );
              })}
          </div>

          {/* Action area */}
          {isDescriber ? (
            <DescriberPanel
              word={word}
              selectedTemplate={selectedTemplate}
              selectedOption={selectedOption}
              setSelectedTemplate={setSelectedTemplate}
              setSelectedOption={setSelectedOption}
              onSend={handleSendSentence}
              onEndRound={onEndRound}
            />
          ) : (
            <GuesserPanel
              guess={guess}
              setGuess={setGuess}
              onGuess={handleGuess}
              hasGuessed={me?.hasGuessedCorrectly ?? false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Describer Panel ────────────────────────────────────────────────────────

function DescriberPanel({
  word,
  selectedTemplate,
  selectedOption,
  setSelectedTemplate,
  setSelectedOption,
  onSend,
  onEndRound,
}: {
  word: BlatherRoom["wordBank"][0] | undefined;
  selectedTemplate: number | null;
  selectedOption: string | null;
  setSelectedTemplate: (v: number | null) => void;
  setSelectedOption: (v: string | null) => void;
  onSend: () => void;
  onEndRound: () => void;
}) {
  if (!word) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-[3px] p-3 sm:p-4" style={{ borderColor: "rgba(255,184,0,0.15)", background: "rgba(255,184,0,0.04)" }}>
      <p className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
        {selectedTemplate === null ? "Choose a sentence template" : "Pick a word to fill in"}
      </p>

      {selectedTemplate === null ? (
        <div className="flex flex-col gap-2">
          {word.sentences.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedTemplate(i)}
              className="jackbox-btn rounded-xl border-[2px] px-4 py-3 text-left text-sm font-bold transition-all"
              style={{
                borderColor: "rgba(255,184,0,0.2)",
                background: "rgba(255,184,0,0.06)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {s.template.replace("___", "______")}
            </button>
          ))}
          <button
            onClick={onEndRound}
            className="mt-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Skip / End Round
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
            {word.sentences[selectedTemplate].template.replace("___", "______")}
          </p>
          <div className="flex flex-wrap gap-2">
            {word.sentences[selectedTemplate].options.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt)}
                className="jackbox-btn rounded-lg border-[2px] px-3 py-2 text-sm font-bold transition-all"
                style={{
                  borderColor: selectedOption === opt ? "#FFB800" : "rgba(255,255,255,0.1)",
                  background: selectedOption === opt ? "rgba(255,184,0,0.15)" : "rgba(255,255,255,0.03)",
                  color: selectedOption === opt ? "#FFB800" : "rgba(255,255,255,0.6)",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedTemplate(null); setSelectedOption(null); }}
              className="rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:bg-white/5"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Back
            </button>
            <button
              onClick={onSend}
              disabled={!selectedOption}
              className="jackbox-btn flex flex-1 items-center justify-center gap-2 rounded-lg border-[2px] px-4 py-2 text-sm font-bold disabled:opacity-40"
              style={{ borderColor: "#FFB800", background: "rgba(255,184,0,0.1)", color: "#FFB800" }}
            >
              <Send className="h-4 w-4" />
              Send Clue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Guesser Panel ──────────────────────────────────────────────────────────

function GuesserPanel({
  guess,
  setGuess,
  onGuess,
  hasGuessed,
}: {
  guess: string;
  setGuess: (v: string) => void;
  onGuess: () => void;
  hasGuessed: boolean;
}) {
  if (hasGuessed) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border-[3px] px-5 py-4" style={{ borderColor: "rgba(57,255,20,0.3)", background: "rgba(57,255,20,0.06)" }}>
        <CheckCircle2 className="h-6 w-6" style={{ color: "#39FF14" }} />
        <p className="text-lg font-black" style={{ color: "#39FF14" }}>
          You got it!
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 rounded-2xl border-[3px] p-2" style={{ borderColor: "rgba(0,229,255,0.15)", background: "rgba(0,229,255,0.04)" }}>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onGuess(); }}
        placeholder="Type your guess..."
        maxLength={60}
        autoComplete="off"
        className="flex-1 rounded-xl border-none bg-transparent px-3 py-3 text-sm font-bold outline-none placeholder:text-white/20 sm:text-base"
        style={{ color: "#fff" }}
      />
      <button
        onClick={onGuess}
        disabled={!guess.trim()}
        className="jackbox-btn flex items-center gap-2 rounded-xl border-[2px] px-4 py-2 text-sm font-bold disabled:opacity-40"
        style={{ borderColor: "#00E5FF", background: "rgba(0,229,255,0.1)", color: "#00E5FF" }}
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">Guess</span>
      </button>
    </div>
  );
}


