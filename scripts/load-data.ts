// scripts/load-data.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { sql } from 'drizzle-orm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  parcelles,
  entities,
  properties,
  reports,
} from '../src/db/schema';

const SEED_PATH = path.resolve(__dirname, '../data/seed-data.json');
const BATCH_SIZE = 500;

type Json = Record<string, any>;

function toDate(v: any): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toBool(v: any): boolean {
  return v === 1 || v === true || v === '1';
}

function pointWKT(lat: any, lng: any): string | null {
  const la = lat == null ? NaN : Number(lat);
  const ln = lng == null ? NaN : Number(lng);
  if (isNaN(la) || isNaN(ln)) return null;
  return `SRID=4326;POINT(${ln} ${la})`;
}

function num(v: any): string | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : String(v);
}

async function insertInBatches<T>(
  rows: T[],
  label: string,
  insertFn: (batch: T[]) => Promise<void>,
) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    try {
      await insertFn(batch);
      inserted += batch.length;
    } catch (e) {
      console.error(`Erreur batch ${label} [${i}-${i + batch.length}]`, e);
      throw e;
    }
    if ((i / BATCH_SIZE) % 20 === 0) {
      console.log(`  ${label}: ${inserted}/${rows.length}`);
    }
  }
  console.log(`✓ ${label}: ${inserted} insérés`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL manquant');
    process.exit(1);
  }

  console.log(`Lecture du fichier ${SEED_PATH}...`);
  const raw = fs.readFileSync(SEED_PATH, 'utf-8');
  const data = JSON.parse(raw) as Json;
  console.log(
    `Entités: ${data.entities?.length ?? 0} | Parcelles: ${data.parcelles?.length ?? 0} | Propriétés: ${data.properties?.length ?? 0}`,
  );

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client);

  try {
    // ---- ENTITIES ----
    const entitiesRows = (data.entities ?? []).map((e: Json) => ({
      id: e.id,
      ninea: e.ninea ?? null,
      type: e.type ?? 'Autre',
      denomination: e.denomination ?? '(sans nom)',
      enseigne: e.enseigne ?? null,
      sigle: e.sigle ?? null,
      adresse: e.adresse ?? null,
      localite: e.localite ?? null,
      region: e.region ?? null,
      departement: e.departement ?? null,
      telephone: e.telephone ?? null,
      telephoneMobile: e.telephoneMobile ?? null,
      email: e.email ?? null,
      formeJuridique: e.formeJuridique ?? null,
      activite: e.activite ?? null,
      secteurActivite: e.secteurActivite ?? null,
      centreFiscal: e.centreFiscal ?? null,
      regimeFiscal: e.regimeFiscal ?? null,
      dateEnregistrement: toDate(e.dateEnregistrement),
      capital: e.capital ?? null,
      registreCommerce: e.registreCommerce ?? null,
      presentCME: toBool(e.presentCME),
      presentANSD: toBool(e.presentANSD),
      presentSIGTAS: toBool(e.presentSIGTAS),
      presentSVLMOD: toBool(e.presentSVLMOD),
      presentScraper: toBool(e.presentScraper),
      hasEntreprises: toBool(e.hasEntreprises),
      numeroAbonne: e.numeroAbonne ?? null,
      numeroCompteur: e.numeroCompteur ?? null,
      status: e.status ?? 'non_verifie',
      latitude: num(e.latitude),
      longitude: num(e.longitude),
      location: pointWKT(e.latitude, e.longitude) as any,
      zone: e.zone ?? null,
      nombreBiens: e.nombreBiens ?? 0,
      nombreParcelles: e.nombreParcelles ?? 0,
      valeurTotaleBiens: num(e.valeurTotaleBiens),
      createdAt: toDate(e.createdAt) ?? new Date(),
      updatedAt: toDate(e.updatedAt) ?? new Date(),
      createdBy: e.createdBy ?? null,
      updatedBy: e.updatedBy ?? null,
    }));

    console.log('Insertion entities...');
    await insertInBatches(entitiesRows, 'entities', async (batch) => {
      await db.insert(entities).values(batch).onConflictDoNothing();
    });

    // Réinitialiser la séquence sur le max(id)
    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('entities', 'id'), COALESCE((SELECT MAX(id) FROM entities), 1))`,
    );

    // ---- PROPERTIES ----
    const propertiesRows = (data.properties ?? []).map((p: Json) => ({
      id: p.id,
      entityId: p.entityId ?? null,
      reference: p.reference ?? null,
      typeBien: p.typeBien ?? 'autre',
      designation: p.designation ?? null,
      adresse: p.adresse ?? null,
      zone: p.zone ?? null,
      commune: p.commune ?? null,
      section: p.section ?? null,
      numeroParcelle: p.numeroParcelle ?? null,
      superficie: num(p.superficie),
      superficieBatie: num(p.superficieBatie),
      valeurLocative: num(p.valeurLocative),
      valeurVenale: num(p.valeurVenale),
      dateAcquisition: toDate(p.dateAcquisition),
      modeAcquisition: p.modeAcquisition ?? null,
      titreFoncier: p.titreFoncier ?? null,
      etat: p.etat ?? 'occupe',
      usage: p.usage ?? 'habitation',
      latitude: num(p.latitude),
      longitude: num(p.longitude),
      location: pointWKT(p.latitude, p.longitude) as any,
      sourceData: p.sourceData ?? null,
      createdAt: toDate(p.createdAt) ?? new Date(),
      updatedAt: toDate(p.updatedAt) ?? new Date(),
    }));

    console.log('Insertion properties...');
    await insertInBatches(propertiesRows, 'properties', async (batch) => {
      await db.insert(properties).values(batch).onConflictDoNothing();
    });

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('properties', 'id'), COALESCE((SELECT MAX(id) FROM properties), 1))`,
    );

    // ---- PARCELLES ----
    const parcellesRows = (data.parcelles ?? []).map((p: Json) => ({
      id: p.id,
      entityId: p.entityId ?? null,
      propertyId: p.propertyId ?? null,
      nicad: p.nicad ?? null,
      referenceCadastrale: p.referenceCadastrale ?? null,
      proprietaire: p.proprietaire ?? null,
      ninea: p.ninea ?? null,
      telephone: p.telephone ?? null,
      numLot: p.numLot ?? null,
      quartier: p.quartier ?? null,
      nomRue: p.nomRue ?? null,
      surface: num(p.surface),
      zone: p.zone ?? null,
      section: p.section ?? null,
      commune: p.commune ?? null,
      region: p.region ?? null,
      dateRecensement: toDate(p.dateRecensement),
      geometry: p.geometry ?? null,
      centroidLat: num(p.centroidLat),
      centroidLng: num(p.centroidLng),
      centroid: pointWKT(p.centroidLat, p.centroidLng) as any,
      matchScore: p.matchScore ?? null,
      matchMethod: p.matchMethod ?? null,
      sourceData: p.sourceFile ?? p.sourceData ?? null,
      createdAt: toDate(p.createdAt) ?? new Date(),
    }));

    console.log('Insertion parcelles...');
    await insertInBatches(parcellesRows, 'parcelles', async (batch) => {
      await db.insert(parcelles).values(batch).onConflictDoNothing();
    });

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('parcelles', 'id'), COALESCE((SELECT MAX(id) FROM parcelles), 1))`,
    );

    // ---- REPORTS (optionnel, ignoré si users absent) ----
    if (Array.isArray(data.reports) && data.reports.length > 0) {
      const reportsRows = data.reports.map((r: Json) => ({
        id: r.id,
        entityId: r.entityId ?? null,
        type: r.type,
        titre: r.titre,
        contenu: r.contenu ?? null,
        fileUrl: r.fileUrl ?? null,
        generatedBy: null, // évite FK vers users
        createdAt: toDate(r.createdAt) ?? new Date(),
      }));
      console.log('Insertion reports...');
      await insertInBatches(reportsRows, 'reports', async (batch) => {
        await db.insert(reports).values(batch).onConflictDoNothing();
      });
    }

    // ---- Stats finales ----
    const [{ c: entCount }] = await db.execute<{ c: string }>(
      sql`SELECT COUNT(*)::text AS c FROM entities`,
    ).then((r: any) => r.rows ?? r);
    console.log(`Total entities: ${entCount}`);
  } catch (error) {
    console.error('Erreur lors du chargement :', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
