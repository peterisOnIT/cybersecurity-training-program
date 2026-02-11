"use client"

import type { Player } from "@/lib/game-store"

interface FinalScreenProps {
  players: Player[]
  currentPlayerId: string
  onPlayAgain: () => void
}

export function FinalScreen({
  players,
  currentPlayerId,
  onPlayAgain,
}: FinalScreenProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const currentPlayer = sorted.find((p) => p.id === currentPlayerId)
  const currentRank = sorted.findIndex((p) => p.id === currentPlayerId) + 1

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 cyber-grid">
      <div className="fixed inset-0 scanline" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-foreground glow-green">
            GAME OVER
          </h1>
          <p className="text-muted-foreground">Final Results</p>
        </div>

        {/* Your result */}
        {currentPlayer && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-6 glow-box-green">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Your Score
            </p>
            <p className="text-5xl font-bold text-primary font-mono">
              {currentPlayer.score}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Rank #{currentRank} of {sorted.length}
            </p>
          </div>
        )}

        {/* Full rankings */}
        <div className="mb-8 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
            Final Rankings
          </h2>
          <div className="space-y-2" role="list" aria-label="Final rankings">
            {sorted.map((player, i) => {
              const isYou = player.id === currentPlayerId
              return (
                <div
                  key={player.id}
                  role="listitem"
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${
                    isYou
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-secondary/30"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold font-mono ${
                      i === 0
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    #{i + 1}
                  </div>
                  <span
                    className={`flex-1 text-left text-sm font-mono ${
                      isYou ? "text-primary font-semibold" : "text-foreground"
                    }`}
                  >
                    {player.name}
                    {isYou && (
                      <span className="ml-1 text-xs text-primary/60">
                        (you)
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      i === 0 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {player.score} pts
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
