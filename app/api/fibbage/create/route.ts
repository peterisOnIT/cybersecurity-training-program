import { NextResponse } from "next/server";
import { createRoom } from "@/lib/fibbage-room";

export async function POST(req: Request) {
  try {
    const { hostName } = await req.json();
    if (!hostName || typeof hostName !== "string" || hostName.trim().length < 1) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const result = await createRoom(hostName.trim().slice(0, 16));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
