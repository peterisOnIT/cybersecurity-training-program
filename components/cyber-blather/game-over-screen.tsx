"use client";

import { Trophy, RotateCcw, LogOut, Shield, Star, Crown, Medal } from "lucide-react";
import type { BlatherPlayer } from "@/lib/blather-room";

const AVATAR_COLORS = ["#FFB800", "#00E5FF", "#39FF14", "#FF2D78", "#A855F7", "#F97316", "#06B6D4", "#EC4899"];

interface GameOverScreenProps {
  players: BlatherPlayer[];
  allPlayers: BlatherPlayer[];
  myPlayerId: string;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function BlatherGameOverScreen({ players, allPlayers, myPlayerId, isHost, onPlayAgain, onLeave }: GameOverScreenProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const winnerIndex = allPlayers.findIndex((p) => p.id === winner?.id);
  const winnerColor = AVATAR_COLORS[winnerIndex >= 0 ? winnerIndex % AVATAR_COLORS.length : 0];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-3 sm:p-4" style={{ background: "var(--cc-dark)" }}>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 50% 30%, ${winnerColor}08 0%, transparent 60%)`,
        }} />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6 sm:gap-8">
        {/* Title */}
        <div className="flex flex-col items-center gap-3">
          <Trophy className="h-12 w-12 animate-pop-in sm:h-16 sm:w-16" style={{ color: "#FFB800" }} />
          <h1 className="text-3xl font-black sm:text-4xl" style={{ color: "#fff" }}>
            Game Over!
          </h1>
        </div>

        {/* Winner highlight */}
        {winner && (
          <div
            className="animate-bounce-in flex w-full flex-col items-center gap-3 rounded-3xl border-[3px] px-5 py-6 sm:px-8 sm:py-8"
            style={{ borderColor: `${winnerColor}50`, background: `${winnerColor}08` }}
          >
            <Crown className="h-8 w-8" style={{ color: "#FFB800" }} />
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-black sm:h-20 sm:w-20 sm:text-3xl"
              style={{ background: winnerColor, color: "var(--cc-dark)" }}
            >
              {winner.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-black sm:text-3xl" style={{ color: winnerColor }}>
              {winner.name}
            </h2>
            <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
              Winner with <span className="font-black" style={{ color: winnerColor }}>{winner.score}</span> points
            </p>
          </div>
        )}

        {/* Full leaderboard */}
        <div className="w-full">
          <h3 className="mb-3 text-center text-xs font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
            Final Standings
          </h3>
          <div className="flex flex-col gap-2">
            {sorted.map((p, i) => {
              const pIdx = allPlayers.findIndex((pl) => pl.id === p.id);
              const pColor = AVATAR_COLORS[pIdx >= 0 ? pIdx % AVATAR_COLORS.length : 0];
              const isMe = p.id === myPlayerId;
              const placement = i + 1;

              return (
                <div
                  key={p.id}
                  className="animate-slide-in-left flex items-center gap-3 rounded-xl border-[3px] px-3 py-3 sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-4"
                  style={{
                    background: isMe ? `${pColor}10` : "var(--cc-card)",
                    borderColor: isMe ? `${pColor}40` : "rgba(255,255,255,0.06)",
                    animationDelay: `${i * 100}ms`,
                  }}
                >
                  {/* Rank */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black"
                    style={{
                      background: placement <= 3 ? `${pColor}20` : "rgba(255,255,255,0.05)",
                      color: placement <= 3 ? pColor : "rgba(255,255,255,0.3)",
                    }}>
                    {placement === 1 ? <Star className="h-4 w-4" /> : placement === 2 ? <Medal className="h-4 w-4" /> : placement}
                  </div>

                  {/* Avatar */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-black"
                    style={{ background: pColor, color: "var(--cc-dark)" }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black" style={{ color: isMe ? pColor : "#fff" }}>
                      {p.name}
                      {isMe && (
                        <span className="ml-2 text-[10px] font-black uppercase tracking-wider" style={{ color: pColor }}>
                          You
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Score */}
                  <span className="text-lg font-black tabular-nums" style={{ color: pColor }}>
                    {p.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          {isHost && (
            <button
              onClick={onPlayAgain}
              className="jackbox-btn flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-4 text-lg"
              style={{ borderColor: "#39FF14", background: "rgba(57,255,20,0.1)", color: "#39FF14" }}
            >
              <RotateCcw className="h-5 w-5" />
              Play Again
            </button>
          )}
          <button
            onClick={onLeave}
            className="jackbox-btn flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-4 text-lg"
            style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)" }}
          >
            <LogOut className="h-5 w-5" />
            Leave Game
          </button>
        </div>

        <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.15)" }}>
          <Shield className="h-4 w-4" />
          <span className="text-xs font-bold tracking-widest uppercase">CyberBlather</span>
        </div>
      </div>
    </div>
  );
}
