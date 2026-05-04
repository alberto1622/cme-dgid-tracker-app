import { NextResponse } from "next/server";
import { getAlerts } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resolved = searchParams.get("resolved") === "true";
    const limit = Number(searchParams.get("limit") ?? 50);
    const data = await getAlerts(resolved, limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/alerts]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
