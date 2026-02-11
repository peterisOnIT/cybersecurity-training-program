import { NextResponse } from "next/server"
import { createRoom, joinRoom, getRoom } from "@/lib/rooms"

// POST: Create or join a room
export async function POST(request: Request) {
  const body = await request.json()
  const { action, name, code } = body

  if (action === "create") {
    if (!name || typeof name !== "string" || name.trim().length < 1 || name.trim().length > 16) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }
    const result = createRoom(name.trim())
    return NextResponse.json({
      room: result.room,
      playerId: result.playerId,
    })
  }

  if (action === "join") {
    if (!name || typeof name !== "string" || name.trim().length < 1 || name.trim().length > 16) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }
    if (!code || typeof code !== "string" || code.trim().length !== 4) {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 })
    }
    const result = joinRoom(code.trim().toUpperCase(), name.trim())
    if (!result) {
      return NextResponse.json({ error: "Room not found, full, already started, or name taken" }, { status: 404 })
    }
    return NextResponse.json({
      room: result.room,
      playerId: result.playerId,
    })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

// GET: Poll room state
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  if (!code) {
    return NextResponse.json({ error: "Missing room code" }, { status: 400 })
  }

  const room = getRoom(code)
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  return NextResponse.json({ room })
}
