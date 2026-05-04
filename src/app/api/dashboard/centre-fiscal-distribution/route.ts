import { NextResponse } from "next/server";
import { getCentreFiscalDistribution } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCentreFiscalDistribution();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/dashboard/centre-fiscal-distribution]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
