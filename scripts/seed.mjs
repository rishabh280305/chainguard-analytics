const baseUrl = process.env.BASE_URL ?? "https://chainguard-analytics.vercel.app";
const auth = await fetch(`${baseUrl}/api/auth/demo`, { method: "POST" });
if (!auth.ok) throw new Error(`Demo authentication failed: HTTP ${auth.status}`);
const cookie = auth.headers.get("set-cookie")?.split(";")[0];
if (!cookie) throw new Error("Demo session cookie was not returned");
const txHash = `0x${"1".repeat(64)}`;
const response = await fetch(`${baseUrl}/api/investigations`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ txHash, note: "Synthetic seed lead; not asserted to be anomalous" }) });
if (!response.ok) throw new Error(`Seed failed: HTTP ${response.status} ${await response.text()}`);
console.log("Verified the labeled synthetic investigation seed through the authenticated API.");
