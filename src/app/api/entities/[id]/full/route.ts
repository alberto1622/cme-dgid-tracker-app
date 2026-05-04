import { NextResponse } from "next/server";
import { getEntityFullDetails } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const entity = await getEntityFullDetails(Number(id));
    if (!entity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(entity);
  } catch (error) {
    console.error("[api/entities/:id/full]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
