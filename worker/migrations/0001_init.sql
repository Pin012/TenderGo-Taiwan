CREATE TABLE IF NOT EXISTS tenders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tender_id TEXT NOT NULL,
  title TEXT,
  agency TEXT,
  amount_text TEXT,
  amount_value INTEGER,
  tender_type TEXT,
  start_date TEXT,
  end_date TEXT,
  source_url TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  fetched_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenders_unique_daily
ON tenders (tender_id, fetched_date);

CREATE INDEX IF NOT EXISTS idx_tenders_agency ON tenders (agency);
CREATE INDEX IF NOT EXISTS idx_tenders_end_date ON tenders (end_date);
