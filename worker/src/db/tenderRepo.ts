import type { CrawlStats, ParsedTender } from '../types';
import { toSqlTimestamp } from '../utils/date';

export async function insertTenders(
  db: D1Database,
  tenders: ParsedTender[],
  fetchedDate: string
): Promise<CrawlStats> {
  const stats: CrawlStats = { inserted: 0, ignored: 0, failed: 0 };
  const createdAt = toSqlTimestamp(new Date(), 'Asia/Taipei');
  const sql = `INSERT OR IGNORE INTO tenders
    (tender_id,title,agency,serial_no,bidding_method,amount_text,amount_value,tender_type,start_date,end_date,award_status,award_amount_text,award_amount_value,winning_vendor,source_url,source_hash,fetched_date,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  for (const t of tenders) {
    try {
      const result = await db.prepare(sql).bind(
        t.tenderId, t.title, t.agency, t.serialNo, t.biddingMethod, t.amountText, t.amountValue,
        t.tenderType, t.startDate, t.endDate, t.awardStatus, t.awardAmountText, t.awardAmountValue,
        t.winningVendor, t.sourceUrl, t.sourceHash, fetchedDate, createdAt
      ).run();
      if ((result.meta.changes ?? 0) > 0) stats.inserted += 1;
      else stats.ignored += 1;
    } catch {
      stats.failed += 1;
    }
  }
  return stats;
}
