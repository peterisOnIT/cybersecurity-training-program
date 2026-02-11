"use client";

import { useState, useEffect } from "react";
import { Shield, Wifi, Users, Zap, ArrowLeft, Fish, ShieldCheck, Mail, Lock, Sparkles, AlertTriangle } from "lucide-react";

interface JoinScreenProps {
  onCreated: (roomId: string, playerId: string) => void;
  onJoined: (roomId: string, playerId: string) => void;
}

export function JoinScreen({ onCreated, onJoined }: JoinScreenProps) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"menu" | "join">("menu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill room code from URL query param (e.g., ?code=ABC12)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && code.length === 5) {
      setRoomCode(code.toUpperCase());
      setMode("join");
      // Clean up the URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function handleCreate() {
    if (!name.trim()) {
      setError("Enter your name to play");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        onCreated(data.room.id, data.playerId);
      }
    } catch {
      setError("Failed to create room. Try again.");
    }
    setLoading(false);
  }

  async function handleJoin() {
    if (!name.trim()) {
      setError("Enter your name to play");
      return;
    }
    if (roomCode.trim().length < 5) {
      setError("Enter a valid 5-character room code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/game/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomCode.trim().toUpperCase(), playerName: name.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        onJoined(data.room.id, data.playerId);
      }
    } catch {
      setError("Failed to join room. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4" style={{ background: "var(--cc-dark)" }}>
      {/* Animated background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(0,229,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
        {/* Floating icons */}
        <Fish className="absolute left-[8%] top-[15%] h-10 w-10 animate-float opacity-[0.06]" style={{ color: "#FF2D78", animationDelay: "0s" }} />
        <ShieldCheck className="absolute right-[12%] top-[20%] h-8 w-8 animate-float opacity-[0.06]" style={{ color: "#39FF14", animationDelay: "1.5s" }} />
        <Mail className="absolute left-[20%] bottom-[25%] h-8 w-8 animate-float opacity-[0.06]" style={{ color: "#00E5FF", animationDelay: "0.8s" }} />
        <Lock className="absolute right-[18%] bottom-[15%] h-9 w-9 animate-float opacity-[0.06]" style={{ color: "#FFB800", animationDelay: "2.2s" }} />
        <AlertTriangle className="absolute left-[40%] top-[8%] h-7 w-7 animate-float opacity-[0.05]" style={{ color: "#A855F7", animationDelay: "1s" }} />
        <Shield className="absolute right-[35%] bottom-[8%] h-8 w-8 animate-float opacity-[0.05]" style={{ color: "#00E5FF", animationDelay: "0.4s" }} />
        {/* Glows */}
        <div className="absolute left-[10%] top-[20%] h-72 w-72 animate-float rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #00E5FF, transparent 70%)" }} />
        <div className="absolute right-[10%] bottom-[25%] h-56 w-56 animate-float-delayed rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #FF2D78, transparent 70%)" }} />
        <div className="absolute left-[50%] top-[60%] h-48 w-48 animate-float rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #FFB800, transparent 70%)", animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 sm:gap-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 sm:gap-5">
          <div className="relative">
            <div className="absolute inset-[-8px] animate-glow-pulse rounded-3xl blur-xl sm:inset-[-10px]" style={{ background: "#00E5FF", opacity: 0.15 }} />
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-[3px] sm:h-28 sm:w-28 sm:rounded-3xl"
              style={{ borderColor: "#00E5FF", background: "rgba(0,229,255,0.08)" }}
            >
              <Shield className="h-10 w-10 sm:h-14 sm:w-14" style={{ color: "#00E5FF" }} strokeWidth={2.5} />
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 animate-float sm:-top-3 sm:-right-3 sm:h-6 sm:w-6" style={{ color: "#FFB800" }} />
              <Zap className="absolute -bottom-1 -left-1 h-4 w-4 animate-float-delayed sm:-bottom-2 sm:-left-2 sm:h-5 sm:w-5" style={{ color: "#39FF14" }} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <h1 className="text-balance text-center text-3xl font-black tracking-tight sm:text-5xl md:text-6xl" style={{ color: "#fff" }}>
              {"CYBER"}<span style={{ color: "#00E5FF" }}>{"SHIELD"}</span>
            </h1>
            <p className="text-xs font-bold tracking-[0.2em] uppercase sm:text-base" style={{ color: "rgba(255,255,255,0.35)" }}>
              Cyber Security Party Game
            </p>
          </div>
        </div>

        {/* Main menu */}
        {mode === "menu" && (
          <div className="flex w-full animate-fade-in flex-col gap-5">
            {/* Name input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }} htmlFor="player-name">
                Your Name
              </label>
              <input
                id="player-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                placeholder="Enter your name..."
                maxLength={20}
                autoComplete="off"
                autoFocus
                className="w-full rounded-2xl border-[3px] border-white/10 px-5 py-4 text-lg font-bold outline-none transition-all duration-200 focus:border-[#00E5FF]"
                style={{ background: "var(--cc-card)", color: "#fff" }}
              />
            </div>

            {/* Host button */}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="jackbox-btn group flex w-full items-center justify-center gap-3 rounded-2xl border-[3px] px-5 py-4 text-lg disabled:opacity-50 sm:px-6 sm:py-5 sm:text-xl"
              style={{
                borderColor: "#00E5FF",
                background: "rgba(0,229,255,0.1)",
                color: "#00E5FF",
              }}
            >
              <Zap className="h-5 w-5 transition-transform group-hover:rotate-12 sm:h-6 sm:w-6" />
              {loading ? "Creating Room..." : "Host a Game"}
            </button>

            {/* Join button */}
            <button
              onClick={() => {
                if (!name.trim()) {
                  setError("Enter your name first");
                  return;
                }
                setError(null);
                setMode("join");
              }}
              className="jackbox-btn group flex w-full items-center justify-center gap-3 rounded-2xl border-[3px] px-5 py-4 text-lg sm:px-6 sm:py-5 sm:text-xl"
              style={{
                borderColor: "#FFB800",
                background: "rgba(255,184,0,0.1)",
                color: "#FFB800",
              }}
            >
              <Users className="h-5 w-5 transition-transform group-hover:scale-110 sm:h-6 sm:w-6" />
              Join a Game
            </button>

            {/* Feature tags */}
            <div className="mt-2 flex items-center justify-center gap-6 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span className="flex items-center gap-1.5"><Wifi className="h-4 w-4" /> Real-time</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Multiplayer</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> 3 Game Types</span>
            </div>
          </div>
        )}

        {/* Join form */}
        {mode === "join" && (
          <div className="flex w-full animate-fade-in flex-col gap-5">
            {/* Name input (required for QR code joins too) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }} htmlFor="join-player-name">
                Your Name
              </label>
              <input
                id="join-player-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                placeholder="Enter your name..."
                maxLength={20}
                autoComplete="off"
                autoFocus
                className="w-full rounded-2xl border-[3px] border-white/10 px-5 py-4 text-lg font-bold outline-none transition-all duration-200 focus:border-[#FFB800]"
                style={{ background: "var(--cc-card)", color: "#fff" }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }} htmlFor="room-code">
                Room Code
              </label>
              <input
                id="room-code"
                type="text"
                value={roomCode}
                onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setError(null); }}
                placeholder="ABCDE"
                maxLength={5}
                autoComplete="off"
                className="w-full rounded-2xl border-[3px] border-white/10 px-4 py-3 text-center text-2xl font-black tracking-[0.4em] uppercase outline-none transition-all duration-200 focus:border-[#FFB800] sm:px-5 sm:py-4 sm:text-3xl"
                style={{ background: "var(--cc-card)", color: "#fff" }}
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={loading || roomCode.length < 5 || !name.trim()}
              className="jackbox-btn flex w-full items-center justify-center gap-3 rounded-2xl border-[3px] px-5 py-4 text-lg disabled:opacity-40 sm:px-6 sm:py-5 sm:text-xl"
              style={{
                borderColor: "#FFB800",
                background: "rgba(255,184,0,0.1)",
                color: "#FFB800",
              }}
            >
              {loading ? "Joining..." : "Join Room"}
            </button>

            <button
              onClick={() => { setMode("menu"); setError(null); setRoomCode(""); }}
              className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors hover:text-white/60"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="w-full animate-pop-in rounded-2xl border-[3px] px-5 py-3 text-center text-sm font-bold"
            style={{ borderColor: "#FF2D78", background: "rgba(255,45,120,0.1)", color: "#FF2D78" }}
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
