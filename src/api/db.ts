import { and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { alerts, dataSources, entities, parcelles, reports } from "@/db/schema";

export async function getStatistics() {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      sci: sql<number>`count(*) filter (where ${entities.type} = 'SCI')::int`,
      promoteurs: sql<number>`count(*) filter (where ${entities.type} = 'Promoteur')::int`,
      agences: sql<number>`count(*) filter (where ${entities.type} = 'Agence')::int`,
      cmeOnly: sql<number>`count(*) filter (where ${entities.presentCME} = true and ${entities.presentANSD} = false)::int`,
      ansdOnly: sql<number>`count(*) filter (where ${entities.presentANSD} = true and ${entities.presentCME} = false)::int`,
      scraperNotCME: sql<number>`count(*) filter (where ${entities.presentScraper} = true and ${entities.presentCME} = false)::int`,
    })
    .from(entities);

  const [{ unresolvedAlerts }] = await db
    .select({ unresolvedAlerts: sql<number>`count(*)::int` })
    .from(alerts)
    .where(eq(alerts.resolved, false));

  return { ...row, unresolvedAlerts };
}

export async function getTypeDistribution() {
  return await db
    .select({
      type: entities.type,
      count: sql<number>`count(*)::int`,
    })
    .from(entities)
    .groupBy(entities.type)
    .orderBy(sql`count(*) desc`);
}

export async function getCentreFiscalDistribution() {
  return await db
    .select({
      centreFiscal: entities.centreFiscal,
      count: sql<number>`count(*)::int`,
    })
    .from(entities)
    .groupBy(entities.centreFiscal)
    .orderBy(sql`count(*) desc`);
}

export async function getDataSources() {
  return await db
    .select({
      id: dataSources.id,
      name: dataSources.name,
      status: dataSources.status,
      recordCount: dataSources.recordCount,
      lastImport: dataSources.lastImport,
    })
    .from(dataSources)
    .orderBy(dataSources.name);
}

export async function getAlerts(resolved: boolean, limit = 50) {
  return await db
    .select()
    .from(alerts)
    .where(eq(alerts.resolved, resolved))
    .orderBy(desc(alerts.createdAt))
    .limit(limit);
}

export async function resolveAlert(id: number, userId: number | null) {
  await db
    .update(alerts)
    .set({ resolved: true, resolvedBy: userId, resolvedAt: new Date() })
    .where(eq(alerts.id, id));
}

async function paginatedEntities(where: ReturnType<typeof eq> | ReturnType<typeof and>, limit: number, offset: number) {
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: entities.id,
        ninea: entities.ninea,
        type: entities.type,
        denomination: entities.denomination,
        centreFiscal: entities.centreFiscal,
        presentCME: entities.presentCME,
        presentANSD: entities.presentANSD,
        presentSIGTAS: entities.presentSIGTAS,
        presentSVLMOD: entities.presentSVLMOD,
        presentScraper: entities.presentScraper,
      })
      .from(entities)
      .where(where)
      .orderBy(entities.denomination)
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(entities)
      .where(where),
  ]);
  return { data: rows, total };
}

export function getCMENotANSD(limit: number, offset: number) {
  return paginatedEntities(
    and(eq(entities.presentCME, true), eq(entities.presentANSD, false))!,
    limit,
    offset,
  );
}

export function getANSDNotCME(limit: number, offset: number) {
  return paginatedEntities(
    and(eq(entities.presentANSD, true), eq(entities.presentCME, false))!,
    limit,
    offset,
  );
}

export function getScraperNotCME(limit: number, offset: number) {
  return paginatedEntities(
    and(eq(entities.presentScraper, true), eq(entities.presentCME, false))!,
    limit,
    offset,
  );
}

export type EntitiesFilters = {
  type?: string;
  search?: string;
  presentCME?: boolean;
  presentANSD?: boolean;
  presentScraper?: boolean;
  zone?: string;
  status?: string;
  centreFiscal?: string;
  limit?: number;
  offset?: number;
};

export async function getEntities(filters: EntitiesFilters) {
  const c: ReturnType<typeof eq>[] = [];

  if (filters.type) c.push(eq(entities.type, filters.type as never));
  if (filters.status) c.push(eq(entities.status, filters.status as never));
  if (filters.zone) c.push(eq(entities.zone, filters.zone));
  if (filters.centreFiscal) c.push(eq(entities.centreFiscal, filters.centreFiscal));
  if (filters.presentCME !== undefined) c.push(eq(entities.presentCME, filters.presentCME));
  if (filters.presentANSD !== undefined) c.push(eq(entities.presentANSD, filters.presentANSD));
  if (filters.presentScraper !== undefined) c.push(eq(entities.presentScraper, filters.presentScraper));
  if (filters.search) {
    const term = `%${filters.search}%`;
    c.push(
      sql`(${entities.denomination} ILIKE ${term} OR ${entities.ninea} ILIKE ${term} OR ${entities.adresse} ILIKE ${term})` as never,
    );
  }

  const where = c.length > 0 ? and(...c) : undefined;
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const [data, [{ total }]] = await Promise.all([
    db.select().from(entities).where(where).orderBy(entities.denomination).limit(limit).offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(entities).where(where),
  ]);

  return { data, total };
}

export async function getEntityById(id: number) {
  const [row] = await db.select().from(entities).where(eq(entities.id, id)).limit(1);
  return row ?? null;
}

export async function getReports() {
  return await db
    .select({
      id: reports.id,
      entityId: reports.entityId,
      type: reports.type,
      titre: reports.titre,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .orderBy(desc(reports.createdAt))
    .limit(100);
}

export async function searchDoublons(query: string, searchBy: "denomination" | "ninea") {
  const term = `%${query}%`;
  const where = searchBy === "ninea"
    ? sql`${entities.ninea} ILIKE ${term}`
    : sql`${entities.denomination} ILIKE ${term}`;
  return await db
    .select({
      id: entities.id,
      denomination: entities.denomination,
      ninea: entities.ninea,
      type: entities.type,
      adresse: entities.adresse,
      presentCME: entities.presentCME,
      presentANSD: entities.presentANSD,
      presentSIGTAS: entities.presentSIGTAS,
      presentSVLMOD: entities.presentSVLMOD,
      presentScraper: entities.presentScraper,
    })
    .from(entities)
    .where(where)
    .limit(50);
}

export async function getMatchingStats() {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      linked: sql<number>`count(*) filter (where ${parcelles.entityId} is not null)::int`,
      unlinked: sql<number>`count(*) filter (where ${parcelles.entityId} is null)::int`,
    })
    .from(parcelles);
  return row;
}
