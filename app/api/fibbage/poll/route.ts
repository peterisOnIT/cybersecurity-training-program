import { NextResponse } from "next/server";
import { heartbeat, getRoom } from "@/lib/fibbage-room";

export async function POST(req: Request) {
  try {
    const { roomId, playerId } = await req.json();

    if (!roomId || !playerId) {
      return NextResponse.json({ error: "Missing roomId or playerId" }, { status: 400 });
    }

    // Try heartbeat, fall back to read-only if player not registered yet
    let room = await heartbeat(roomId, playerId);
    if (!room) {
      room = await getRoom(roomId);
    }

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Build a safe copy -- hide lies during writing phase, hide truth author during voting
    const safeRoom = JSON.parse(JSON.stringify(room));

    if (room.status === "writing") {
      // Hide other players' lies during writing
      safeRoom.players.forEach((p: { id: string; lie: string | null }) => {
        if (p.id !== playerId && p.lie !== null) {
          p.lie = "__submitted__"; // indicate they've submitted but hide content
        }
      });
    }

    if (room.status === "voting") {
      // Don't reveal which answer is the truth or who wrote which lie
      const round = safeRoom.rounds[safeRoom.currentRound];
      if (round) {
        round.answers = round.answers.map((a: { id: string; text: string; authorId: string | null }) => ({
          id: a.id,
          text: a.text,
          authorId: undefined, // strip authorship info
        }));
      }
    }

    return NextResponse.json({ room: safeRoom });
  } catch {
    return NextResponse.json({ error: "Failed to poll" }, { status: 500 });
  }
}
