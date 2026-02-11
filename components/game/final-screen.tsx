"use client"

import type { Room } from "@/lib/game-store"
import { Trophy, Medal, RotateCcw } from "lucide-react"

interface FinalScreenProps {
  room: Room
  playerId: string
  isHost: boolean
  onPlayAgain: () => void
}

function Confetti() {
  const colors = ["oklch(0.87 0.17 85)", "oklch(0.72 0.19 30)", "oklch(0.72 0.14 195)", "oklch(0.72 0.19 165)", "oklch(0.72 0.16 310)"]
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-3 w-3 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 10}%`,
            animation: `confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export function FinalScreen({ room, playerId, isHost, onPlayAgain }: FinalScreenProps) {
  const sorted = [...room.players].sort((a, b) => b.score - a.score)
  const currentPlayer = sorted.find((p) => p.id === playerId)
  const currentRank = sorted.findIndex((p) => p.id === playerId) + 1
  const winner = sorted[0]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Confetti />

      <main id="main-content" className="relative z-10 w-full max-w-md">
        {/* Title */}
        <div className="mb-8 flex flex-col items-center animate-bounce-in">
          <Trophy className="mb-3 h-14 w-14 text-primary" />
          <h1 className="text-4xl font-black text-foreground">GAME OVER</h1>
        </div>

        {/* Podium - Top 3 */}
        {sorted.length >= 2 && (
          <div className="mb-6 flex items-end justify-center gap-3" aria-label="Top 3 players">
            {/* 2nd Place */}
            {sorted[1] && (
              <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "200ms" }}>
                <div
                  className="mb-2 flex h-14 w-14 items-center justify-center rounded-full text-xl font-black text-primary-foreground"
                  style={{ backgroundColor: sorted[1].color }}
                >
                  {sorted[1].name.charAt(0).toUpperCase()}
                </div>
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-t-2xl bg-teal">
                  <Medal className="h-5 w-5 text-teal-foreground" />
                  <span className="text-xs font-bold text-teal-foreground">2nd</span>
                </div>
                <p className="mt-1 max-w-[80px] truncate text-xs font-bold text-foreground">{sorted[1].name}</p>
                <p className="text-xs font-bold text-muted-foreground font-mono">{sorted[1].score}</p>
              </div>
            )}

            {/* 1st Place */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div
                className="mb-2 flex h-18 w-18 items-center justify-center rounded-full text-2xl font-black text-primary-foreground ring-4 ring-primary"
                style={{ backgroundColor: winner.color, width: "4.5rem", height: "4.5rem" }}
              >
                {winner.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex h-28 w-24 flex-col items-center justify-center rounded-t-2xl bg-primary">
                <Trophy className="h-6 w-6 text-primary-foreground" />
                <span className="text-sm font-bold text-primary-foreground">1st</span>
              </div>
              <p className="mt-1 max-w-[96px] truncate text-sm font-bold text-foreground">{winner.name}</p>
              <p className="text-sm font-black text-primary font-mono">{winner.score}</p>
            </div>

            {/* 3rd Place */}
            {sorted[2] && (
              <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "300ms" }}>
                <div
                  className="mb-2 flex h-14 w-14 items-center justify-center rounded-full text-xl font-black text-primary-foreground"
                  style={{ backgroundColor: sorted[2].color }}
                >
                  {sorted[2].name.charAt(0).toUpperCase()}
                </div>
                <div className="flex h-16 w-20 flex-col items-center justify-center rounded-t-2xl bg-coral">
                  <Medal className="h-5 w-5 text-coral-foreground" />
                  <span className="text-xs font-bold text-coral-foreground">3rd</span>
                </div>
                <p className="mt-1 max-w-[80px] truncate text-xs font-bold text-foreground">{sorted[2].name}</p>
                <p className="text-xs font-bold text-muted-foreground font-mono">{sorted[2].score}</p>
              </div>
            )}
          </div>
        )}

        {/* Your Score */}
        {currentPlayer && (
          <div className="mb-4 rounded-2xl bg-card p-5 text-center jackbox-shadow animate-slide-up" style={{ animationDelay: "400ms" }}>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Score</p>
            <p className="text-4xl font-black text-primary font-mono">{currentPlayer.score}</p>
            <p className="text-sm text-muted-foreground">
              Rank #{currentRank} of {sorted.length}
            </p>
          </div>
        )}

        {/* Full Rankings */}
        <div className="mb-6 rounded-2xl bg-card p-4 jackbox-shadow animate-slide-up" style={{ animationDelay: "500ms" }}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">All Players</h3>
          <div className="flex flex-col gap-1.5" role="list" aria-label="Final rankings">
            {sorted.map((player, i) => {
              const isYou = player.id === playerId
              return (
                <div
                  key={player.id}
                  role="listitem"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                    isYou ? "bg-primary/10" : "bg-secondary/30"
                  }`}
                >
                  <span className="w-6 text-center text-xs font-black text-muted-foreground">#{i + 1}</span>
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`flex-1 truncate text-sm font-bold ${isYou ? "text-primary" : "text-foreground"}`}>
                    {player.name}
                  </span>
                  <span className="text-sm font-black tabular-nums font-mono text-foreground">{player.score}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Play Again */}
        {isHost ? (
          <button
            onClick={onPlayAgain}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-5 text-lg font-black text-primary-foreground jackbox-shadow-primary transition-all hover:brightness-105 active:pressed"
          >
            <RotateCcw className="h-5 w-5" />
            Play Again
          </button>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Waiting for host to start a new game...
          </p>
        )}
      </main>
    </div>
  )
}
