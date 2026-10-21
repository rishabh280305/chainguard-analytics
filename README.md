# ChainGuard Ethereum Analytics

ChainGuard is an explainable Ethereum investigation workstation. It persists investigation leads, fetches genuine mainnet transaction/receipt/block data through a public JSON-RPC provider, derives transparent features, and caches point-in-time observations.

## Verified capabilities

- Signed demo access and persistent analyst notes
- Strict transaction-hash validation and external Etherscan links
- PublicNode mainnet JSON-RPC integration with timeout/error handling
- Fifteen-request-per-minute database-backed rate window and fifteen-minute Postgres cache
- Exact BigInt parsing for values, gas, fees, input bytes, logs, and execution status
- Unit tests, cloud CI, and production Playwright RPC flow

Wallet graphs, token decoding, configurable rules, and trained anomaly models remain future scope. ChainGuard never equates unusual activity with fraud.

Commands: `npm run dev`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm run seed`. See [architecture](docs/ARCHITECTURE.md), [API](docs/API.md), and [deployment](docs/DEPLOYMENT.md).
