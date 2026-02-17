"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useBlatherRoom } from "@/hooks/use-blather-room";
import { BlatherJoinScreen } from "@/components/cyber-blather/join-screen";
import { BlatherLobbyScreen } from "@/components/cyber-blather/lobby-screen";
import { BlatherGameScreen } from "@/components/cyber-blather/game-screen";
import { BlatherGameOverScreen } from "@/components/cyber-blather/game-over-screen";
import { LogOut } from "lucide-react";

const SESSION_KEY_ROOM = "cyberblather_roomId";
const SESSION_KEY_PLAYER = "cyberblather_playerId";

function getSessionValue(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export default function CyberBlatherPage() {
  const [roomId, setRoomId] = useState<string | null>(() => getSessionValue(SESSION_KEY_ROOM));
  const [playerId, setPlayerId] = useState<string | null>(() => getSessionValue(SESSION_KEY_PLAYER));

  useEffect(() => {
    try {
      if (roomId) sessionStorage.setItem(SESSION_KEY_ROOM, roomId);
      else sessionStorage.removeItem(SESSION_KEY_ROOM);
      if (playerId) sessionStorage.setItem(SESSION_KEY_PLAYER, playerId);
      else sessionStorage.removeItem(SESSION_KEY_PLAYER);
    } catch { /* noop */ }
  }, [roomId, playerId]);

  const { room, error, sendAction, departedPlayers, dismissDeparted } = useBlatherRoom({
    roomId,
    playerId,
    enabled: !!roomId && !!playerId,
  });

  useEffect(() => {
    if (error && roomId && playerId) {
      setRoomId(null);
      setPlayerId(null);
    }
  }, [error, roomId, playerId]);

  useEffect(() => {
    if (departedPlayers.length === 0) return;
    const timers = departedPlayers.map((d) =>
      setTimeout(() => dismissDeparted(d.id), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [departedPlayers, dismissDeparted]);

  const isHost = room ? room.hostId === playerId : false;

  const handleCreated = useCallback((newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
  }, []);

  const handleJoined = useCallback((newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
  }, []);

  const handleStartCountdown = useCallback(() => {
    sendAction("start_countdown");
  }, [sendAction]);

  const handleStartGame = useCallback(() => {
    sendAction("start_game");
  }, [sendAction]);

  const handleSendSentence = useCallback((template: string, filled: string) => {
    sendAction("send_sentence", { template, filled });
  }, [sendAction]);

  const handleSubmitGuess = useCallback((guess: string) => {
    sendAction("submit_guess", { guess });
  }, [sendAction]);

  const handleEndRound = useCallback(() => {
    sendAction("end_round");
  }, [sendAction]);

  const handleNextRound = useCallback(() => {
    sendAction("next_round");
  }, [sendAction]);

  const handlePlayAgain = useCallback(() => {
    sendAction("reset");
  }, [sendAction]);

  const handleLeave = useCallback(async () => {
    await sendAction("leave");
    setRoomId(null);
    setPlayerId(null);
    try {
      sessionStorage.removeItem(SESSION_KEY_ROOM);
      sessionStorage.removeItem(SESSION_KEY_PLAYER);
    } catch { /* noop */ }
  }, [sendAction]);

  // Auto-advance from round_results after 15s if host
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (staleTimerRef.current) { clearTimeout(staleTimerRef.current); staleTimerRef.current = null; }
    if (room?.status === "round_results" && isHost) {
      staleTimerRef.current = setTimeout(() => {
        sendAction("next_round");
      }, 15000);
    }
    return () => { if (staleTimerRef.current) clearTimeout(staleTimerRef.current); };
  }, [room?.status, room?.currentRound, isHost, sendAction]);

  // No room yet
  if (!room || !roomId || !playerId) {
    return (
      <main id="main-content" className="min-h-dvh" style={{ background: "var(--cc-dark)" }}>
        <BlatherJoinScreen onCreated={handleCreated} onJoined={handleJoined} />
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-dvh" style={{ background: "var(--cc-dark)" }}>
      {/* Lobby */}
      {(room.status === "waiting" || room.status === "countdown") && (
        <BlatherLobbyScreen
          room={room}
          playerId={playerId}
          isHost={isHost}
          onStartCountdown={handleStartCountdown}
          onStartGame={handleStartGame}
        />
      )}

      {/* Active game */}
      {(room.status === "describing" || room.status === "round_results") && (
        <BlatherGameScreen
          room={room}
          playerId={playerId}
          isHost={isHost}
          onSendSentence={handleSendSentence}
          onSubmitGuess={handleSubmitGuess}
          onEndRound={handleEndRound}
          onNextRound={handleNextRound}
        />
      )}

      {/* Game Over */}
      {room.status === "game_over" && (
        <BlatherGameOverScreen
          players={room.players}
          allPlayers={room.players}
          myPlayerId={playerId}
          isHost={isHost}
          onPlayAgain={handlePlayAgain}
          onLeave={handleLeave}
        />
      )}

      {/* Departure toasts */}
      {departedPlayers.length > 0 && (
        <div className="fixed top-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:top-6">
          {departedPlayers.map((d) => (
            <div
              key={d.id}
              className="animate-pop-in flex items-center gap-3 rounded-2xl border-[3px] px-4 py-3 shadow-2xl"
              style={{
                background: "rgba(11,15,26,0.97)",
                borderColor: "rgba(255,45,120,0.4)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(255,45,120,0.15)" }}>
                <LogOut className="h-4 w-4" style={{ color: "#FF2D78" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black" style={{ color: "#fff" }}>
                  <span style={{ color: "#FF2D78" }}>{d.name}</span>{" left the game"}
                </p>
              </div>
              <button
                onClick={() => dismissDeparted(d.id)}
                className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
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
