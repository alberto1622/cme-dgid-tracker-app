import { NextResponse } from "next/server";
import { searchDoublons } from "@/api/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = String(body?.query ?? "").trim();
    const searchBy = body?.searchBy === "ninea" ? "ninea" : "denomination";
    if (!query) return NextResponse.json([], { status: 200 });
    const data = await searchDoublons(query, searchBy);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/doublons/search]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
