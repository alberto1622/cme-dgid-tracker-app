import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { alerts, dataSources, entities } from "@/db/schema";

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
