"use client"

import type { Room, Player } from "@/lib/game-store"
import { Crown, Copy, Check } from "lucide-react"
import { useState } from "react"

interface LobbyScreenProps {
  room: Room
  playerId: string
  onStart: () => void
}

function PlayerBubble({ player, isHost, index }: { player: Player; isHost: boolean; index: number }) {
  return (
    <div
      className="flex flex-col items-center gap-2 animate-bounce-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black jackbox-shadow-sm text-primary-foreground"
          style={{ backgroundColor: player.color }}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>
        {isHost && (
          <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary jackbox-shadow-sm">
            <Crown className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        )}
      </div>
      <span className="max-w-[80px] truncate text-sm font-bold text-foreground">
        {player.name}
      </span>
    </div>
  )
}

export function LobbyScreen({ room, playerId, onStart }: LobbyScreenProps) {
  const isHost = playerId === room.hostId
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(room.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // Clipboard not available
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <main id="main-content" className="flex w-full max-w-lg flex-col items-center">
        {/* Room Code Display */}
        <div className="mb-8 flex flex-col items-center animate-bounce-in">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Room Code
          </p>
          <button
            onClick={copyCode}
            className="group flex items-center gap-3 rounded-2xl bg-card px-8 py-4 jackbox-shadow transition-all hover:brightness-105 active:pressed"
          >
            <span className="text-5xl font-black tracking-[0.25em] text-primary font-mono">
              {room.code}
            </span>
            {copied ? (
              <Check className="h-6 w-6 text-success" />
            ) : (
              <Copy className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
          <p className="mt-3 text-sm text-muted-foreground">
            Share this code with your friends to join
          </p>
        </div>

        {/* Players Grid */}
        <div className="mb-8 w-full rounded-3xl bg-card p-6 jackbox-shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Players
            </h2>
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
              {room.players.length}/8
            </span>
          </div>

          {room.players.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Waiting for players to join...
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {room.players.map((player, i) => (
                <PlayerBubble
                  key={player.id}
                  player={player}
                  isHost={player.id === room.hostId}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Start Button (host only) */}
        {isHost ? (
          <button
            onClick={onStart}
            disabled={room.players.length < 1}
            className="w-full max-w-xs rounded-2xl bg-primary px-8 py-5 text-xl font-black text-primary-foreground jackbox-shadow-primary transition-all hover:brightness-105 active:pressed disabled:opacity-40 disabled:cursor-not-allowed animate-pulse-grow"
          >
            START GAME
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
            <p className="text-base font-semibold text-muted-foreground">
              Waiting for host to start...
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
