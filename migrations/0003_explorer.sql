CREATE TABLE IF NOT EXISTS chainguard.address_snapshots (address text PRIMARY KEY, snapshot jsonb NOT NULL, source text NOT NULL, observed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS chainguard.block_snapshots (block_number numeric PRIMARY KEY, snapshot jsonb NOT NULL, source text NOT NULL, observed_at timestamptz NOT NULL DEFAULT now());
