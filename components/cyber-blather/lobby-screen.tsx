"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, Check, Users, Zap, Crown, Loader2, MessageSquare, Brain, QrCode, Shield } from "lucide-react";
import type { BlatherRoom } from "@/lib/blather-room";
import { QRCode } from "@/components/qr-code";

const AVATAR_COLORS = ["#FFB800", "#00E5FF", "#39FF14", "#FF2D78", "#A855F7", "#F97316", "#06B6D4", "#EC4899"];
const PUBLIC_DOMAIN = "https://cybertrain.work";

interface LobbyScreenProps {
  room: BlatherRoom;
  playerId: string;
  isHost: boolean;
  onStartCountdown: () => void;
  onStartGame: () => void;
}

export function BlatherLobbyScreen({ room, playerId, isHost, onStartCountdown, onStartGame }: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const [countdownDisplay, setCountdownDisplay] = useState<number | null>(null);
  const [showQR, setShowQR] = useState(false);

  const joinUrl = `${PUBLIC_DOMAIN}/?code=${room.id}`;

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }, [room.id]);

  useEffect(() => {
    if (room.status === "countdown" && room.countdownEndsAt) {
      const tick = () => {
        const remaining = Math.max(0, Math.ceil((room.countdownEndsAt! - Date.now()) / 1000));
        setCountdownDisplay(remaining);
        if (remaining <= 0) {
          onStartGame();
        }
      };
      tick();
      const interval = setInterval(tick, 200);
      return () => clearInterval(interval);
    } else {
      setCountdownDisplay(null);
    }
  }, [room.status, room.countdownEndsAt, onStartGame]);

  const isCountdown = room.status === "countdown";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-3 sm:p-4" style={{ background: "var(--cc-dark)" }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(255,184,0,0.04) 0%, transparent 60%)",
        }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(rgba(255,184,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,184,0,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
        <MessageSquare className="absolute left-[5%] top-[18%] h-8 w-8 animate-float opacity-[0.05]" style={{ color: "#FFB800" }} />
        <Brain className="absolute right-[8%] top-[25%] h-7 w-7 animate-float opacity-[0.05]" style={{ color: "#00E5FF", animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-5 sm:gap-8">
        {/* Room code */}
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#39FF14" }} />
            <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              Room Code
            </p>
          </div>
          <button
            onClick={copyCode}
            className="group flex items-center gap-3 rounded-2xl border-[3px] px-5 py-3 transition-all duration-200 hover:border-[#FFB800] sm:gap-4 sm:px-8 sm:py-5"
            style={{ borderColor: "rgba(255,184,0,0.3)", background: "rgba(255,184,0,0.06)" }}
            aria-label={`Copy room code ${room.id}`}
          >
            <span className="text-2xl font-black tracking-[0.3em] sm:text-4xl" style={{ color: "#FFB800" }}>
              {room.id}
            </span>
            {copied ? (
              <Check className="h-6 w-6" style={{ color: "#39FF14" }} />
            ) : (
              <Copy className="h-6 w-6 transition-transform group-hover:scale-110" style={{ color: "rgba(255,255,255,0.4)" }} />
            )}
          </button>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
              {copied ? "Copied!" : "Share this code with other players"}
            </p>
            <button
              onClick={() => setShowQR((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border-[2px] px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-all duration-200"
              style={{
                borderColor: showQR ? "#FFB800" : "rgba(255,255,255,0.15)",
                color: showQR ? "#FFB800" : "rgba(255,255,255,0.4)",
                background: showQR ? "rgba(255,184,0,0.08)" : "transparent",
              }}
              aria-label={showQR ? "Hide QR code" : "Show QR code"}
            >
              <QrCode className="h-3.5 w-3.5" />
              QR
            </button>
          </div>

          {showQR && (
            <div
              className="animate-fade-in flex flex-col items-center gap-2 rounded-2xl border-[3px] p-3 sm:gap-3 sm:p-5"
              style={{ borderColor: "rgba(255,184,0,0.15)", background: "rgba(255,184,0,0.04)" }}
            >
              <div className="rounded-xl bg-white p-2 sm:p-3">
                <QRCode value={joinUrl} size={140} fgColor="#0B0F1A" bgColor="#ffffff" />
              </div>
              <p className="text-center text-[10px] font-bold sm:text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                Scan to join on another device
              </p>
            </div>
          )}
        </div>

        {/* Player list */}
        <div className="w-full">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: "#FFB800" }} />
            <h2 className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
              Players ({room.players.length}/12)
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            {room.players.map((player, i) => {
              const isMe = player.id === playerId;
              const isPlayerHost = player.id === room.hostId;
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];

              return (
                <div
                  key={player.id}
                  className="animate-slide-in-left flex items-center gap-3 rounded-xl border-[3px] px-3 py-3 sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-4"
                  style={{
                    background: isMe ? `${color}10` : "var(--cc-card)",
                    borderColor: isMe ? `${color}40` : "rgba(255,255,255,0.06)",
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-black sm:h-12 sm:w-12 sm:rounded-xl sm:text-lg"
                    style={{ background: color, color: "var(--cc-dark)" }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <p className="truncate text-base font-black sm:text-lg" style={{ color: isMe ? color : "#fff" }}>
                        {player.name}
                      </p>
                      {isMe && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                          style={{ background: `${color}20`, color }}>
                          You
                        </span>
                      )}
                      {isPlayerHost && <Crown className="h-4 w-4" style={{ color: "#FFB800" }} />}
                    </div>
                    <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {isPlayerHost ? "Host" : "Player"}
                    </p>
                  </div>
                  <div className="relative flex h-3 w-3 rounded-full" style={{ background: "#39FF14", boxShadow: "0 0 8px rgba(57,255,20,0.5)" }}>
                    <div className="absolute inset-0 animate-ping rounded-full" style={{ background: "#39FF14", opacity: 0.3 }} />
                  </div>
                </div>
              );
            })}

            {room.players.length < 2 && (
              <div
                className="flex items-center justify-center gap-2 rounded-xl border-[3px] border-dashed px-4 py-4 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-6"
                style={{ borderColor: "rgba(255,255,255,0.1)" }}
              >
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: "rgba(255,255,255,0.25)" }} />
                <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Waiting for players to join (need at least 2)...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Countdown or Start */}
        {isCountdown && countdownDisplay !== null ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none" stroke="#FFB800" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(countdownDisplay / 5) * 264} 264`}
                  style={{ transition: "stroke-dasharray 0.3s linear", filter: "drop-shadow(0 0 8px rgba(255,184,0,0.5))" }}
                />
              </svg>
              <span className="text-6xl font-black tabular-nums animate-countdown-pulse" style={{ color: "#FFB800" }}>
                {countdownDisplay}
              </span>
            </div>
            <p className="text-sm font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
              Game starting...
            </p>
          </div>
        ) : isHost ? (
          <button
            onClick={onStartCountdown}
            disabled={room.players.length < 2}
            className="jackbox-btn flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl border-[3px] px-6 py-5 text-xl disabled:opacity-40"
            style={{ borderColor: "#39FF14", background: "rgba(57,255,20,0.1)", color: "#39FF14" }}
          >
            <Zap className="h-6 w-6" />
            Start Game
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#FFB800" }} />
            <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
              Waiting for host to start the game...
            </p>
          </div>
        )}

        <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.15)" }}>
          <Shield className="h-4 w-4" />
          <span className="text-xs font-bold tracking-widest uppercase">CyberBlather</span>
        </div>
      </div>
    </div>
  );
}
