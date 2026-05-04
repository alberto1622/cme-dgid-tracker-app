import { NextResponse } from "next/server";
import { getReports } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getReports();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/reports]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
