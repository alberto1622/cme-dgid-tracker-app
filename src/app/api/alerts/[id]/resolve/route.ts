import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveAlert } from "@/api/db";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await ctx.params;
    await resolveAlert(Number(id), null);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/alerts/:id/resolve]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
