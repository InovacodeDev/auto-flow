import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";

const connectionString = process.env["DATABASE_URL"] || "postgresql://localhost:5432/autoflow";

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export const migrateDatabase = async () => {
    console.log("🔄 Running migrations...");
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("✅ Migrations completed!");
};

export * from "./schema";
