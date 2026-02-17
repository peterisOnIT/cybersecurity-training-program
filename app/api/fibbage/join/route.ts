import { NextResponse } from "next/server";
import { joinRoom } from "@/lib/fibbage-room";

export async function POST(req: Request) {
  try {
    const { roomId, playerName } = await req.json();
    if (!roomId || !playerName) {
      return NextResponse.json({ error: "Room code and name are required" }, { status: 400 });
    }

    const result = await joinRoom(
      roomId.toUpperCase().trim(),
      playerName.trim().slice(0, 16)
    );

    if (!result) {
      return NextResponse.json(
        { error: "Room not found, full, game already started, or name taken" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
