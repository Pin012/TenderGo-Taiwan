DROP INDEX IF EXISTS idx_tenders_unique_daily;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenders_unique_tender_title
ON tenders (tender_id, title);
