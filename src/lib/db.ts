import "server-only";
import { neon } from "@neondatabase/serverless";

function client() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return neon(connectionString);
}

let initialized: Promise<void> | null = null;

export async function database() {
  const sql = client();
  initialized ??= (async () => {
    await sql`CREATE SCHEMA IF NOT EXISTS chainguard`;
    await sql`CREATE TABLE IF NOT EXISTS chainguard.investigations (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id text NOT NULL,
      tx_hash text NOT NULL,
      note text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'reviewed')),
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (user_id, tx_hash)
    )`;
  })();
  await initialized;
  return sql;
}
