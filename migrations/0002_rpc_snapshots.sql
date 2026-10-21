CREATE TABLE IF NOT EXISTS chainguard.transaction_snapshots (
  tx_hash text PRIMARY KEY,
  snapshot jsonb NOT NULL,
  source text NOT NULL,
  observed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chainguard.rpc_rate_windows (
  user_id text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL,
  PRIMARY KEY (user_id, window_start)
);
