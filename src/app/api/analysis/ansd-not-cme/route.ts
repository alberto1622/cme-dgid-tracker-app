import { NextResponse } from "next/server";
import { getANSDNotCME } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? 100);
    const offset = Number(searchParams.get("offset") ?? 0);
    const data = await getANSDNotCME(limit, offset);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/analysis/ansd-not-cme]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
