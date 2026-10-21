"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Investigation = { id: string; tx_hash: string; note: string; status: string; created_at: string };

export function InvestigationDemo() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [items, setItems] = useState<Investigation[]>([]);
  const [txHash, setTxHash] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/investigations", { cache: "no-store" });
    if (response.status === 401) return setAuthenticated(false);
    if (!response.ok) throw new Error("Could not load investigations.");
    const data = await response.json(); setItems(data.items); setAuthenticated(true);
  }, []);
  useEffect(() => {
    const task = window.setTimeout(() => { void load().catch(() => { setAuthenticated(false); setMessage("The forensic workspace is temporarily unavailable."); }); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  async function enterWorkspace() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/auth/demo", { method: "POST" });
    if (response.ok) await load(); else setMessage("Demo sign-in is unavailable.");
    setBusy(false);
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const response = await fetch("/api/investigations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ txHash, note }) });
    const data = await response.json();
    if (response.ok) { setTxHash(""); setNote(""); setMessage("Investigation reference saved. Inspect it with the live RPC tool below."); await load(); }
    else setMessage(data.error ?? "Could not save the investigation.");
    setBusy(false);
  }

  return <section className="mx-auto max-w-7xl px-6 pb-24" aria-labelledby="investigation-title"><div className="border border-violet-300/15 bg-[#0f0d18] p-6 shadow-2xl shadow-violet-950/20 md:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-violet-300/10 pb-5"><div><p className="font-mono text-xs tracking-[.22em] text-fuchsia-300">PERSISTENT CASE DESK</p><h2 id="investigation-title" className="mt-2 text-3xl font-semibold">Save an investigation lead</h2></div><span className="font-mono text-xs text-emerald-300">LEAD STORAGE: ONLINE</span></div>
    {authenticated===null ? <p className="py-10 text-[#9d99ae]">Initializing case desk…</p> : !authenticated ? <div className="py-10"><p className="max-w-xl leading-7 text-[#9d99ae]">Open the isolated demo workspace to persist Ethereum transaction references. This stage stores user-entered leads only—no chain facts, labels, or risk conclusions are inferred.</p><button onClick={enterWorkspace} disabled={busy} className="mt-5 bg-violet-300 px-5 py-3 font-mono text-sm font-bold text-[#140d24] disabled:opacity-50">{busy ? "OPENING…" : "ENTER CASE DESK"}</button></div> : <div className="grid gap-8 pt-6 lg:grid-cols-[.9fr_1.1fr]">
      <form onSubmit={submit} className="space-y-4"><label className="block font-mono text-xs text-[#9d99ae]">TRANSACTION HASH<input required pattern="0x[a-fA-F0-9]{64}" value={txHash} onChange={e=>setTxHash(e.target.value)} placeholder="0x + 64 hexadecimal characters" className="mt-2 w-full border border-violet-300/20 bg-[#09080f] px-4 py-3 font-mono text-sm text-white outline-none focus:border-violet-300" /></label><label className="block font-mono text-xs text-[#9d99ae]">ANALYST NOTE<textarea value={note} maxLength={500} onChange={e=>setNote(e.target.value)} placeholder="Why is this lead worth revisiting?" className="mt-2 min-h-24 w-full resize-y border border-violet-300/20 bg-[#09080f] px-4 py-3 text-sm text-white outline-none focus:border-violet-300" /></label><button disabled={busy} className="bg-violet-300 px-5 py-3 font-mono text-sm font-bold text-[#140d24] disabled:opacity-50">{busy ? "SAVING…" : "SAVE LEAD"}</button>{message&&<p role="status" className="text-sm text-amber-200">{message}</p>}</form>
      <div><p className="mb-3 font-mono text-xs text-[#8f8a9d]">SAVED LEADS</p>{items.length===0 ? <p className="border border-dashed border-violet-300/20 p-5 text-[#8f8a9d]">No investigation leads saved.</p> : <div className="space-y-2">{items.map(item=><article key={item.id} className="border border-violet-300/10 bg-[#09080f] p-4"><div className="flex items-center justify-between gap-3"><p className="min-w-0 truncate font-mono text-sm text-violet-200" title={item.tx_hash}>{item.tx_hash}</p><span className="font-mono text-[10px] uppercase text-emerald-300">{item.status}</span></div><p className="mt-2 text-sm text-[#9d99ae]">{item.note||"No analyst note"}</p><p className="mt-2 font-mono text-[10px] text-[#635f70]">SAVED {new Date(item.created_at).toLocaleString()}</p></article>)}</div>}</div>
    </div>}
    {!authenticated&&message&&<p role="status" className="pb-5 text-sm text-amber-200">{message}</p>}
  </div></section>;
}
