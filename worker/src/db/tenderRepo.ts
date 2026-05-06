import type { CrawlStats, ParsedTender } from '../types';

export async function insertTenders(
  db: D1Database,
  tenders: ParsedTender[],
  fetchedDate: string
): Promise<CrawlStats> {
  const stats: CrawlStats = { inserted: 0, ignored: 0, failed: 0 };
  const sql = `INSERT OR IGNORE INTO tenders
    (tender_id,title,agency,amount_text,amount_value,tender_type,start_date,end_date,source_url,source_hash,fetched_date)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

  for (const t of tenders) {
    try {
      const result = await db.prepare(sql).bind(
        t.tenderId, t.title, t.agency, t.amountText, t.amountValue,
        t.tenderType, t.startDate, t.endDate, t.sourceUrl, t.sourceHash, fetchedDate
      ).run();
      if ((result.meta.changes ?? 0) > 0) stats.inserted += 1;
      else stats.ignored += 1;
    } catch {
      stats.failed += 1;
    }
  }
  return stats;
}
