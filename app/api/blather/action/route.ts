import { NextResponse } from "next/server";
import {
  startCountdown,
  startGame,
  sendSentence,
  submitGuess,
  endRound,
  nextRound,
  resetRoom,
  leaveRoom,
  getRoom,
} from "@/lib/blather-room";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, roomId, playerId } = body;

    if (!action || !roomId || !playerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let room;

    switch (action) {
      case "start_countdown":
        room = await startCountdown(roomId, playerId);
        break;

      case "start_game":
        room = await startGame(roomId);
        break;

      case "send_sentence": {
        const template = String(body.template ?? "");
        const filled = String(body.filled ?? "");
        room = await sendSentence(roomId, playerId, template, filled);
        break;
      }

      case "submit_guess": {
        const guess = String(body.guess ?? "");
        room = await submitGuess(roomId, playerId, guess);
        break;
      }

      case "end_round":
        room = await endRound(roomId, playerId);
        break;

      case "next_round":
        room = await nextRound(roomId, playerId);
        break;

      case "reset":
        room = await resetRoom(roomId, playerId);
        break;

      case "leave":
        room = await leaveRoom(roomId, playerId);
        if (!room) {
          return NextResponse.json({ room: null, left: true });
        }
        break;

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    if (!room) {
      if (action === "next_round" || action === "end_round") {
        const fallback = await getRoom(body.roomId);
        if (fallback) return NextResponse.json({ room: fallback });
      }
      return NextResponse.json({ error: "Action failed" }, { status: 400 });
    }

    return NextResponse.json({ room });
  } catch {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
