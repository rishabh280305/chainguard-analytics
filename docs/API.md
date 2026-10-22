# API

| Method | Route | Authentication | Behavior |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Service health |
| GET/POST/DELETE | `/api/auth/demo` | Public/cookie | Manage demo session |
| GET/POST/PATCH | `/api/investigations` | Demo session | Filter, upsert, annotate, or review saved leads; `format=csv` exports |
| GET | `/api/ethereum/transaction?hash=…` | Demo session | Fetch/cache a validated mainnet transaction |
| GET | `/api/ethereum/transaction?sample=latest` | Demo session | Select and inspect a transaction in the latest block |
| GET | `/api/ethereum/address?address=…` | Demo session | Current balance/nonce/code plus indexed-only edges |
| GET | `/api/ethereum/block?number=…` | Demo session | Genuine block summary and first 20 transaction hashes |
| POST | `/api/ethereum/ingest` | Demo session | Bounded first-N transaction ingestion from one block |
| GET | `/api/ethereum/graph?address=…` | Demo session | Nodes and edges from persisted transaction snapshots only |
| POST | `/api/ethereum/analyze` | Demo session | Explainable configurable rules for an indexed transaction |
| GET | `/api/ethereum/export` | Demo session | CSV of observed features for reproducible model training |

RPC errors return HTTP 502 with `retryable: true`; exhausted rate windows return HTTP 429 and `Retry-After: 60`. Responses state the provider, cache status, timestamp, and analysis limitation.

Transfer logs expose raw integer amounts only. Rule analysis returns `mode: deterministic-rules`; it never returns a model probability. Address graphs state `completeChainHistory: false` because they are bounded to this database.
