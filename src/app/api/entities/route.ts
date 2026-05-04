import { NextResponse } from "next/server";
import { getEntities, type EntitiesFilters } from "@/api/db";

export const dynamic = "force-dynamic";

function parseBool(v: string | null): boolean | undefined {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filters: EntitiesFilters = {
      type: searchParams.get("type") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      zone: searchParams.get("zone") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      centreFiscal: searchParams.get("centreFiscal") ?? undefined,
      presentCME: parseBool(searchParams.get("presentCME")),
      presentANSD: parseBool(searchParams.get("presentANSD")),
      presentScraper: parseBool(searchParams.get("presentScraper")),
      limit: Number(searchParams.get("limit") ?? 20),
      offset: Number(searchParams.get("offset") ?? 0),
    };
    const data = await getEntities(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/entities]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
