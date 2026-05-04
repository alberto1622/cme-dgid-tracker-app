import { NextResponse } from "next/server";
import { getParcellesForMap, type MapBounds } from "@/api/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const north = searchParams.get("north");
    const south = searchParams.get("south");
    const east = searchParams.get("east");
    const west = searchParams.get("west");
    const limit = Number(searchParams.get("limit") ?? 5000);

    let bounds: MapBounds | undefined;
    if (north && south && east && west) {
      bounds = {
        north: Number(north),
        south: Number(south),
        east: Number(east),
        west: Number(west),
      };
    }

    const data = await getParcellesForMap(bounds, limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/map/parcelles]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
