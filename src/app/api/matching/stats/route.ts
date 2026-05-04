import { NextResponse } from "next/server";
import { getMatchingStats } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getMatchingStats();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/matching/stats]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
