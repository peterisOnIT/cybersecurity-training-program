"use client";

import { useState, useCallback, useEffect } from "react";
import { useGameRoom } from "@/hooks/use-game-room";
import { JoinScreen } from "@/components/cyber-clash/join-screen";
import { LobbyScreen } from "@/components/cyber-clash/lobby-screen";
import { GameScreen } from "@/components/cyber-clash/game-screen";
import { GameOverScreen } from "@/components/cyber-clash/game-over-screen";
import { LogOut } from "lucide-react";

const SESSION_KEY = "cybershield_session";

function saveSession(roomId: string | null, playerId: string | null) {
  try {
    if (roomId && playerId) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ roomId, playerId }));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch { /* private browsing etc */ }
}

function loadSession(): { roomId: string; playerId: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.roomId && data.playerId) return data;
  } catch { /* ignore */ }
  return null;
}

export default function CyberShieldPage() {
  const [roomId, setRoomId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return loadSession()?.roomId ?? null;
  });
  const [playerId, setPlayerId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return loadSession()?.playerId ?? null;
  });

  const { room, error, sendAction, departedPlayers, dismissDeparted } = useGameRoom({
    roomId,
    playerId,
    enabled: !!roomId && !!playerId,
  });

  // Auto-dismiss departure toasts after 4 seconds
  useEffect(() => {
    if (departedPlayers.length === 0) return;
    const timers = departedPlayers.map((d) =>
      setTimeout(() => dismissDeparted(d.id), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [departedPlayers, dismissDeparted]);

  // If the room is not found (stale session), clear and go to join screen
  useEffect(() => {
    if (error && roomId && playerId) {
      setRoomId(null);
      setPlayerId(null);
      saveSession(null, null);
    }
  }, [error, roomId, playerId]);

  const isHost = room ? room.hostId === playerId : false;

  const handleCreated = useCallback((newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
    saveSession(newRoomId, newPlayerId);
  }, []);

  const handleJoined = useCallback((newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
    saveSession(newRoomId, newPlayerId);
  }, []);

  const handleStartCountdown = useCallback(() => {
    sendAction("start_countdown");
  }, [sendAction]);

  const handleStartGame = useCallback(() => {
    sendAction("start_game");
  }, [sendAction]);

  const handleAnswer = useCallback(
    (answer: number) => {
      if (!room) return;
      sendAction("submit_answer", {
        questionIndex: room.currentQuestion,
        answer,
      });
    },
    [sendAction, room]
  );

  const handleShowResults = useCallback(() => {
    sendAction("show_results");
  }, [sendAction]);

  const handleNextQuestion = useCallback(() => {
    sendAction("next_question");
  }, [sendAction]);

  const handlePlayAgain = useCallback(() => {
    sendAction("reset");
  }, [sendAction]);

  const handleLeave = useCallback(async () => {
    await sendAction("leave");
    setRoomId(null);
    setPlayerId(null);
    saveSession(null, null);
  }, [sendAction]);

  // No room yet -- show join screen
  if (!room || !roomId || !playerId) {
    return (
      <main id="main-content" className="min-h-dvh" style={{ background: "var(--cc-dark)" }}>
        <JoinScreen onCreated={handleCreated} onJoined={handleJoined} />
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-dvh" style={{ background: "var(--cc-dark)" }}>
      {/* Waiting / Countdown */}
      {(room.status === "waiting" || room.status === "countdown") && (
        <LobbyScreen
          room={room}
          playerId={playerId}
          isHost={isHost}
          onStartCountdown={handleStartCountdown}
          onStartGame={handleStartGame}
        />
      )}

      {/* Playing / Showing Results */}
      {(room.status === "playing" || room.status === "showing_results") && (
        <GameScreen
          room={room}
          playerId={playerId}
          isHost={isHost}
          onAnswer={handleAnswer}
          onShowResults={handleShowResults}
          onNextQuestion={handleNextQuestion}
        />
      )}

      {/* Game Over */}
      {room.status === "game_over" && (
        <GameOverScreen
          players={room.players}
          myPlayerId={playerId}
          isHost={isHost}
          onPlayAgain={handlePlayAgain}
          onLeave={handleLeave}
        />
      )}

      {/* Player departure toasts */}
      {departedPlayers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
          {departedPlayers.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 rounded-2xl border-[3px] px-5 py-3 shadow-2xl"
              style={{
                background: "rgba(11,15,26,0.95)",
                borderColor: "rgba(255,45,120,0.3)",
                backdropFilter: "blur(12px)",
                animation: "slide-up 0.4s cubic-bezier(0.16,1,0.3,1), fade-out 0.5s ease 3.5s forwards",
              }}
            >
              <LogOut className="h-5 w-5 shrink-0" style={{ color: "#FF2D78" }} />
              <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
                <span style={{ color: "#FF2D78" }}>{d.name}</span> left the game
              </p>
              <button
                onClick={() => dismissDeparted(d.id)}
                className="ml-2 text-xs font-bold uppercase tracking-wider transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.3)" }}
                aria-label={`Dismiss notification for ${d.name}`}
              >
                OK
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
