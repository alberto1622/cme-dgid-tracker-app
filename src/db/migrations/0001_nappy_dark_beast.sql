ALTER TABLE "entities" ALTER COLUMN "location" SET DATA TYPE geometry(Point,4326);--> statement-breakpoint
ALTER TABLE "parcelles" ALTER COLUMN "centroid" SET DATA TYPE geometry(Point,4326);--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "location" SET DATA TYPE geometry(Point,4326);