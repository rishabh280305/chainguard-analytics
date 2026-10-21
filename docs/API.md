# API

| Method | Route | Authentication | Behavior |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Service health |
| GET/POST/DELETE | `/api/auth/demo` | Public/cookie | Manage demo session |
| GET/POST | `/api/investigations` | Demo session | List or upsert saved leads |
| GET | `/api/ethereum/transaction?hash=…` | Demo session | Fetch/cache a validated mainnet transaction |
| GET | `/api/ethereum/transaction?sample=latest` | Demo session | Select and inspect a transaction in the latest block |

RPC errors return HTTP 502 with `retryable: true`; exhausted rate windows return HTTP 429 and `Retry-After: 60`. Responses state the provider, cache status, timestamp, and analysis limitation.
