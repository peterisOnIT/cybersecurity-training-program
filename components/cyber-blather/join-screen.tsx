"use client";

import { useState, useEffect } from "react";
import { Shield, Users, Zap, ArrowLeft, MessageSquare, Eye, Brain, Terminal } from "lucide-react";

interface JoinScreenProps {
  onCreated: (roomId: string, playerId: string) => void;
  onJoined: (roomId: string, playerId: string) => void;
}

export function BlatherJoinScreen({ onCreated, onJoined }: JoinScreenProps) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"menu" | "join">("menu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") || params.get("blather");
    if (code && code.length === 5) {
      setRoomCode(code.toUpperCase());
      setMode("join");
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
      const res = await fetch("/api/blather/create", {
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
      const res = await fetch("/api/blather/join", {
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-3 sm:p-4" style={{ background: "var(--cc-dark)" }}>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(0,229,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
        <MessageSquare className="absolute left-[8%] top-[15%] h-10 w-10 animate-float opacity-[0.06]" style={{ color: "#FF2D78", animationDelay: "0s" }} />
        <Eye className="absolute right-[12%] top-[20%] h-8 w-8 animate-float opacity-[0.06]" style={{ color: "#39FF14", animationDelay: "1.5s" }} />
        <Brain className="absolute left-[20%] bottom-[25%] h-8 w-8 animate-float opacity-[0.06]" style={{ color: "#00E5FF", animationDelay: "0.8s" }} />
        <Terminal className="absolute right-[18%] bottom-[15%] h-9 w-9 animate-float opacity-[0.06]" style={{ color: "#FFB800", animationDelay: "2.2s" }} />
        <div className="absolute left-[10%] top-[20%] h-72 w-72 animate-float rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #FFB800, transparent 70%)" }} />
        <div className="absolute right-[10%] bottom-[25%] h-56 w-56 animate-float-delayed rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #00E5FF, transparent 70%)" }} />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 sm:gap-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 sm:gap-5">
          <div className="relative">
            <div className="absolute inset-[-10px] animate-glow-pulse rounded-3xl blur-xl" style={{ background: "#FFB800", opacity: 0.15 }} />
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-[3px] sm:h-28 sm:w-28 sm:rounded-3xl"
              style={{ borderColor: "#FFB800", background: "rgba(255,184,0,0.08)" }}
            >
              <MessageSquare className="h-10 w-10 sm:h-14 sm:w-14" style={{ color: "#FFB800" }} strokeWidth={2.5} />
              <Brain className="absolute -top-2 -right-2 h-5 w-5 animate-float sm:-top-3 sm:-right-3 sm:h-6 sm:w-6" style={{ color: "#00E5FF" }} />
              <Shield className="absolute -bottom-1.5 -left-1.5 h-4 w-4 animate-float-delayed sm:-bottom-2 sm:-left-2 sm:h-5 sm:w-5" style={{ color: "#39FF14" }} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            <h1 className="text-balance text-center text-4xl font-black tracking-tight sm:text-5xl md:text-6xl" style={{ color: "#fff" }}>
              {"CYBER"}<span style={{ color: "#FFB800" }}>{"BLATHER"}</span>
            </h1>
            <p className="text-sm font-bold tracking-[0.2em] uppercase sm:text-base" style={{ color: "rgba(255,255,255,0.35)" }}>
              Describe It. Guess It. Learn It.
            </p>
          </div>
        </div>

        {/* Main menu */}
        {mode === "menu" && (
          <div className="flex w-full animate-fade-in flex-col gap-4 sm:gap-5">
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-[10px] font-black tracking-[0.15em] uppercase sm:text-xs" style={{ color: "rgba(255,255,255,0.4)" }} htmlFor="blather-player-name">
                Your Name
              </label>
              <input
                id="blather-player-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                placeholder="Enter your name..."
                maxLength={20}
                autoComplete="off"
                autoFocus
                className="w-full rounded-xl border-[3px] border-white/10 px-4 py-3 text-base font-bold outline-none transition-all duration-200 focus:border-[#FFB800] sm:rounded-2xl sm:px-5 sm:py-4 sm:text-lg"
                style={{ background: "var(--cc-card)", color: "#fff" }}
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="jackbox-btn group flex w-full items-center justify-center gap-2 rounded-xl border-[3px] px-5 py-4 text-lg disabled:opacity-50 sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-5 sm:text-xl"
              style={{ borderColor: "#FFB800", background: "rgba(255,184,0,0.1)", color: "#FFB800" }}
            >
              <Zap className="h-5 w-5 transition-transform group-hover:rotate-12 sm:h-6 sm:w-6" />
              {loading ? "Creating Room..." : "Host a Game"}
            </button>

            <button
              onClick={() => { setError(null); setMode("join"); }}
              className="jackbox-btn group flex w-full items-center justify-center gap-2 rounded-xl border-[3px] px-5 py-4 text-lg sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-5 sm:text-xl"
              style={{ borderColor: "#00E5FF", background: "rgba(0,229,255,0.1)", color: "#00E5FF" }}
            >
              <Users className="h-5 w-5 transition-transform group-hover:scale-110 sm:h-6 sm:w-6" />
              Join a Game
            </button>

            {/* How it works */}
            <div className="mt-2 rounded-2xl border-[2px] border-white/5 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="mb-3 text-center text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                How to Play
              </p>
              <div className="flex flex-col gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                <p className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black" style={{ background: "rgba(255,184,0,0.15)", color: "#FFB800" }}>1</span>
                  <span>One player describes a cybersecurity term using pre-built sentences</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black" style={{ background: "rgba(0,229,255,0.15)", color: "#00E5FF" }}>2</span>
                  <span>Other players race to guess the term from the clues</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black" style={{ background: "rgba(57,255,20,0.15)", color: "#39FF14" }}>3</span>
                  <span>Faster guesses earn more points. Everyone takes turns describing!</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Join form */}
        {mode === "join" && (
          <div className="flex w-full animate-fade-in flex-col gap-4 sm:gap-5">
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-[10px] font-black tracking-[0.15em] uppercase sm:text-xs" style={{ color: "rgba(255,255,255,0.4)" }} htmlFor="blather-join-name">
                Your Name
              </label>
              <input
                id="blather-join-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                placeholder="Enter your name..."
                maxLength={20}
                autoComplete="off"
                autoFocus
                className="w-full rounded-xl border-[3px] border-white/10 px-4 py-3 text-base font-bold outline-none transition-all duration-200 focus:border-[#FFB800] sm:rounded-2xl sm:px-5 sm:py-4 sm:text-lg"
                style={{ background: "var(--cc-card)", color: "#fff" }}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-[10px] font-black tracking-[0.15em] uppercase sm:text-xs" style={{ color: "rgba(255,255,255,0.4)" }} htmlFor="blather-room-code">
                Room Code
              </label>
              <input
                id="blather-room-code"
                type="text"
                value={roomCode}
                onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setError(null); }}
                placeholder="ABCDE"
                maxLength={5}
                autoComplete="off"
                className="w-full rounded-xl border-[3px] border-white/10 px-4 py-3 text-center text-2xl font-black tracking-[0.4em] uppercase outline-none transition-all duration-200 focus:border-[#00E5FF] sm:rounded-2xl sm:px-5 sm:py-4 sm:text-3xl"
                style={{ background: "var(--cc-card)", color: "#fff" }}
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={loading || roomCode.length < 5}
              className="jackbox-btn flex w-full items-center justify-center gap-2 rounded-xl border-[3px] px-5 py-4 text-lg disabled:opacity-40 sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-5 sm:text-xl"
              style={{ borderColor: "#00E5FF", background: "rgba(0,229,255,0.1)", color: "#00E5FF" }}
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
