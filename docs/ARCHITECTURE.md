# Architecture

Next.js route handlers verify the signed demo session before investigation or RPC access. Neon schema `chainguard` stores user notes, cached JSON snapshots, and atomic per-minute rate counters. Cached observations expire after fifteen minutes; all displayed source hostnames and observation timestamps remain visible.

The RPC adapter uses standard Ethereum JSON-RPC calls for a transaction, receipt, and containing block. Hex quantities are parsed with `BigInt`, then converted to decimal strings without floating-point loss. Derived fields are deterministic observations—value, fee, gas, input size, contract interaction, logs, and receipt status—not anomaly or fraud claims.
