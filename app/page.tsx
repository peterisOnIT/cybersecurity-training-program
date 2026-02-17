"use client";

import { useState, useEffect } from "react";
import { useFibbageRoom } from "@/hooks/use-fibbage-room";
import { JoinScreen } from "@/components/fibbage/join-screen";
import { LobbyScreen } from "@/components/fibbage/lobby-screen";
import { GameScreen } from "@/components/fibbage/game-screen";

const SESSION_KEY_ROOM = "cyberfib_room";
const SESSION_KEY_PLAYER = "cyberfib_player";

export default function CyberFibPage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Restore session from sessionStorage
  useEffect(() => {
    try {
      const storedRoom = sessionStorage.getItem(SESSION_KEY_ROOM);
      const storedPlayer = sessionStorage.getItem(SESSION_KEY_PLAYER);
      if (storedRoom && storedPlayer) {
        setRoomId(storedRoom);
        setPlayerId(storedPlayer);
      }
    } catch {
      /* noop */
    }
  }, []);

  // Persist session
  useEffect(() => {
    try {
      if (roomId && playerId) {
        sessionStorage.setItem(SESSION_KEY_ROOM, roomId);
        sessionStorage.setItem(SESSION_KEY_PLAYER, playerId);
      }
    } catch {
      /* noop */
    }
  }, [roomId, playerId]);

  const { room, error, loading, sendAction } = useFibbageRoom({
    roomId,
    playerId,
    enabled: !!roomId && !!playerId,
  });

  // Only reset on persistent "Room not found" error
  useEffect(() => {
    if (error === "Room not found" && roomId && playerId) {
      setRoomId(null);
      setPlayerId(null);
      try {
        sessionStorage.removeItem(SESSION_KEY_ROOM);
        sessionStorage.removeItem(SESSION_KEY_PLAYER);
      } catch {
        /* noop */
      }
    }
  }, [error, roomId, playerId]);

  const handleCreated = (newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
  };

  const handleJoined = (newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
  };

  // Not yet in a room
  if (!roomId || !playerId) {
    return (
      <main id="main-content">
        <JoinScreen onCreated={handleCreated} onJoined={handleJoined} />
      </main>
    );
  }

  // Waiting for first poll
  if (!room) {
    return (
      <main id="main-content">
        <div
          className="flex min-h-dvh flex-col items-center justify-center"
          style={{ background: "var(--cc-dark)" }}
        >
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div
              className="h-12 w-12 rounded-full border-[3px] border-t-transparent animate-spin"
              style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }}
            />
            <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
              Connecting to room...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Lobby / Waiting + Countdown
  if (room.status === "waiting" || room.status === "countdown") {
    return (
      <main id="main-content">
        <LobbyScreen
          room={room}
          playerId={playerId}
          onStart={() => sendAction("start")}
          loading={loading}
        />
      </main>
    );
  }

  // Active game phases
  return (
    <main id="main-content">
      <GameScreen
        room={room}
        playerId={playerId}
        sendAction={sendAction}
        loading={loading}
      />
    </main>
  );
}
