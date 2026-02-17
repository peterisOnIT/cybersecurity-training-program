"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FibbageRoom } from "@/lib/fibbage-room";

interface UseFibbageRoomOptions {
  roomId: string | null;
  playerId: string | null;
  enabled?: boolean;
}

export function useFibbageRoom({ roomId, playerId, enabled = true }: UseFibbageRoomOptions) {
  const [room, setRoom] = useState<FibbageRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const errorCountRef = useRef(0);

  const poll = useCallback(async () => {
    if (!roomId || !playerId) return;
    try {
      const res = await fetch("/api/fibbage/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId }),
      });
      if (!res.ok) {
        errorCountRef.current += 1;
        if (errorCountRef.current >= 5) {
          const data = await res.json().catch(() => ({ error: "Room not found" }));
          setError(data.error || "Room not found");
        }
        return;
      }

      errorCountRef.current = 0;
      const data = await res.json();
      setRoom(data.room as FibbageRoom);
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
    errorCountRef.current = 0;
    poll();
    intervalRef.current = setInterval(poll, 1500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, roomId, playerId, poll]);

  const sendAction = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      if (!roomId || !playerId) return null;
      setLoading(true);
      try {
        const res = await fetch("/api/fibbage/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, playerId, action, ...extra }),
        });
        const data = await res.json();
        if (data.room) setRoom(data.room as FibbageRoom);
        return data;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [roomId, playerId]
  );

  return { room, error, loading, sendAction, poll };
}
