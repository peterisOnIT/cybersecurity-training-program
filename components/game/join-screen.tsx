"use client"

import { useState } from "react"
import type { Player } from "@/lib/game-store"

interface JoinScreenProps {
  onJoin: (name: string) => void
  players: Player[]
  onStartGame: () => void
}

export function JoinScreen({ onJoin, players, onStartGame }: JoinScreenProps) {
  const [name, setName] = useState("")
  const [hasJoined, setHasJoined] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 1 || trimmed.length > 20) return
    onJoin(trimmed)
    setHasJoined(true)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 cyber-grid">
      <div className="fixed inset-0 scanline" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Title */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary tracking-wider uppercase">
              Live Game
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground glow-green">
            CYBER CLASH
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Phish or Legit?
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Can you spot the phishing attacks?
          </p>
        </div>

        {!hasJoined ? (
          /* Join Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 glow-box-green">
              <label
                htmlFor="player-name"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Enter your name to join
              </label>
              <input
                id="player-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your hacker alias..."
                maxLength={20}
                autoFocus
                autoComplete="off"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={name.trim().length < 1}
              className="w-full rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Join Game
            </button>
          </form>
        ) : (
          /* Waiting Lobby */
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 glow-box-green">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Players in Lobby
                </h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-mono text-primary">
                  {players.length}
                </span>
              </div>
              <div className="space-y-2">
                {players.map((player, i) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-2.5 animate-in fade-in slide-in-from-left-4"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <span className="text-sm font-medium text-foreground font-mono">
                      {player.name}
                    </span>
                    {i === 0 && (
                      <span className="ml-auto text-xs text-primary/70">
                        you
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onStartGame}
              disabled={players.length < 1}
              className="w-full rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start Game ({players.length} player{players.length !== 1 ? "s" : ""})
            </button>
            <p className="text-center text-xs text-muted-foreground/60">
              Bot players will join to simulate multiplayer
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
