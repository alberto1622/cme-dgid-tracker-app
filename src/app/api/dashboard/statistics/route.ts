import { NextResponse } from "next/server";
import { getStatistics } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getStatistics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/dashboard/statistics]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
