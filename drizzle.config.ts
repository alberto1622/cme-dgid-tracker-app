import { defineConfig } from "drizzle-kit";
import { env } from "node:process";

const connectionString = env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  tablesFilter: ["!spatial_ref_sys", "!geography_columns", "!geometry_columns", "!raster_columns", "!raster_overviews"],
});