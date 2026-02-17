"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BlatherRoom } from "@/lib/blather-room";

interface UseBlatherRoomOptions {
  roomId: string | null;
  playerId: string | null;
  enabled?: boolean;
}

export interface DepartedPlayer {
  id: string;
  name: string;
  timestamp: number;
}

export function useBlatherRoom({ roomId, playerId, enabled = true }: UseBlatherRoomOptions) {
  const [room, setRoom] = useState<BlatherRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [departedPlayers, setDepartedPlayers] = useState<DepartedPlayer[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPlayerIdsRef = useRef<Map<string, string>>(new Map());
  const errorCountRef = useRef(0);

  const poll = useCallback(async () => {
    if (!roomId || !playerId) return;
    try {
      const res = await fetch("/api/blather/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId }),
      });
      if (!res.ok) {
        errorCountRef.current += 1;
        // Only set a fatal error after 5 consecutive failures
        if (errorCountRef.current >= 5) {
          const data = await res.json().catch(() => ({ error: "Room not found" }));
          setError(data.error || "Room not found");
        }
        return;
      }

      // Success -- reset error counter
      errorCountRef.current = 0;
      const data = await res.json();
      const newRoom = data.room as BlatherRoom;

      if (newRoom && prevPlayerIdsRef.current.size > 0) {
        const newIds = new Set(newRoom.players.map((p) => p.id));
        prevPlayerIdsRef.current.forEach((name, id) => {
          if (!newIds.has(id) && id !== playerId) {
            setDepartedPlayers((prev) => {
              if (prev.some((d) => d.id === id && Date.now() - d.timestamp < 5000)) return prev;
              return [...prev, { id, name, timestamp: Date.now() }];
            });
          }
        });
      }

      if (newRoom) {
        const map = new Map<string, string>();
        newRoom.players.forEach((p) => map.set(p.id, p.name));
        prevPlayerIdsRef.current = map;
      }

      setRoom(newRoom);
      setError(null);
    } catch {
      errorCountRef.current += 1;
      if (errorCountRef.current >= 5) {
        setError("Connection lost");
      }
    }
  }, [roomId, playerId]);

  useEffect(() => {
    if (!enabled || !roomId || !playerId) return;
    // Reset error count when starting fresh
    errorCountRef.current = 0;
    poll();
    intervalRef.current = setInterval(poll, 1500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, roomId, playerId, poll]);

  const sendAction = useCallback(
    async (action: string, extra?: Record<string, unknown>) => {
      if (!roomId || !playerId) return null;
      setLoading(true);
      try {
        const res = await fetch("/api/blather/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, roomId, playerId, ...extra }),
        });
        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
        }
        setLoading(false);
        return data;
      } catch {
        setLoading(false);
        return null;
      }
    },
    [roomId, playerId]
  );

  const dismissDeparted = useCallback((id: string) => {
    setDepartedPlayers((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { room, error, loading, sendAction, poll, departedPlayers, dismissDeparted };
}
