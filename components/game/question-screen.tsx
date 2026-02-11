"use client"

import type { Question, Player } from "@/lib/game-store"
import { TIMER_DURATION, QUESTIONS } from "@/lib/game-store"
import { ShieldAlert, ShieldCheck, Mail, Clock } from "lucide-react"

interface QuestionScreenProps {
  question: Question
  questionIndex: number
  timeRemaining: number
  player: Player
  totalPlayers: number
  answeredCount: number
  onAnswer: (answer: "phishing" | "legit") => void
}

export function QuestionScreen({
  question,
  questionIndex,
  timeRemaining,
  player,
  totalPlayers,
  answeredCount,
  onAnswer,
}: QuestionScreenProps) {
  const hasAnswered = player.answered
  const isCritical = timeRemaining <= 5
  const progress = (timeRemaining / TIMER_DURATION) * 100

  return (
    <div className="flex min-h-screen flex-col px-4 py-6">
      {/* Top Bar */}
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
            {questionIndex + 1} / {QUESTIONS.length}
          </span>
          <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
            {player.score} pts
          </span>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center">
          <div
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-2xl font-black tabular-nums ${
              isCritical
                ? "bg-destructive/20 text-destructive animate-timer-tick"
                : "bg-card text-foreground"
            }`}
            role="timer"
            aria-live="assertive"
            aria-label={`${timeRemaining} seconds remaining`}
          >
            <Clock className="h-4 w-4" />
            {String(timeRemaining).padStart(2, "0")}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {Array.from({ length: Math.min(answeredCount, 5) }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full border-2 border-background bg-success"
              />
            ))}
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {answeredCount}/{totalPlayers}
          </span>
        </div>
      </header>

      {/* Timer Progress Bar */}
      <div className="mx-auto mb-6 h-2 w-full max-w-2xl overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical ? "bg-destructive" : "bg-primary"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
        {/* Email Card */}
        <div className="mb-8 w-full rounded-3xl bg-card p-6 jackbox-shadow animate-slide-up">
          <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {question.from}
              </p>
              <p className="text-xs font-semibold text-muted-foreground truncate">
                {question.subject}
              </p>
            </div>
          </div>
          <div className="whitespace-pre-line text-sm leading-relaxed text-card-foreground/90 font-mono">
            {question.body}
          </div>
        </div>

        {/* Answer Buttons */}
        {hasAnswered ? (
          <div className="flex w-full flex-col items-center gap-3 animate-bounce-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">Answer locked in!</p>
            <p className="text-sm text-muted-foreground">
              Waiting for other players...
            </p>
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-4">
            <button
              onClick={() => onAnswer("phishing")}
              className="flex flex-col items-center gap-2 rounded-2xl bg-coral px-6 py-6 text-base font-black text-coral-foreground jackbox-shadow-coral transition-all hover:brightness-105 active:pressed uppercase tracking-wider"
            >
              <ShieldAlert className="h-8 w-8" />
              Phishing
            </button>
            <button
              onClick={() => onAnswer("legit")}
              className="flex flex-col items-center gap-2 rounded-2xl bg-teal px-6 py-6 text-base font-black text-teal-foreground jackbox-shadow-teal transition-all hover:brightness-105 active:pressed uppercase tracking-wider"
            >
              <ShieldCheck className="h-8 w-8" />
              Legit
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
