import { database } from "@/lib/db";
import { buildSnapshot, type RpcReceipt, type RpcTransaction } from "@/lib/ethereum";
import { getDemoUser } from "@/lib/session";

const HASH = /^0x[a-fA-F0-9]{64}$/;
const DEFAULT_RPC = "https://ethereum-rpc.publicnode.com";

type RpcResponse<T> = { result?: T; error?: { code: number; message: string } };

async function rpc<T>(endpoint: string, method: string, params: unknown[]) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`RPC provider returned HTTP ${response.status}.`);
  const payload = await response.json() as RpcResponse<T>;
  if (payload.error) throw new Error(`RPC error ${payload.error.code}: ${payload.error.message}`);
  return payload.result ?? null;
}

export async function GET(request: Request) {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const url = new URL(request.url);
  let hash = url.searchParams.get("hash")?.toLowerCase() ?? "";
  const sampleLatest = url.searchParams.get("sample") === "latest";
  if (!sampleLatest && !HASH.test(hash)) return Response.json({ error: "Enter a 0x-prefixed 64-character transaction hash." }, { status: 400 });

  const sql = await database();
  const [rate] = await sql`INSERT INTO chainguard.rpc_rate_windows (user_id, window_start, request_count)
    VALUES (${userId}, date_trunc('minute', now()), 1)
    ON CONFLICT (user_id, window_start) DO UPDATE SET request_count = chainguard.rpc_rate_windows.request_count + 1
    RETURNING request_count`;
  if (Number(rate.request_count) > 15) return Response.json({ error: "RPC lookup limit reached. Try again after the current minute." }, { status: 429, headers: { "Retry-After": "60" } });

  const endpoint = process.env.ETHEREUM_RPC_URL || DEFAULT_RPC;
  const source = new URL(endpoint).hostname;
  try {
    if (sampleLatest) {
      const latest = await rpc<{ transactions: string[] }>(endpoint, "eth_getBlockByNumber", ["latest", false]);
      hash = latest?.transactions.find(candidate => HASH.test(candidate))?.toLowerCase() ?? "";
      if (!hash) return Response.json({ error: "The latest block did not contain a transaction to inspect." }, { status: 404 });
    }
    const [cached] = await sql`SELECT snapshot, source, observed_at FROM chainguard.transaction_snapshots
      WHERE tx_hash = ${hash} AND observed_at > now() - interval '15 minutes'`;
    if (cached) return Response.json({ snapshot: cached.snapshot, cache: { hit: true, observedAt: cached.observed_at }, provider: cached.source });

    const [transaction, receipt] = await Promise.all([
      rpc<RpcTransaction>(endpoint, "eth_getTransactionByHash", [hash]),
      rpc<RpcReceipt>(endpoint, "eth_getTransactionReceipt", [hash]),
    ]);
    if (!transaction) return Response.json({ error: "Transaction was not found by the configured Ethereum mainnet provider." }, { status: 404 });
    let blockTimestamp: string | null = null;
    if (transaction.blockNumber) {
      const block = await rpc<{ timestamp: string }>(endpoint, "eth_getBlockByNumber", [transaction.blockNumber, false]);
      if (block?.timestamp) blockTimestamp = new Date(Number(BigInt(block.timestamp)) * 1000).toISOString();
    }
    const snapshot = buildSnapshot(transaction, receipt, blockTimestamp, source);
    await sql`INSERT INTO chainguard.transaction_snapshots (tx_hash, snapshot, source, observed_at)
      VALUES (${hash}, ${JSON.stringify(snapshot)}::jsonb, ${source}, now())
      ON CONFLICT (tx_hash) DO UPDATE SET snapshot = EXCLUDED.snapshot, source = EXCLUDED.source, observed_at = now()`;
    return Response.json({ snapshot, cache: { hit: false, observedAt: snapshot.observedAt }, provider: source });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RPC lookup failed.";
    return Response.json({ error: message, provider: source, retryable: true }, { status: 502 });
  }
}
