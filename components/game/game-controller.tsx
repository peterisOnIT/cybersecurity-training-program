"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Room } from "@/lib/game-store"
import { QUESTIONS } from "@/lib/game-store"
import { HomeScreen } from "./home-screen"
import { LobbyScreen } from "./lobby-screen"
import { QuestionScreen } from "./question-screen"
import { RevealScreen } from "./reveal-screen"
import { ScoresScreen } from "./scores-screen"
import { FinalScreen } from "./final-screen"

export function GameController() {
  const [room, setRoom] = useState<Room | null>(null)
  const [playerId, setPlayerId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isHost = room ? playerId === room.hostId : false

  // Poll room state from server
  const pollRoom = useCallback(async () => {
    if (!room) return
    try {
      const res = await fetch(`/api/room?code=${room.code}`)
      if (res.ok) {
        const data = await res.json()
        setRoom(data.room)
      }
    } catch {
      // Silent fail on poll
    }
  }, [room])

  // Start polling when in a room
  useEffect(() => {
    if (!room) return

    pollRef.current = setInterval(pollRoom, 1000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [room?.code, pollRoom])

  // Host-side timer: tick every second during question phase
  useEffect(() => {
    if (!room || !isHost || room.phase !== "question") {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/room/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "tick", code: room.code }),
        })
        if (res.ok) {
          const data = await res.json()
          setRoom(data.room)
        }
      } catch {
        // Silent fail
      }
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [room?.code, room?.phase, room?.questionIndex, isHost])

  // API helpers
  async function createRoom(name: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to create room")
        return
      }
      setRoom(data.room)
      setPlayerId(data.playerId)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function joinRoom(code: string, name: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", name, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to join room")
        return
      }
      setRoom(data.room)
      setPlayerId(data.playerId)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function sendAction(action: string, extra: Record<string, string> = {}) {
    if (!room) return
    try {
      const res = await fetch("/api/room/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, code: room.code, playerId, ...extra }),
      })
      if (res.ok) {
        const data = await res.json()
        setRoom(data.room)
      }
    } catch {
      // Silent fail
    }
  }

  // No room yet -- show home screen
  if (!room) {
    return (
      <HomeScreen
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        error={error}
        loading={loading}
      />
    )
  }

  const currentPlayer = room.players.find((p) => p.id === playerId)
  const question = room.questionIndex >= 0 ? QUESTIONS[room.questionIndex] : null
  const answeredCount = room.players.filter((p) => p.answered).length

  // WAITING phase -- lobby
  if (room.phase === "waiting") {
    return (
      <LobbyScreen
        room={room}
        playerId={playerId}
        onStart={() => sendAction("start")}
      />
    )
  }

  // QUESTION phase
  if (room.phase === "question" && question && currentPlayer) {
    return (
      <QuestionScreen
        question={question}
        questionIndex={room.questionIndex}
        timeRemaining={room.timeRemaining}
        player={currentPlayer}
        totalPlayers={room.players.length}
        answeredCount={answeredCount}
        onAnswer={(answer) => sendAction("answer", { answer })}
      />
    )
  }

  // REVEAL phase
  if (room.phase === "reveal") {
    return (
      <RevealScreen
        room={room}
        playerId={playerId}
        isHost={isHost}
        onShowScores={() => sendAction("scores")}
        onNext={() => sendAction("next")}
      />
    )
  }

  // SCORES phase
  if (room.phase === "scores") {
    return (
      <ScoresScreen
        room={room}
        playerId={playerId}
        isHost={isHost}
        onNext={() => sendAction("next")}
      />
    )
  }

  // FINAL phase
  if (room.phase === "final") {
    return (
      <FinalScreen
        room={room}
        playerId={playerId}
        isHost={isHost}
        onPlayAgain={() => sendAction("reset")}
      />
    )
  }

  // Fallback
  return null
}
