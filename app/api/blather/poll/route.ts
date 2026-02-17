import { NextResponse } from "next/server";
import { heartbeat, getRoom } from "@/lib/blather-room";

export async function POST(req: Request) {
  try {
    const { roomId, playerId } = await req.json();

    if (!roomId || !playerId) {
      return NextResponse.json({ error: "Missing roomId or playerId" }, { status: 400 });
    }

    // Try heartbeat first, but fall back to a read-only getRoom if the player
    // isn't registered yet (brief race between join completing and first poll).
    let room = await heartbeat(roomId, playerId);
    if (!room) {
      room = await getRoom(roomId);
    }

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Strip the secret word from non-describer players during active play
    const safeRoom = { ...room };
    if (room.status === "describing" || room.status === "round_results") {
      const currentRound = room.rounds[room.currentRound];
      if (currentRound && currentRound.describerId !== playerId) {
        // Hide all unplayed words and taboo words from guessers
        safeRoom.wordBank = room.wordBank.map((w, i) => {
          if (i >= room.currentRound) {
            return { ...w, word: "???", tabooWords: [] };
          }
          return w;
        });
      }
    }

    return NextResponse.json({ room: safeRoom });
  } catch {
    return NextResponse.json({ error: "Failed to poll" }, { status: 500 });
  }
}
