import { NextResponse } from "next/server"
import {
  startGame,
  submitAnswer,
  tickTimer,
  nextQuestion,
  showScores,
  resetRoom,
} from "@/lib/rooms"

export async function POST(request: Request) {
  const body = await request.json()
  const { action, code, playerId, answer } = body

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Missing room code" }, { status: 400 })
  }

  let room = null

  switch (action) {
    case "start":
      room = startGame(code, playerId)
      break
    case "answer":
      if (!answer || !["phishing", "legit"].includes(answer)) {
        return NextResponse.json({ error: "Invalid answer" }, { status: 400 })
      }
      room = submitAnswer(code, playerId, answer as "phishing" | "legit")
      break
    case "tick":
      room = tickTimer(code)
      break
    case "next":
      room = nextQuestion(code, playerId)
      break
    case "scores":
      room = showScores(code, playerId)
      break
    case "reset":
      room = resetRoom(code, playerId)
      break
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  if (!room) {
    return NextResponse.json({ error: "Action failed" }, { status: 400 })
  }

  return NextResponse.json({ room })
}
