"use client";

import { useState, useEffect, useRef } from "react";
import type { FibbageRoom } from "@/lib/fibbage-room";
import { QRCode } from "@/components/qr-code";
import { Copy, Check, Users, Zap, Crown, Skull, Sparkles } from "lucide-react";
import type { useSoundEffects } from "@/hooks/use-sound-effects";

const PUBLIC_DOMAIN = "https://cybertrain.work";

interface LobbyScreenProps {
  room: FibbageRoom;
  playerId: string;
  onStart: () => void;
  loading: boolean;
  sfx: ReturnType<typeof useSoundEffects>;
}

export function LobbyScreen({ room, playerId, onStart, loading, sfx }: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const isHost = room.hostId === playerId;
  const joinUrl = `${PUBLIC_DOMAIN}/?code=${room.id}`;
  const prevPlayerCount = useRef(room.players.length);

  // Play sound when new player joins
  useEffect(() => {
    if (room.players.length > prevPlayerCount.current) {
      sfx.play("pop");
    }
    prevPlayerCount.current = room.players.length;
  }, [room.players.length, sfx]);

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
    sfx.play("click");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    sfx.play("click");
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
        <div className="flex flex-col items-center gap-8">
          <p
            className="text-sm font-black uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Game starting in
          </p>
          <div className="relative">
            <div
              className="flex h-36 w-36 items-center justify-center rounded-full border-[4px] animate-countdown-pulse"
              style={{
                borderColor: "#FF2D78",
                background: "rgba(255,45,120,0.08)",
                boxShadow: "0 0 60px rgba(255,45,120,0.2)",
              }}
            >
              <span className="font-mono text-7xl font-black" style={{ color: "#FF2D78" }}>
                {countdown}
              </span>
            </div>
            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
              <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full" style={{ background: "#00E5FF" }} />
            </div>
          </div>
          <p className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
            Get ready!
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
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative flex w-full max-w-md flex-col items-center gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 animate-slide-up">
          <Skull className="h-8 w-8" style={{ color: "#FF2D78" }} />
          <h2 className="font-mono text-2xl font-black uppercase tracking-tight" style={{ color: "#FF2D78" }}>
            CyberFib
          </h2>
        </div>

        {/* Room Code Card */}
        <div
          className="w-full overflow-hidden rounded-2xl border-[3px] animate-pop-in"
          style={{
            borderColor: "#FF2D78",
            background: "linear-gradient(135deg, rgba(255,45,120,0.06), rgba(255,45,120,0.02))",
          }}
        >
          <div
            className="px-5 py-2"
            style={{ background: "rgba(255,45,120,0.06)" }}
          >
            <p className="text-center text-xs font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
              Room Code
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 px-5 py-5">
            <p className="font-mono text-4xl font-black tracking-[0.3em]" style={{ color: "#FF2D78" }}>
              {room.id}
            </p>
            <button
              onClick={copyCode}
              className="rounded-lg p-2.5 transition-all duration-200 hover:scale-110"
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
          className="flex flex-col items-center gap-3 rounded-2xl border-[2px] p-5 animate-fade-in"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "var(--cc-card)" }}
        >
          <QRCode value={joinUrl} size={160} fgColor="#FF2D78" bgColor="#111827" />
          <button
            onClick={shareLink}
            className="jackbox-btn rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider"
            style={{
              background: "rgba(255,45,120,0.08)",
              color: "#FF2D78",
              border: "2px solid rgba(255,45,120,0.25)",
            }}
          >
            Share Link
          </button>
        </div>

        {/* Players */}
        <div
          className="w-full overflow-hidden rounded-2xl border-[2px] animate-fade-in"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "var(--cc-card)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
              Players
            </p>
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5"
              style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)" }}
            >
              <Users className="h-3 w-3" style={{ color: "#00E5FF" }} />
              <span className="font-mono text-xs font-bold" style={{ color: "#00E5FF" }}>
                {room.players.length}/8
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 p-2">
            {room.players.map((player, i) => (
              <div
                key={player.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 animate-slide-up"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: player.id === room.hostId ? "rgba(255,184,0,0.1)" : "rgba(0,229,255,0.08)",
                    border: `1px solid ${player.id === room.hostId ? "rgba(255,184,0,0.2)" : "rgba(0,229,255,0.12)"}`,
                    color: player.id === room.hostId ? "#FFB800" : "#00E5FF",
                  }}
                >
                  {player.id === room.hostId ? (
                    <Crown className="h-4 w-4" />
                  ) : (
                    <span className="font-mono text-sm font-black">{i + 1}</span>
                  )}
                </div>
                <span
                  className="font-bold"
                  style={{ color: player.id === playerId ? "#FF2D78" : "rgba(255,255,255,0.8)" }}
                >
                  {player.name}
                  {player.id === playerId && (
                    <span className="ml-2 text-xs font-normal" style={{ color: "rgba(255,255,255,0.25)" }}>
                      (you)
                    </span>
                  )}
                </span>
                {player.id === room.hostId && (
                  <span
                    className="ml-auto rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ background: "rgba(255,184,0,0.08)", color: "#FFB800" }}
                  >
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start / Waiting */}
        {isHost ? (
          <button
            onClick={() => { sfx.play("gameStart"); onStart(); }}
            disabled={loading || room.players.length < 2}
            className="jackbox-btn flex w-full items-center justify-center gap-3 rounded-2xl border-[3px] px-6 py-4 text-lg disabled:opacity-40 animate-fade-in"
            style={{
              borderColor: "#39FF14",
              background: "linear-gradient(135deg, rgba(57,255,20,0.12), rgba(57,255,20,0.04))",
              color: "#39FF14",
            }}
          >
            {loading ? (
              <div className="h-5 w-5 rounded-full border-[2px] border-t-transparent animate-spin" style={{ borderColor: "#39FF14", borderTopColor: "transparent" }} />
            ) : (
              <>
                <Zap className="h-5 w-5" />
                {room.players.length < 2 ? "Need 2+ players" : "Start Game"}
              </>
            )}
          </button>
        ) : (
          <div
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-[2px] px-5 py-4 animate-fade-in"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "var(--cc-card)" }}
          >
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#00E5FF" }} />
            <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
              Waiting for host to start...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
