import { NextResponse } from "next/server";
import { getDataSources } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDataSources();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/dashboard/data-sources]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
