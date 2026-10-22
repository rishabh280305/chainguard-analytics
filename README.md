# ChainGuard Ethereum Analytics

ChainGuard is an explainable Ethereum investigation workstation. It persists investigation leads, fetches genuine mainnet transaction/receipt/block data through a public JSON-RPC provider, derives transparent features, and caches point-in-time observations.

## Verified capabilities

- Signed demo access and persistent analyst notes
- Strict transaction-hash validation and external Etherscan links
- PublicNode mainnet JSON-RPC integration with timeout/error handling
- Fifteen-request-per-minute database-backed rate window and fifteen-minute Postgres cache
- Exact BigInt parsing for values, gas, fees, input bytes, logs, and execution status
- Genuine block and address state lookup with persisted, timestamped snapshots
- ERC-20-like Transfer topic decoding with raw amounts and no invented symbol/decimal metadata
- Manual bounded block ingestion, idempotent transaction snapshots, and indexed-only wallet relationship graphs
- Configurable explainable rule scoring with observable reasons and an explicit non-fraud limitation
- Investigation filtering, note/status updates, case CSV, and real observed-feature CSV exports
- Checksum-pinned cloud Isolation Forest training workflow that requires at least 32 genuine indexed rows and publishes its real artifacts
- Unit tests, cloud CI, and production Playwright RPC flow

A trained anomaly model is not bundled or claimed until the cloud workflow receives a checksum-pinned real feature export. The deployed application therefore reports rule scores only. ChainGuard never equates unusual activity with fraud.

Commands: `npm run dev`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm run seed`. See [architecture](docs/ARCHITECTURE.md), [API](docs/API.md), and [deployment](docs/DEPLOYMENT.md).
