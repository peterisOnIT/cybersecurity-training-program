"use client"

import type { Room } from "@/lib/game-store"
import { QUESTIONS } from "@/lib/game-store"
import { Trophy, ArrowRight } from "lucide-react"

interface ScoresScreenProps {
  room: Room
  playerId: string
  isHost: boolean
  onNext: () => void
}

export function ScoresScreen({ room, playerId, isHost, onNext }: ScoresScreenProps) {
  const sorted = [...room.players].sort((a, b) => b.score - a.score)
  const isLast = room.questionIndex >= QUESTIONS.length - 1

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <main id="main-content" className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Trophy className="mb-3 h-10 w-10 text-primary animate-bounce-in" />
          <h2 className="text-3xl font-black text-foreground">Leaderboard</h2>
          <p className="text-sm text-muted-foreground">
            After question {room.questionIndex + 1} of {QUESTIONS.length}
          </p>
        </div>

        <div className="mb-8 rounded-3xl bg-card p-5 jackbox-shadow">
          <div className="flex flex-col gap-2" role="list" aria-label="Player rankings">
            {sorted.map((player, i) => {
              const isYou = player.id === playerId
              const rank = i + 1

              return (
                <div
                  key={player.id}
                  role="listitem"
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all animate-slide-up ${
                    rank === 1
                      ? "bg-primary/15 border-2 border-primary/30"
                      : "bg-secondary/50"
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Rank */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                      rank === 1
                        ? "bg-primary text-primary-foreground"
                        : rank === 2
                        ? "bg-teal text-teal-foreground"
                        : rank === 3
                        ? "bg-coral text-coral-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {rank}
                  </div>

                  {/* Player bubble */}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <span className={`flex-1 truncate text-sm font-bold ${isYou ? "text-primary" : "text-foreground"}`}>
                    {player.name}
                    {isYou && (
                      <span className="ml-1 text-xs text-primary/60">(you)</span>
                    )}
                  </span>

                  {/* Score */}
                  <span className={`text-base font-black tabular-nums font-mono ${rank === 1 ? "text-primary" : "text-foreground"}`}>
                    {player.score}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={onNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-5 text-lg font-black text-primary-foreground jackbox-shadow-primary transition-all hover:brightness-105 active:pressed"
          >
            {isLast ? "Final Results" : "Next Question"}
            <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Waiting for host to continue...
          </p>
        )}
      </main>
    </div>
  )
}
