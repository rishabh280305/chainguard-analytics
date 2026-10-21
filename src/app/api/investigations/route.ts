import { z } from "zod";
import { database } from "@/lib/db";
import { getDemoUser } from "@/lib/session";

const inputSchema = z.object({
  txHash: z.string().trim().regex(/^0x[a-fA-F0-9]{64}$/),
  note: z.string().trim().max(500).default(""),
});

export async function GET() {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const sql = await database();
  const items = await sql`SELECT id, tx_hash, note, status, created_at FROM chainguard.investigations WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 30`;
  return Response.json({ items, provenance: "User-entered transaction hashes only; RPC enrichment and anomaly scoring are not yet active." });
}

export async function POST(request: Request) {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a 0x-prefixed 64-character Ethereum transaction hash." }, { status: 400 });
  const sql = await database();
  const [item] = await sql`INSERT INTO chainguard.investigations (user_id, tx_hash, note)
    VALUES (${userId}, ${parsed.data.txHash.toLowerCase()}, ${parsed.data.note})
    ON CONFLICT (user_id, tx_hash) DO UPDATE SET note = EXCLUDED.note
    RETURNING id, tx_hash, note, status, created_at`;
  return Response.json({ item, enrichmentStatus: "Saved only; no blockchain facts or risk score have been inferred." }, { status: 201 });
}
