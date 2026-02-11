"use client"

import type { Question, Player, Room } from "@/lib/game-store"
import { QUESTIONS } from "@/lib/game-store"
import { ShieldAlert, ShieldCheck, Lightbulb, ArrowRight, BarChart3 } from "lucide-react"

interface RevealScreenProps {
  room: Room
  playerId: string
  isHost: boolean
  onShowScores: () => void
  onNext: () => void
}

export function RevealScreen({ room, playerId, isHost, onShowScores, onNext }: RevealScreenProps) {
  const question = QUESTIONS[room.questionIndex]
  if (!question) return null

  const player = room.players.find((p) => p.id === playerId)
  const wasCorrect = player?.lastCorrect ?? false
  const correctCount = room.players.filter((p) => p.lastCorrect === true).length
  const isLast = room.questionIndex >= QUESTIONS.length - 1

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <main id="main-content" className="w-full max-w-lg">
        {/* Result Header */}
        <div className="mb-6 flex flex-col items-center animate-bounce-in">
          {wasCorrect ? (
            <>
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-success jackbox-shadow-success">
                <ShieldCheck className="h-10 w-10 text-success-foreground" />
              </div>
              <h2 className="text-3xl font-black text-success">Correct!</h2>
              {player && player.streak > 1 && (
                <p className="mt-1 text-sm font-bold text-primary">
                  {player.streak}x streak bonus!
                </p>
              )}
            </>
          ) : (
            <>
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-destructive jackbox-shadow-coral">
                <ShieldAlert className="h-10 w-10 text-destructive-foreground" />
              </div>
              <h2 className="text-3xl font-black text-destructive">
                {player?.answered ? "Wrong!" : "Time's Up!"}
              </h2>
            </>
          )}
        </div>

        {/* Correct Answer */}
        <div className="mb-4 rounded-2xl bg-card p-5 jackbox-shadow animate-slide-up" style={{ animationDelay: "100ms" }}>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            The answer was
          </p>
          <div className="flex items-center gap-2">
            {question.correctAnswer === "phishing" ? (
              <ShieldAlert className="h-5 w-5 text-coral" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-teal" />
            )}
            <span className="text-xl font-black capitalize text-foreground">
              {question.correctAnswer}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {correctCount} of {room.players.length} players got it right
          </p>
        </div>

        {/* Explanation */}
        <div className="mb-4 rounded-2xl bg-primary/10 border-2 border-primary/20 p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Why?
            </p>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {question.explanation}
          </p>
        </div>

        {/* Clues */}
        <div className="mb-8 flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: "300ms" }}>
          {question.clues.map((clue) => (
            <span
              key={clue}
              className="rounded-full bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground"
            >
              {clue}
            </span>
          ))}
        </div>

        {/* Host controls */}
        {isHost && (
          <div className="flex gap-3 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <button
              onClick={onShowScores}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-card px-6 py-4 text-base font-bold text-foreground jackbox-shadow transition-all hover:brightness-105 active:pressed"
            >
              <BarChart3 className="h-5 w-5" />
              Scores
            </button>
            <button
              onClick={onNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground jackbox-shadow-primary transition-all hover:brightness-105 active:pressed"
            >
              {isLast ? "Final Results" : "Next"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {!isHost && (
          <p className="text-center text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: "400ms" }}>
            Waiting for host to continue...
          </p>
        )}
      </main>
    </div>
  )
}
