import { sql } from "drizzle-orm";
import { boolean, customType, index, integer, jsonb, numeric, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

const geometry = customType<{ data: string; config: { type: string; srid?: number } }>({
  dataType(config) {
    return `geometry(${config?.type ?? "Point"},${config?.srid ?? 4326})`;
  },
});

const geography = geometry;

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const entityTypeEnum = pgEnum("entity_type", ["SCI", "Promoteur", "Agence", "Constructeur", "Lotisseur", "Autre"]);
export const entityStatusEnum = pgEnum("entity_status", ["actif", "inactif", "non_verifie"]);
export const propertyTypeEnum = pgEnum("property_type", ["terrain", "immeuble", "appartement", "villa", "local_commercial", "bureau", "entrepot", "autre"]);
export const propertyEtatEnum = pgEnum("property_etat", ["occupe", "vacant", "en_construction", "en_renovation"]);
export const propertyUsageEnum = pgEnum("property_usage", ["habitation", "commercial", "mixte", "industriel", "agricole"]);
export const fiscalStatusEnum = pgEnum("fiscal_status", ["declare", "paye", "en_retard", "contentieux"]);
export const auditActionEnum = pgEnum("audit_action", ["create", "update", "delete", "validate"]);
export const alertTypeEnum = pgEnum("alert_type", ["missing_cme", "missing_ansd", "missing_registration", "data_mismatch", "duplicate", "fiscal_anomaly"]);
export const alertSeverityEnum = pgEnum("alert_severity", ["low", "medium", "high"]);
export const dataSourceStatusEnum = pgEnum("data_source_status", ["pending", "importing", "completed", "error"]);
export const reportTypeEnum = pgEnum("report_type", ["fiche_entite", "analyse_fiscale", "inventaire_biens", "rapport_global"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  ninea: varchar("ninea", { length: 64 }).unique(),
  type: entityTypeEnum("type").notNull(),
  denomination: varchar("denomination", { length: 512 }).notNull(),
  enseigne: varchar("enseigne", { length: 256 }),
  sigle: varchar("sigle", { length: 64 }),
  adresse: text("adresse"),
  localite: varchar("localite", { length: 128 }),
  region: varchar("region", { length: 64 }),
  departement: varchar("departement", { length: 64 }),
  telephone: varchar("telephone", { length: 64 }),
  telephoneMobile: varchar("telephoneMobile", { length: 64 }),
  email: varchar("email", { length: 256 }),
  formeJuridique: varchar("formeJuridique", { length: 128 }),
  activite: text("activite"),
  secteurActivite: varchar("secteurActivite", { length: 256 }),
  centreFiscal: varchar("centreFiscal", { length: 128 }),
  regimeFiscal: varchar("regimeFiscal", { length: 128 }),
  dateEnregistrement: timestamp("dateEnregistrement", { withTimezone: true }),
  capital: varchar("capital", { length: 64 }),
  registreCommerce: varchar("registreCommerce", { length: 128 }),
  presentCME: boolean("presentCME").default(false),
  presentANSD: boolean("presentANSD").default(false),
  presentSIGTAS: boolean("presentSIGTAS").default(false),
  presentSVLMOD: boolean("presentSVLMOD").default(false),
  presentScraper: boolean("presentScraper").default(false),
  hasEntreprises: boolean("hasEntreprises").default(false),
  numeroAbonne: varchar("numeroAbonne", { length: 64 }),
  numeroCompteur: varchar("numeroCompteur", { length: 64 }),
  status: entityStatusEnum("status").default("non_verifie"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  location: geography("location", { type: "Point", srid: 4326 }),
  zone: varchar("zone", { length: 64 }),
  nombreBiens: integer("nombreBiens").default(0),
  nombreParcelles: integer("nombreParcelles").default(0),
  valeurTotaleBiens: numeric("valeurTotaleBiens", { precision: 18, scale: 2 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()).notNull(),
  createdBy: integer("createdBy"),
  updatedBy: integer("updatedBy"),
}, (t) => [index("entities_type_idx").on(t.type)]);

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  entityId: integer("entityId").references(() => entities.id, { onDelete: "set null" }),
  reference: varchar("reference", { length: 128 }),
  typeBien: propertyTypeEnum("typeBien").default("autre"),
  designation: varchar("designation", { length: 512 }),
  adresse: text("adresse"),
  zone: varchar("zone", { length: 64 }),
  commune: varchar("commune", { length: 128 }),
  section: varchar("section", { length: 32 }),
  numeroParcelle: varchar("numeroParcelle", { length: 64 }),
  superficie: numeric("superficie", { precision: 14, scale: 2 }),
  superficieBatie: numeric("superficieBatie", { precision: 14, scale: 2 }),
  valeurLocative: numeric("valeurLocative", { precision: 18, scale: 2 }),
  valeurVenale: numeric("valeurVenale", { precision: 18, scale: 2 }),
  dateAcquisition: timestamp("dateAcquisition", { withTimezone: true }),
  modeAcquisition: varchar("modeAcquisition", { length: 64 }),
  titreFoncier: varchar("titreFoncier", { length: 128 }),
  etat: propertyEtatEnum("etat").default("occupe"),
  usage: propertyUsageEnum("usage").default("habitation"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  location: geography("location", { type: "Point", srid: 4326 }),
  sourceData: varchar("sourceData", { length: 64 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()).notNull(),
}, (t) => [index("properties_entity_id_idx").on(t.entityId)]);

export const parcelles = pgTable("parcelles", {
  id: serial("id").primaryKey(),
  entityId: integer("entityId").references(() => entities.id, { onDelete: "set null" }),
  propertyId: integer("propertyId").references(() => properties.id, { onDelete: "set null" }),
  nicad: varchar("nicad", { length: 64 }).unique(),
  referenceCadastrale: varchar("referenceCadastrale", { length: 128 }),
  proprietaire: varchar("proprietaire", { length: 256 }),
  ninea: varchar("ninea", { length: 64 }),
  telephone: varchar("telephone", { length: 64 }),
  numLot: varchar("numLot", { length: 64 }),
  quartier: varchar("quartier", { length: 128 }),
  nomRue: varchar("nomRue", { length: 256 }),
  surface: numeric("surface", { precision: 14, scale: 2 }),
  zone: varchar("zone", { length: 64 }),
  section: varchar("section", { length: 32 }),
  commune: varchar("commune", { length: 128 }),
  region: varchar("region", { length: 64 }),
  dateRecensement: timestamp("dateRecensement", { withTimezone: true }),
  geometry: jsonb("geometry"),
  shape: geometry("shape", { type: "MultiPolygon", srid: 4326 }),
  centroidLat: numeric("centroidLat", { precision: 10, scale: 7 }),
  centroidLng: numeric("centroidLng", { precision: 10, scale: 7 }),
  centroid: geography("centroid", { type: "Point", srid: 4326 }),
  matchScore: integer("matchScore"),
  matchMethod: varchar("matchMethod", { length: 32 }),
  sourceData: varchar("sourceData", { length: 64 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("parcelles_entity_id_idx").on(t.entityId),
  index("parcelles_property_id_idx").on(t.propertyId),
  index("parcelles_shape_gist_idx").using("gist", t.shape),
  index("parcelles_centroid_gist_idx").using("gist", t.centroid),
]);

export const fiscalData = pgTable("fiscal_data", {
  id: serial("id").primaryKey(),
  entityId: integer("entityId").references(() => entities.id, { onDelete: "set null" }),
  annee: integer("annee"),
  typeImpot: varchar("typeImpot", { length: 64 }),
  montantDeclare: numeric("montantDeclare", { precision: 18, scale: 2 }),
  montantPaye: numeric("montantPaye", { precision: 18, scale: 2 }),
  dateDeclaration: timestamp("dateDeclaration", { withTimezone: true }),
  datePaiement: timestamp("datePaiement", { withTimezone: true }),
  statut: fiscalStatusEnum("statut").default("declare"),
  source: varchar("source", { length: 32 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("fiscal_data_entity_id_idx").on(t.entityId)]);

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  entityId: integer("entityId").notNull().references(() => entities.id, { onDelete: "cascade" }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "restrict" }),
  action: auditActionEnum("action").notNull(),
  previousData: jsonb("previousData"),
  newData: jsonb("newData"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("audit_logs_entity_id_idx").on(t.entityId), index("audit_logs_user_id_idx").on(t.userId)]);

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  entityId: integer("entityId").references(() => entities.id, { onDelete: "set null" }),
  type: alertTypeEnum("type").notNull(),
  severity: alertSeverityEnum("severity").default("medium"),
  description: text("description").notNull(),
  resolved: boolean("resolved").default(false),
  resolvedBy: integer("resolvedBy").references(() => users.id, { onDelete: "set null" }),
  resolvedAt: timestamp("resolvedAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("alerts_entity_id_idx").on(t.entityId), index("alerts_resolved_idx").on(t.resolved)]);

export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  lastImport: timestamp("lastImport", { withTimezone: true }),
  recordCount: integer("recordCount").default(0),
  status: dataSourceStatusEnum("status").default("pending"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("data_sources_name_uq").on(t.name)]);

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  entityId: integer("entityId").references(() => entities.id, { onDelete: "set null" }),
  type: reportTypeEnum("type").notNull(),
  titre: varchar("titre", { length: 256 }).notNull(),
  contenu: jsonb("contenu"),
  fileUrl: varchar("fileUrl", { length: 512 }),
  generatedBy: integer("generatedBy").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("reports_entity_id_idx").on(t.entityId)]);

export const setSpatialDerivedColumnsSql = sql`
  -- Populate geography/geometry from legacy lat/lng/json fields after ETL.
  -- 1) entities.location from entities.latitude/entities.longitude
  -- 2) properties.location from properties.latitude/properties.longitude
  -- 3) parcelles.shape from parcelles.geometry (GeoJSON), parcelles.centroid from centroidLat/centroidLng
`;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Entity = typeof entities.$inferSelect;
export type InsertEntity = typeof entities.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;
export type Parcelle = typeof parcelles.$inferSelect;
export type InsertParcelle = typeof parcelles.$inferInsert;
export type FiscalData = typeof fiscalData.$inferSelect;
export type InsertFiscalData = typeof fiscalData.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;
export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = typeof dataSources.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
