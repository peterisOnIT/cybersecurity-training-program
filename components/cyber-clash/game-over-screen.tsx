"use client";

import { useEffect, useState, useMemo } from "react";
import { Trophy, RotateCcw, Crown, Star, Medal, Sparkles, Shield, Home, Flame, Zap, Fish, ShieldCheck } from "lucide-react";
import type { Player } from "@/lib/game-room";

interface GameOverScreenProps {
  players: Player[];
  myPlayerId: string;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}

const AVATAR_COLORS = ["#00E5FF", "#FF2D78", "#39FF14", "#FFB800", "#A855F7", "#F97316", "#06B6D4", "#EC4899"];
const RANK_COLORS = ["#FFB800", "#A0AEC0", "#CD7F32"];

function ConfettiPiece({ delay, color, left, size }: { delay: number; color: string; left: number; size: number }) {
  const shape = Math.random() > 0.5 ? "rounded-full" : "rounded-sm";
  return (
    <div
      className={`pointer-events-none absolute top-0 ${shape}`}
      aria-hidden="true"
      style={{
        left: `${left}%`,
        width: size,
        height: size,
        background: color,
        animation: `confetti-fall ${2.5 + Math.random() * 2.5}s linear ${delay}s infinite`,
        opacity: 0.7 + Math.random() * 0.3,
      }}
    />
  );
}

