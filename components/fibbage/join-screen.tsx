"use client";

import { useState, useEffect } from "react";
import { Shield, Users, Zap, ArrowLeft, HelpCircle, Trophy, Skull } from "lucide-react";

interface JoinScreenProps {
  onCreated: (roomId: string, playerId: string) => void;
  onJoined: (roomId: string, playerId: string) => void;
}

export function JoinScreen({ onCreated, onJoined }: JoinScreenProps) {
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
    try {
      const res = await fetch("/api/fibbage/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data.room.id, data.playerId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fibbage/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: code.trim().toUpperCase(), playerName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onJoined(data.room.id, data.playerId);
    } catch (e) {
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
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-3 animate-slide-up">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl border-[3px]"
            style={{ borderColor: "#FF2D78", background: "rgba(255,45,120,0.1)" }}
          >
            <Skull className="h-10 w-10" style={{ color: "#FF2D78" }} />
          </div>
          <h1
            className="text-center font-mono text-4xl font-black uppercase tracking-tight"
            style={{ color: "#FF2D78" }}
          >
            CyberFib
          </h1>
          <p
            className="max-w-xs text-center text-sm font-medium leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Write convincing lies about cybersecurity. Fool your friends. Find the truth.
          </p>
        </div>

        {/* How it works */}
        {mode === "menu" && (
          <div
            className="w-full animate-fade-in rounded-2xl border-[2px] p-4"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "var(--cc-card)",
            }}
          >
            <p
              className="mb-3 text-center text-xs font-bold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              How to play
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: HelpCircle, color: "#00E5FF", text: "Read a cybersecurity question with a blank" },
                { icon: Skull, color: "#FF2D78", text: "Write a fake answer to trick other players" },
                { icon: Users, color: "#FFB800", text: "Vote on which answer you think is real" },
                { icon: Trophy, color: "#39FF14", text: "Score points for guessing right AND fooling others" },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${step.color}15` }}
                  >
                    <step.icon className="h-4 w-4" style={{ color: step.color }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
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
              onClick={() => setMode("host")}
              className="jackbox-btn flex items-center justify-center gap-3 rounded-2xl border-[3px] px-6 py-4 text-lg"
              style={{
                borderColor: "#FF2D78",
                background: "rgba(255,45,120,0.1)",
                color: "#FF2D78",
              }}
            >
              <Shield className="h-5 w-5" />
              Host Game
            </button>
            <button
              onClick={() => setMode("join")}
              className="jackbox-btn flex items-center justify-center gap-3 rounded-2xl border-[3px] px-6 py-4 text-lg"
              style={{
                borderColor: "#00E5FF",
                background: "rgba(0,229,255,0.08)",
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
              onClick={() => { setMode("menu"); setError(null); }}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-bold uppercase tracking-wider"
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
                className="rounded-xl border-[2px] px-4 py-3 font-bold placeholder:font-normal focus:outline-none"
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
                background: "rgba(255,45,120,0.15)",
                color: "#FF2D78",
              }}
            >
              {loading ? (
                <Zap className="h-5 w-5 animate-spin" />
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
              onClick={() => { setMode("menu"); setError(null); }}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-bold uppercase tracking-wider"
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
                className="rounded-xl border-[2px] px-4 py-3 text-center font-mono text-2xl font-black uppercase tracking-[0.3em] placeholder:tracking-[0.3em] focus:outline-none"
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
                className="text-xs font-bold uppercase tracking-wider"
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
                className="rounded-xl border-[2px] px-4 py-3 font-bold placeholder:font-normal focus:outline-none"
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
                background: "rgba(0,229,255,0.1)",
                color: "#00E5FF",
              }}
            >
              {loading ? (
                <Zap className="h-5 w-5 animate-spin" />
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
