CREATE SCHEMA IF NOT EXISTS chainguard;

CREATE TABLE IF NOT EXISTS chainguard.investigations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL,
  tx_hash text NOT NULL,
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'reviewed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tx_hash)
);
