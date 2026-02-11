"use client"

import type { Player } from "@/lib/game-store"

interface LeaderboardProps {
  players: Player[]
  currentPlayerId: string
  compact?: boolean
}

export function Leaderboard({
  players,
  currentPlayerId,
  compact = false,
}: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div
      className={`rounded-xl border border-border bg-card ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2
          className={`font-semibold text-foreground uppercase tracking-wider ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          Leaderboard
        </h2>
        <span className="text-xs font-mono text-muted-foreground">
          LIVE
        </span>
      </div>
      <div className="space-y-1.5" role="list" aria-label="Player rankings">
        {sorted.map((player, i) => {
          const isCurrentPlayer = player.id === currentPlayerId
          const rank = i + 1

          return (
            <div
              key={player.id}
              role="listitem"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 ${
                isCurrentPlayer
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-secondary/30"
              }`}
            >
              {/* Rank */}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold font-mono ${
                  rank === 1
                    ? "bg-primary/20 text-primary"
                    : rank === 2
                    ? "bg-muted text-muted-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {rank}
              </div>

              {/* Name */}
              <span
                className={`flex-1 truncate text-sm font-mono ${
                  isCurrentPlayer
                    ? "text-primary font-semibold"
                    : "text-foreground"
                }`}
              >
                {player.name}
                {isCurrentPlayer && (
                  <span className="ml-1.5 text-xs text-primary/60">
                    (you)
                  </span>
                )}
              </span>

              {/* Score */}
              <span
                className={`text-sm font-bold font-mono tabular-nums ${
                  rank === 1 ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {player.score}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
