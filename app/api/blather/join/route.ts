import { NextResponse } from "next/server";
import { joinRoom } from "@/lib/blather-room";

export async function POST(req: Request) {
  try {
    const { roomId, playerName } = await req.json();

    if (!roomId || typeof roomId !== "string") {
      return NextResponse.json({ error: "Room code is required" }, { status: 400 });
    }

    if (!playerName || typeof playerName !== "string" || playerName.trim().length < 1) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (playerName.trim().length > 20) {
      return NextResponse.json({ error: "Name too long" }, { status: 400 });
    }

    const result = await joinRoom(roomId.toUpperCase().trim(), playerName.trim());

    if (!result) {
      return NextResponse.json(
        { error: "Room not found, game already started, room full, or name taken" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
