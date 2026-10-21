import { InvestigationDemo } from "@/components/investigation-demo";
import { TransactionLookup } from "@/components/transaction-lookup";

const nodes = [{x:"18%",y:"28%",s:12},{x:"40%",y:"55%",s:18},{x:"70%",y:"25%",s:10},{x:"80%",y:"68%",s:14},{x:"25%",y:"78%",s:8}];
export default function Home() {
  return <main className="min-h-screen bg-[#09080f] text-[#f0eef8]">
    <nav className="border-b border-violet-300/10 px-6 py-5"><div className="mx-auto flex max-w-7xl items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center border border-violet-300/40 bg-violet-300/10 font-mono text-violet-200">CG</span><span className="font-bold tracking-wide">CHAINGUARD</span></div><span className="font-mono text-xs text-violet-300">ANALYTICS / ALPHA</span></div></nav>
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:py-28"><div><p className="font-mono text-xs tracking-[.22em] text-fuchsia-300">ETHEREUM FORENSIC WORKSPACE</p><h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight md:text-7xl">Follow the transaction. Explain the signal.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#9d99ae]">Investigate observed Ethereum activity with verified RPC data, transparent features and explainable anomaly scoring. Unusual does not mean fraudulent.</p><div className="mt-9 flex items-center gap-4"><a href="/api/health" className="bg-violet-300 px-5 py-3 font-mono text-sm font-bold text-[#140d24]">SYSTEM HEALTH</a><span className="font-mono text-xs text-amber-300">● DEVELOPMENT IN PROGRESS</span></div></div>
      <div className="relative min-h-[420px] overflow-hidden border border-violet-300/15 bg-[#0f0d18] shadow-2xl shadow-violet-950/30"><div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:22px_22px]"/>{nodes.map((n,i)=><div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-300 bg-violet-400/30 shadow-[0_0_24px_rgba(216,180,254,.55)]" style={{left:n.x,top:n.y,width:n.s,height:n.s}}/>)}<svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M18 28 L40 55 L70 25 M40 55 L80 68 M40 55 L25 78" fill="none" stroke="#a78bfa" strokeWidth=".3"/></svg><div className="absolute bottom-0 left-0 right-0 border-t border-violet-300/10 bg-[#0b0912]/95 p-4 font-mono text-xs text-[#8f8a9d]"><div className="flex justify-between"><span>NETWORK VIEW / INDEXED DATA ONLY</span><span className="text-emerald-300">RPC lookup on demand</span></div></div></div>
    </section>
    <InvestigationDemo />
    <TransactionLookup />
  </main>;
}
