import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  var __pgPool: Pool | undefined;
  var __drizzleDb: NodePgDatabase<typeof schema> | undefined;
}

function getDb(): NodePgDatabase<typeof schema> {
  if (global.__drizzleDb) return global.__drizzleDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const pool = global.__pgPool ?? new Pool({ connectionString });
  if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

  const instance = drizzle(pool, { schema });
  if (process.env.NODE_ENV !== "production") global.__drizzleDb = instance;
  return instance;
}

export const db: NodePgDatabase<typeof schema> = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? (value as Function).bind(real) : value;
  },
});

export { schema };
