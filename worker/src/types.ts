export type Env = {
  DB: D1Database;
  CRAWL_DAYS_WINDOW: string;
  CRAWL_TIMEZONE: string;
  TENDER_BASE_URL: string;
  ADMIN_RUN_TOKEN: string;
};

export type ParsedTender = {
  tenderId: string;
  title: string | null;
  agency: string | null;
  amountText: string | null;
  amountValue: number | null;
  tenderType: string | null;
  startDate: string | null;
  endDate: string | null;
  sourceUrl: string;
  sourceHash: string;
};

export type CrawlStats = {
  inserted: number;
  ignored: number;
  failed: number;
};
