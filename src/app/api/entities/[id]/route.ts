import { NextResponse } from "next/server";
import { getEntityById } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const entity = await getEntityById(Number(id));
    if (!entity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(entity);
  } catch (error) {
    console.error("[api/entities/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
