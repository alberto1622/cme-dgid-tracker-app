import { NextResponse } from "next/server";
import { getTypeDistribution } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTypeDistribution();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/dashboard/type-distribution]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
