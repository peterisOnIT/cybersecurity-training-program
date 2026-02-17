"use client";

import { useState, useEffect } from "react";
import { Shield, Users, Zap, ArrowLeft, HelpCircle, Trophy, Skull, Volume2, VolumeX, Sparkles } from "lucide-react";
import type { useSoundEffects } from "@/hooks/use-sound-effects";

interface JoinScreenProps {
  onCreated: (roomId: string, playerId: string) => void;
  onJoined: (roomId: string, playerId: string) => void;
  sfx: ReturnType<typeof useSoundEffects>;
}

export function JoinScreen({ onCreated, onJoined, sfx }: JoinScreenProps) {
  const [mode, setMode] = useState<"menu" | "host" | "join">("menu");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("code");
    if (urlCode) {
      setCode(urlCode.toUpperCase());
      setMode("join");
    }
  }, []);

  const handleHost = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    sfx.play("click");
    try {
      const res = await fetch("/api/fibbage/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sfx.play("gameStart");
      onCreated(data.room.id, data.playerId);
    } catch (e) {
      sfx.play("wrong");
      setError(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    setError(null);
    sfx.play("click");
    try {
      const res = await fetch("/api/fibbage/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: code.trim().toUpperCase(), playerName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sfx.play("submit");
      onJoined(data.room.id, data.playerId);
    } catch (e) {
      sfx.play("wrong");
      setError(e instanceof Error ? e.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-4 py-8"
      style={{ background: "var(--cc-dark)" }}
    >
      {/* Subtle background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative flex w-full max-w-md flex-col items-center gap-6">

        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-4 animate-slide-up">
          <div className="relative">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-3xl border-[3px] animate-glow-pulse"
              style={{
                borderColor: "#FF2D78",
                background: "linear-gradient(135deg, rgba(255,45,120,0.12), rgba(255,45,120,0.04))",
                boxShadow: "0 0 40px rgba(255,45,120,0.15)",
              }}
            >
              <Skull className="h-12 w-12" style={{ color: "#FF2D78" }} />
            </div>
            <div
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full animate-pulse"
              style={{ background: "#39FF14" }}
            >
              <Sparkles className="h-3 w-3" style={{ color: "#0B0F1A" }} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1
              className="text-center font-mono text-5xl font-black uppercase tracking-tight"
              style={{ color: "#FF2D78" }}
            >
              CyberFib
            </h1>
            <div
              className="rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-widest"
              style={{ background: "rgba(0,229,255,0.1)", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.2)" }}
            >
              Cybersecurity Edition
            </div>
          </div>
          <p
            className="max-w-xs text-center text-sm font-medium leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Can you spot the real answer? Make up your own and see who falls for it!
          </p>
        </div>

        {/* How it works */}
        {mode === "menu" && (
          <div
            className="w-full animate-fade-in overflow-hidden rounded-2xl border-[2px]"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "var(--cc-card)" }}
          >
            <div
              className="px-4 py-2.5 text-center"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <p
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                How to play
              </p>
            </div>
            <div className="flex flex-col gap-0 p-3">
              {[
                { icon: HelpCircle, color: "#00E5FF", text: "Read a cybersecurity question with a missing word", num: "1" },
                { icon: Skull, color: "#FF2D78", text: "Make up a fake answer that sounds real", num: "2" },
                { icon: Users, color: "#FFB800", text: "Vote on which answer you think is correct", num: "3" },
                { icon: Trophy, color: "#39FF14", text: "Earn points for guessing right AND tricking others", num: "4" },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${step.color}10`, border: `1px solid ${step.color}20` }}
                  >
                    <step.icon className="h-4 w-4" style={{ color: step.color }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Buttons */}
        {mode === "menu" && (
          <div className="flex w-full flex-col gap-3 animate-fade-in">
            <button
              onClick={() => { sfx.play("click"); setMode("host"); }}
              className="jackbox-btn flex items-center justify-center gap-3 rounded-2xl border-[3px] px-6 py-4 text-lg"
              style={{
                borderColor: "#FF2D78",
                background: "linear-gradient(135deg, rgba(255,45,120,0.12), rgba(255,45,120,0.04))",
                color: "#FF2D78",
              }}
            >
              <Shield className="h-5 w-5" />
              Host Game
            </button>
            <button
              onClick={() => { sfx.play("click"); setMode("join"); }}
              className="jackbox-btn flex items-center justify-center gap-3 rounded-2xl border-[3px] px-6 py-4 text-lg"
              style={{
                borderColor: "#00E5FF",
                background: "linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,229,255,0.03))",
                color: "#00E5FF",
              }}
            >
              <Users className="h-5 w-5" />
              Join Game
            </button>
          </div>
        )}

        {/* Host Form */}
        {mode === "host" && (
          <div className="flex w-full flex-col gap-4 animate-slide-up">
            <button
              onClick={() => { sfx.play("pop"); setMode("menu"); setError(null); }}
              className="flex items-center gap-2 text-sm font-bold transition-colors duration-200 hover:text-white"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.4)" }}
                htmlFor="host-name"
              >
                Your Name
              </label>
              <input
                id="host-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 16))}
                placeholder="Enter your name..."
                maxLength={16}
                autoFocus
                className="rounded-xl border-[2px] px-4 py-3.5 font-bold placeholder:font-normal transition-all duration-200 focus:outline-none focus:shadow-[0_0_20px_rgba(255,45,120,0.15)]"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  background: "var(--cc-card)",
                  color: "white",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#FF2D78")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                onKeyDown={(e) => e.key === "Enter" && handleHost()}
              />
            </div>
            <button
              onClick={handleHost}
              disabled={loading || !name.trim()}
              className="jackbox-btn flex items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-4 text-lg disabled:opacity-40"
              style={{
                borderColor: "#FF2D78",
                background: "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(255,45,120,0.05))",
                color: "#FF2D78",
              }}
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-[2px] border-t-transparent animate-spin" style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }} />
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Create Room
                </>
              )}
            </button>
          </div>
        )}

        {/* Join Form */}
        {mode === "join" && (
          <div className="flex w-full flex-col gap-4 animate-slide-up">
            <button
              onClick={() => { sfx.play("pop"); setMode("menu"); setError(null); }}
              className="flex items-center gap-2 text-sm font-bold transition-colors duration-200 hover:text-white"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.4)" }}
                htmlFor="join-code"
              >
                Room Code
              </label>
              <input
                id="join-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 5))}
                placeholder="XXXXX"
                maxLength={5}
                autoFocus
                className="rounded-xl border-[2px] px-4 py-4 text-center font-mono text-3xl font-black uppercase tracking-[0.3em] placeholder:tracking-[0.3em] transition-all duration-200 focus:outline-none focus:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  background: "var(--cc-card)",
                  color: "#00E5FF",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#00E5FF")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.4)" }}
                htmlFor="join-name"
              >
                Your Name
              </label>
              <input
                id="join-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 16))}
                placeholder="Enter your name..."
                maxLength={16}
                className="rounded-xl border-[2px] px-4 py-3.5 font-bold placeholder:font-normal transition-all duration-200 focus:outline-none focus:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  background: "var(--cc-card)",
                  color: "white",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#00E5FF")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={loading || !name.trim() || code.length < 5}
              className="jackbox-btn flex items-center justify-center gap-2 rounded-2xl border-[3px] px-6 py-4 text-lg disabled:opacity-40"
              style={{
                borderColor: "#00E5FF",
                background: "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(0,229,255,0.04))",
                color: "#00E5FF",
              }}
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-[2px] border-t-transparent animate-spin" style={{ borderColor: "#00E5FF", borderTopColor: "transparent" }} />
              ) : (
                <>
                  <Users className="h-5 w-5" />
                  Join Room
                </>
              )}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="w-full animate-pop-in rounded-2xl border-[3px] px-5 py-3.5 text-center text-sm font-bold"
            style={{ borderColor: "#FF2D78", background: "rgba(255,45,120,0.08)", color: "#FF2D78" }}
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
