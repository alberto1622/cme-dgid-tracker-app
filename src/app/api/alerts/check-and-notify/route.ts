import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStatistics } from "@/api/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stats = await getStatistics();
    const total = (stats.cmeOnly ?? 0) + (stats.ansdOnly ?? 0) + (stats.scraperNotCME ?? 0);

    return NextResponse.json({
      success: true,
      notified: total > 0,
      totalInconsistencies: total,
    });
  } catch (error) {
    console.error("[api/alerts/check-and-notify]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
