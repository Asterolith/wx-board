CREATE TABLE measurements (
  id          BIGSERIAL PRIMARY KEY,
  recorded_at TIMESTAMPTZ NOT NULL,
  temperature NUMERIC(5,2),
  pressure    NUMERIC(7,2),
  humidity    NUMERIC(5,2),
  aqi         SMALLINT,
  uv          NUMERIC(4,2),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON measurements (recorded_at DESC);

ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read measurements"
  ON measurements FOR SELECT USING (true);

CREATE POLICY "No direct client writes"
  ON measurements FOR INSERT WITH CHECK (false);