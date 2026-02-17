import { NextResponse } from "next/server";
import { createRoom } from "@/lib/blather-room";

export async function POST(req: Request) {
  try {
    const { hostName } = await req.json();

    if (!hostName || typeof hostName !== "string" || hostName.trim().length < 1) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (hostName.trim().length > 20) {
      return NextResponse.json({ error: "Name too long (max 20 chars)" }, { status: 400 });
    }

    const result = await createRoom(hostName.trim());
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
