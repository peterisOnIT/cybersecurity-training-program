import { NextResponse } from "next/server";
import { heartbeat } from "@/lib/blather-room";

export async function POST(req: Request) {
  try {
    const { roomId, playerId } = await req.json();

    if (!roomId || !playerId) {
      return NextResponse.json({ error: "Missing roomId or playerId" }, { status: 400 });
    }

    const room = await heartbeat(roomId, playerId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Strip the secret word from non-describer players during active play
    const safeRoom = { ...room };
    if (room.status === "describing") {
      const currentRound = room.rounds[room.currentRound];
      if (currentRound && currentRound.describerId !== playerId) {
        // Hide the word bank entries that haven't been played yet
        safeRoom.wordBank = room.wordBank.map((w, i) => {
          if (i >= room.currentRound) {
            return { ...w, word: "???" };
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