export function GameOverScreen({ players, myPlayerId, isHost, onPlayAgain, onLeave }: GameOverScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setShowPlayers(true), 500);
    return () => clearTimeout(t);
  }, []);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isWinner = winner?.id === myPlayerId;
  const myPlayer = sorted.find((p) => p.id === myPlayerId);
  const myRank = sorted.findIndex((p) => p.id === myPlayerId) + 1;

  const confettiPieces = useMemo(() => {
    const pieces = [];
    const colors = ["#00E5FF", "#FF2D78", "#39FF14", "#FFB800", "#A855F7", "#F97316"];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        delay: Math.random() * 4,
        color: colors[i % colors.length],
        left: Math.random() * 100,
        size: 6 + Math.random() * 8,
      });
    }
    return pieces;
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8" style={{ background: "var(--cc-dark)" }}>
      {/* Confetti */}
      {isWinner && confettiPieces.map((piece, i) => (
        <ConfettiPiece key={i} {...piece} />
      ))}

      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div style={{
          position: "absolute", inset: 0,
          background: isWinner
            ? "radial-gradient(ellipse at 50% 30%, rgba(255,184,0,0.08) 0%, transparent 50%)"
            : "radial-gradient(ellipse at 50% 30%, rgba(0,229,255,0.06) 0%, transparent 50%)",
        }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "linear-gradient(rgba(0,229,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
        {/* Floating icons */}
        <Fish className="absolute left-[8%] top-[15%] h-8 w-8 animate-float opacity-[0.06]" style={{ color: "#FF2D78" }} />
        <ShieldCheck className="absolute right-[10%] top-[22%] h-7 w-7 animate-float opacity-[0.06]" style={{ color: "#39FF14", animationDelay: "1.2s" }} />
        <Zap className="absolute left-[20%] bottom-[15%] h-8 w-8 animate-float opacity-[0.05]" style={{ color: "#FFB800", animationDelay: "0.8s" }} />
        <Shield className="absolute right-[20%] bottom-[20%] h-7 w-7 animate-float opacity-[0.05]" style={{ color: "#00E5FF", animationDelay: "2s" }} />
      </div>

      <div className={`relative z-10 w-full max-w-lg transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Trophy */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mb-4 flex justify-center sm:mb-6">
            <div className="relative">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] sm:h-28 sm:w-28 sm:rounded-[2rem]"
                style={{
                  background: isWinner ? "#FFB800" : "var(--cc-card)",
                  border: isWinner ? "none" : "3px solid rgba(255,255,255,0.08)",
                  boxShadow: isWinner ? "0 0 60px rgba(255,184,0,0.4)" : "none",
                }}
              >
                {isWinner ? (
                  <Crown className="h-10 w-10 sm:h-14 sm:w-14" style={{ color: "var(--cc-dark)" }} />
                ) : (
                  <Trophy className="h-10 w-10 sm:h-14 sm:w-14" style={{ color: "#FFB800" }} />
                )}
              </div>
              {isWinner && (
                <>
                  <Star className="absolute -top-3 -left-3 h-7 w-7 animate-float" style={{ color: "#FFB800" }} />
                  <Star className="absolute -top-1 -right-4 h-5 w-5 animate-float-delayed" style={{ color: "#00E5FF" }} />
                  <Sparkles className="absolute -bottom-2 left-1/2 h-5 w-5 animate-float" style={{ color: "#FF2D78" }} />
                  <Flame className="absolute -bottom-3 -left-2 h-5 w-5 animate-float-delayed" style={{ color: "#F97316" }} />
                  <Zap className="absolute -top-4 left-1/2 h-5 w-5 animate-float" style={{ color: "#39FF14" }} />
                </>
              )}
            </div>
          </div>

          <h2 className="text-balance text-4xl font-black uppercase tracking-tighter sm:text-6xl" style={{ color: "#fff" }}>
            Game<br />
            <span style={{ color: isWinner ? "#FFB800" : "#00E5FF" }}>Over</span>
          </h2>

          {isWinner ? (
            <p className="mt-3 flex items-center justify-center gap-2 text-xl font-black uppercase tracking-wider" style={{ color: "#FFB800" }}>
              <Sparkles className="h-5 w-5" /> You are the champion! <Sparkles className="h-5 w-5" />
            </p>
          ) : (
            <p className="mt-3 text-lg font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
              You placed <span className="font-black" style={{ color: "#00E5FF" }}>#{myRank}</span> with{" "}
              <span className="font-black" style={{ color: "#fff" }}>{myPlayer?.score ?? 0}</span> points
            </p>
          )}
        </div>

        {/* Final Standings */}
        <div
          className={`mb-8 overflow-hidden rounded-3xl border-[3px] transition-all duration-700 ${showPlayers ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ background: "var(--cc-card)", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "3px solid rgba(255,255,255,0.06)" }}>
            <Medal className="h-5 w-5" style={{ color: "#FFB800" }} />
            <h3 className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: "#fff" }}>Final Standings</h3>
          </div>

          <div className="flex flex-col">
            {sorted.map((player, index) => {
              const isMe = player.id === myPlayerId;
              const rank = index + 1;
              const originalIdx = players.findIndex((p) => p.id === player.id);
              const color = AVATAR_COLORS[originalIdx % AVATAR_COLORS.length];
              const rankColor = RANK_COLORS[index] ?? "rgba(255,255,255,0.3)";
              const correctCount = player.answers.filter((a) => a === true).length;

              return (
                <div
                  key={player.id}
                  className="flex items-center gap-3 px-4 py-3 transition-all duration-500 sm:gap-4 sm:px-6 sm:py-4"
                  style={{
                    background: rank === 1 ? "rgba(255,184,0,0.04)" : isMe ? `${color}06` : "transparent",
                    borderBottom: index < sorted.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    transitionDelay: showPlayers ? `${index * 100}ms` : "0ms",
                    opacity: showPlayers ? 1 : 0,
                    transform: showPlayers ? "translateX(0)" : "translateX(-20px)",
                  }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                    style={{ background: rank <= 3 ? `${rankColor}20` : "rgba(255,255,255,0.04)", color: rank <= 3 ? rankColor : "rgba(255,255,255,0.3)" }}>
                    {rank === 1 ? <Crown className="h-5 w-5" /> : `#${rank}`}
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                    style={{ background: `${color}15`, color }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black" style={{ color: isMe ? color : "#fff" }}>
                      {player.name}
                      {isMe && (
                        <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                          style={{ background: `${color}20`, color }}>
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {correctCount}/{player.answers.length} correct
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-black tabular-nums" style={{ color: rank === 1 ? "#FFB800" : isMe ? color : "#fff" }}>
                      {player.score}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isHost && (
            <button
              onClick={onPlayAgain}
              className="jackbox-btn flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-lg sm:px-6 sm:py-5 sm:text-xl"
              style={{ background: "#00E5FF", color: "var(--cc-dark)", boxShadow: "0 4px 30px rgba(0,229,255,0.3)" }}
            >
              <RotateCcw className="h-6 w-6" />
              Play Again
            </button>
          )}

          {!isHost && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#00E5FF" }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                Waiting for host...
              </span>
            </div>
          )}

          <button
            onClick={onLeave}
            className="flex items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-4 text-base font-black uppercase tracking-wider transition-all duration-200 hover:border-white/20"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
          >
            <Home className="h-5 w-5" />
            Leave Game
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2" style={{ color: "rgba(255,255,255,0.15)" }}>
          <Shield className="h-4 w-4" />
          <span className="text-xs font-bold tracking-widest uppercase">CyberShield</span>
        </div>
      </div>
    </div>
  );
}
