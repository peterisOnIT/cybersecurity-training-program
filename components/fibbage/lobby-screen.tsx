"use client";

import { useState, useEffect } from "react";
import type { FibbageRoom } from "@/lib/fibbage-room";
import { QRCode } from "@/components/qr-code";
import { Copy, Check, Users, Zap, Crown, Skull } from "lucide-react";

const PUBLIC_DOMAIN =
  typeof window !== "undefined" ? window.location.origin : "https://cybertrain.work";

interface LobbyScreenProps {
  room: FibbageRoom;
  playerId: string;
  onStart: () => void;
  loading: boolean;
}

export function LobbyScreen({ room, playerId, onStart, loading }: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const isHost = room.hostId === playerId;
  const joinUrl = `${PUBLIC_DOMAIN}/?code=${room.id}`;

  useEffect(() => {
    if (room.status === "countdown" && room.phaseEndsAt) {
      const update = () => {
        const remaining = Math.max(0, Math.ceil((room.phaseEndsAt! - Date.now()) / 1000));
        setCountdown(remaining);
      };
      update();
      const interval = setInterval(update, 100);
      return () => clearInterval(interval);
    }
    setCountdown(null);
  }, [room.status, room.phaseEndsAt]);

  const copyCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: "Join CyberFib!", url: joinUrl });
    } else {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Countdown overlay
  if (countdown !== null && countdown > 0) {
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center px-4"
        style={{ background: "var(--cc-dark)" }}
      >
        <div className="flex flex-col items-center gap-6">
          <p
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Game starting in
          </p>
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full border-[4px] animate-countdown-pulse"
            style={{ borderColor: "#FF2D78", background: "rgba(255,45,120,0.1)" }}
          >
            <span className="font-mono text-6xl font-black" style={{ color: "#FF2D78" }}>
              {countdown}
            </span>
          </div>
          <p className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
            Get ready to lie...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center px-4 py-8"
      style={{ background: "var(--cc-dark)" }}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 animate-slide-up">
          <Skull className="h-8 w-8" style={{ color: "#FF2D78" }} />
          <h2
            className="font-mono text-2xl font-black uppercase tracking-tight"
            style={{ color: "#FF2D78" }}
          >
            CyberFib
          </h2>
        </div>

        {/* Room Code */}
        <div
          className="w-full rounded-2xl border-[3px] p-5 animate-pop-in"
          style={{ borderColor: "#FF2D78", background: "rgba(255,45,120,0.05)" }}
        >
          <p
            className="mb-2 text-center text-xs font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Room Code
          </p>
          <div className="flex items-center justify-center gap-3">
            <p
              className="font-mono text-4xl font-black tracking-[0.3em]"
              style={{ color: "#FF2D78" }}
            >
              {room.id}
            </p>
            <button
              onClick={copyCode}
              className="rounded-lg p-2 transition-all duration-200 hover:scale-110"
              style={{
                background: copied ? "rgba(57,255,20,0.15)" : "rgba(255,255,255,0.05)",
                color: copied ? "#39FF14" : "rgba(255,255,255,0.4)",
              }}
              aria-label={copied ? "Copied!" : "Copy room code"}
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border-[2px] p-4 animate-fade-in"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "var(--cc-card)" }}
        >
          <QRCode value={joinUrl} size={160} fgColor="#FF2D78" bgColor="#111827" />
          <button
            onClick={shareLink}
            className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200"
            style={{
              background: "rgba(255,45,120,0.1)",
              color: "#FF2D78",
              border: "2px solid rgba(255,45,120,0.3)",
            }}
          >
            Share Link
          </button>
        </div>

        {/* Players */}
        <div
          className="w-full rounded-2xl border-[2px] p-4 animate-fade-in"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "var(--cc-card)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Players
            </p>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" style={{ color: "#00E5FF" }} />
              <span className="font-mono text-sm font-bold" style={{ color: "#00E5FF" }}>
                {room.players.length}/8
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {room.players.map((player, i) => (
              <div
                key={player.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 animate-slide-up"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black"
                  style={{
                    background: player.id === room.hostId
                      ? "rgba(255,184,0,0.15)"
                      : "rgba(0,229,255,0.1)",
                    color: player.id === room.hostId ? "#FFB800" : "#00E5FF",
                  }}
                >
                  {player.id === room.hostId ? (
                    <Crown className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className="font-bold"
                  style={{
                    color: player.id === playerId ? "#FF2D78" : "rgba(255,255,255,0.8)",
                  }}
                >
                  {player.name}
                  {player.id === playerId && (
                    <span
                      className="ml-2 text-xs font-normal"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      (you)
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Start / Waiting */}
        {isHost ? (
          <button
            onClick={onStart}
            disabled={loading || room.players.length < 2}
            className="jackbox-btn flex w-full items-center justify-center gap-3 rounded-2xl border-[3px] px-6 py-4 text-lg disabled:opacity-40 animate-fade-in"
            style={{
              borderColor: "#39FF14",
              background: "rgba(57,255,20,0.1)",
              color: "#39FF14",
            }}
          >
            {loading ? (
              <Zap className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Zap className="h-5 w-5" />
                {room.players.length < 2 ? "Need 2+ players" : "Start Game"}
              </>
            )}
          </button>
        ) : (
          <div
            className="w-full rounded-2xl border-[2px] px-5 py-4 text-center animate-fade-in"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              background: "var(--cc-card)",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            <p className="text-sm font-bold">Waiting for host to start...</p>
          </div>
        )}
      </div>
    </div>
  );
}
