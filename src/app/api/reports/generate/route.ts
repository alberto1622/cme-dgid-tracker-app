import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReport, getEntityFullDetails } from "@/api/db";

export const dynamic = "force-dynamic";

const TYPES = ["fiche_entite", "analyse_fiscale", "inventaire_biens", "rapport_global"] as const;
type ReportType = (typeof TYPES)[number];

const TITRE_PREFIX: Record<ReportType, string> = {
  fiche_entite: "Fiche",
  analyse_fiscale: "Analyse fiscale",
  inventaire_biens: "Inventaire des biens",
  rapport_global: "Rapport global",
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const entityId = Number(body?.entityId);
    const type = body?.type as ReportType;

    if (!entityId || !TYPES.includes(type)) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const entity = await getEntityFullDetails(entityId);
    if (!entity) return NextResponse.json({ error: "Entité introuvable" }, { status: 404 });

    const titre = `${TITRE_PREFIX[type]} - ${entity.denomination}`;
    const id = await createReport({
      entityId,
      type,
      titre,
      contenu: {
        entity: {
          id: entity.id,
          ninea: entity.ninea,
          denomination: entity.denomination,
          type: entity.type,
        },
        properties: entity.properties,
        generatedAt: new Date().toISOString(),
        generatedBy: session?.user?.email ?? null,
      },
    });

    return NextResponse.json({ id, titre });
  } catch (error) {
    console.error("[api/reports/generate]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
