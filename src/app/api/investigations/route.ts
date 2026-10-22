import { z } from "zod";
import { database } from "@/lib/db";
import { getDemoUser } from "@/lib/session";

const inputSchema = z.object({
  txHash: z.string().trim().regex(/^0x[a-fA-F0-9]{64}$/),
  note: z.string().trim().max(500).default(""),
});

export async function GET(request:Request) {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const sql = await database();
  const status=new URL(request.url).searchParams.get("status");
  const items = status==="saved"||status==="reviewed"?await sql`SELECT id,tx_hash,note,status,created_at FROM chainguard.investigations WHERE user_id=${userId} AND status=${status} ORDER BY created_at DESC LIMIT 100`:await sql`SELECT id,tx_hash,note,status,created_at FROM chainguard.investigations WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 100`;
  if(new URL(request.url).searchParams.get("format")==="csv"){const csv=["id,tx_hash,status,note,created_at",...items.map(item=>[item.id,item.tx_hash,item.status,`"${String(item.note).replaceAll('"','""')}"`,item.created_at].join(","))].join("\n");return new Response(csv,{headers:{"Content-Type":"text/csv","Content-Disposition":"attachment; filename=chainguard-investigations.csv"}})}
  return Response.json({ items, provenance: "Analyst-authored case records. RPC facts and rule analysis remain separately attributed." });
}

const patchSchema=z.object({txHash:z.string().regex(/^0x[a-fA-F0-9]{64}$/),note:z.string().trim().max(500),status:z.enum(["saved","reviewed"])});export async function PATCH(request:Request){const userId=await getDemoUser();if(!userId)return Response.json({error:"Authentication required."},{status:401});const parsed=patchSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:"Provide a valid hash, note, and case status."},{status:400});const sql=await database();const[item]=await sql`UPDATE chainguard.investigations SET note=${parsed.data.note},status=${parsed.data.status} WHERE user_id=${userId} AND tx_hash=${parsed.data.txHash.toLowerCase()} RETURNING id,tx_hash,note,status,created_at`;if(!item)return Response.json({error:"Investigation not found."},{status:404});return Response.json({item})}

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
