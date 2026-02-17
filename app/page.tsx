"use client";

import { useState, useEffect, useCallback } from "react";
import { useFibbageRoom } from "@/hooks/use-fibbage-room";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { JoinScreen } from "@/components/fibbage/join-screen";
import { LobbyScreen } from "@/components/fibbage/lobby-screen";
import { GameScreen } from "@/components/fibbage/game-screen";
import { Volume2, VolumeX } from "lucide-react";

const SESSION_KEY_ROOM = "cyberfib_room";
const SESSION_KEY_PLAYER = "cyberfib_player";

export default function CyberFibPage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const sfx = useSoundEffects();

  // Restore session from localStorage (survives page refresh on mobile)
  useEffect(() => {
    try {
      const storedRoom = localStorage.getItem(SESSION_KEY_ROOM);
      const storedPlayer = localStorage.getItem(SESSION_KEY_PLAYER);
      if (storedRoom && storedPlayer) {
        setRoomId(storedRoom);
        setPlayerId(storedPlayer);
      }
    } catch { /* noop */ }
  }, []);

  // Persist session
  useEffect(() => {
    try {
      if (roomId && playerId) {
        localStorage.setItem(SESSION_KEY_ROOM, roomId);
        localStorage.setItem(SESSION_KEY_PLAYER, playerId);
      }
    } catch { /* noop */ }
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
        localStorage.removeItem(SESSION_KEY_ROOM);
        localStorage.removeItem(SESSION_KEY_PLAYER);
      } catch { /* noop */ }
    }
  }, [error, roomId, playerId]);

  const toggleMute = () => {
    const newMuted = !sfx.muted;
    sfx.setMuted(newMuted);
    if (!newMuted) sfx.play("click");
  };

  const handleCreated = (newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
  };

  const handleJoined = (newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
  };

  // Mute toggle button (always visible)
  const muteButton = (
    <button
      onClick={toggleMute}
      className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border-[2px] transition-all duration-200 hover:scale-110"
      style={{
        borderColor: sfx.muted ? "rgba(255,255,255,0.08)" : "rgba(0,229,255,0.2)",
        background: sfx.muted ? "rgba(255,255,255,0.03)" : "rgba(0,229,255,0.06)",
        color: sfx.muted ? "rgba(255,255,255,0.25)" : "#00E5FF",
      }}
      aria-label={sfx.muted ? "Unmute sound effects" : "Mute sound effects"}
    >
      {sfx.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );

  // Not yet in a room
  if (!roomId || !playerId) {
    return (
      <main id="main-content">
        {muteButton}
        <JoinScreen onCreated={handleCreated} onJoined={handleJoined} sfx={sfx} />
      </main>
    );
  }

  // Waiting for first poll
  if (!room) {
    return (
      <main id="main-content">
        {muteButton}
        <div
          className="flex min-h-dvh flex-col items-center justify-center"
          style={{ background: "var(--cc-dark)" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div
                className="h-14 w-14 rounded-full border-[3px] border-t-transparent animate-spin"
                style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }}
              />
              <div
                className="absolute inset-1 rounded-full border-[2px] border-t-transparent animate-spin"
                style={{ borderColor: "#00E5FF", borderTopColor: "transparent", animationDirection: "reverse", animationDuration: "0.8s" }}
              />
            </div>
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
        {muteButton}
        <LobbyScreen
          room={room}
          playerId={playerId}
          onStart={() => sendAction("start")}
          loading={loading}
          sfx={sfx}
        />
      </main>
    );
  }

  // Active game phases
  return (
    <main id="main-content">
      {muteButton}
      <GameScreen
        room={room}
        playerId={playerId}
        sendAction={sendAction}
        loading={loading}
        sfx={sfx}
      />
    </main>
  );
}
