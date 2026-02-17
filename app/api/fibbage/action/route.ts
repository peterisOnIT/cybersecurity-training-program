import { NextResponse } from "next/server";
import {
  startGame,
  submitLie,
  submitVote,
  advancePhase,
  playAgain,
  updateSettings,
} from "@/lib/fibbage-room";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, playerId, action } = body;

    if (!roomId || !playerId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let room = null;

    switch (action) {
      case "start":
        room = await startGame(roomId, playerId);
        break;
      case "submit_lie":
        if (!body.lie || typeof body.lie !== "string") {
          return NextResponse.json({ error: "Answer is required" }, { status: 400 });
        }
        room = await submitLie(roomId, playerId, body.lie);
        break;
      case "submit_vote":
        if (!body.answerId) {
          return NextResponse.json({ error: "Answer ID is required" }, { status: 400 });
        }
        room = await submitVote(roomId, playerId, body.answerId);
        break;
      case "advance":
        room = await advancePhase(roomId, playerId);
        break;
      case "play_again":
        room = await playAgain(roomId, playerId);
        break;
      case "update_settings":
        if (!body.settings || typeof body.settings !== "object") {
          return NextResponse.json({ error: "Settings object is required" }, { status: 400 });
        }
        room = await updateSettings(roomId, playerId, body.settings);
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    if (!room) {
      return NextResponse.json({ error: "Action failed" }, { status: 400 });
    }

    return NextResponse.json({ room });
  } catch {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
