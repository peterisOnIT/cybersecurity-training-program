"use client"

import { useState } from "react"
import { Shield, Users, Zap } from "lucide-react"

interface HomeScreenProps {
  onCreateRoom: (name: string) => Promise<void>
  onJoinRoom: (code: string, name: string) => Promise<void>
  error: string | null
  loading: boolean
}

export function HomeScreen({ onCreateRoom, onJoinRoom, error, loading }: HomeScreenProps) {
  const [mode, setMode] = useState<"home" | "create" | "join">("home")
  const [name, setName] = useState("")
  const [code, setCode] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 1) return
    await onCreateRoom(name.trim())
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 1 || code.trim().length !== 4) return
    await onJoinRoom(code.trim().toUpperCase(), name.trim())
  }

  if (mode === "home") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <main id="main-content" className="flex w-full max-w-sm flex-col items-center">
          {/* Logo */}
          <div className="mb-10 flex flex-col items-center animate-bounce-in">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary jackbox-shadow-primary">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-black tracking-tight text-foreground text-balance text-center">
              CYBER CLASH
            </h1>
            <p className="mt-2 text-lg font-semibold text-primary">
              The Phishing Party Game
            </p>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-4">
            <button
              onClick={() => setMode("create")}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 text-lg font-bold text-primary-foreground jackbox-shadow-primary transition-all hover:brightness-105 active:pressed"
            >
              <Zap className="h-6 w-6" />
              Host a Game
            </button>
            <button
              onClick={() => setMode("join")}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-teal px-6 py-5 text-lg font-bold text-teal-foreground jackbox-shadow-teal transition-all hover:brightness-105 active:pressed"
            >
              <Users className="h-6 w-6" />
              Join a Game
            </button>
          </div>

          <p className="mt-8 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
            Can you tell the difference between phishing emails and legitimate ones? Play with friends and find out!
          </p>
        </main>
      </div>
    )
  }

  if (mode === "create") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <main id="main-content" className="w-full max-w-sm animate-slide-up">
          <button
            onClick={() => { setMode("home"); setName("") }}
            className="mb-6 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back
          </button>

          <div className="rounded-3xl bg-card p-8 jackbox-shadow">
            <h2 className="mb-1 text-2xl font-black text-foreground">Host a Game</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Create a room and invite your friends
            </p>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label htmlFor="host-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Name
                </label>
                <input
                  id="host-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={16}
                  autoFocus
                  autoComplete="off"
                  className="w-full rounded-xl border-2 border-border bg-secondary px-4 py-3.5 text-base font-semibold text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={name.trim().length < 1 || loading}
                className="rounded-xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground jackbox-shadow-primary transition-all hover:brightness-105 active:pressed disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  // Join mode
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <main id="main-content" className="w-full max-w-sm animate-slide-up">
        <button
          onClick={() => { setMode("home"); setName(""); setCode("") }}
          className="mb-6 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>

        <div className="rounded-3xl bg-card p-8 jackbox-shadow">
          <h2 className="mb-1 text-2xl font-black text-foreground">Join a Game</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter the room code from the host's screen
          </p>

          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="room-code" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Room Code
              </label>
              <input
                id="room-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
                placeholder="ABCD"
                maxLength={4}
                autoFocus
                autoComplete="off"
                className="w-full rounded-xl border-2 border-border bg-secondary px-4 py-4 text-center text-3xl font-black tracking-[0.3em] text-foreground placeholder:text-muted-foreground/30 placeholder:tracking-[0.3em] focus:border-teal focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label htmlFor="join-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Name
              </label>
              <input
                id="join-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={16}
                autoComplete="off"
                className="w-full rounded-xl border-2 border-border bg-secondary px-4 py-3.5 text-base font-semibold text-foreground placeholder:text-muted-foreground/50 focus:border-teal focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={name.trim().length < 1 || code.length !== 4 || loading}
              className="rounded-xl bg-teal px-6 py-4 text-base font-bold text-teal-foreground jackbox-shadow-teal transition-all hover:brightness-105 active:pressed disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Room"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
