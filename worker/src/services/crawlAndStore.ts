import type { Env, CrawlStats } from '../types';
import { getWindowDays } from '../config';
import { getRange, toYmd } from '../utils/date';
import { buildSearchUrl } from '../crawler/buildSearchUrl';
import { fetchTenderHtml } from '../crawler/fetchTenderHtml';
import { parseTenderTable } from '../crawler/parseTenderTable';
import { getDb } from '../db/client';
import { insertTenders } from '../db/tenderRepo';

export async function crawlAndStore(env: Env): Promise<{ stats: CrawlStats; fetchedDate: string; url: string }> {
  const days = getWindowDays(env);
  const tz = env.CRAWL_TIMEZONE || 'Asia/Taipei';
  const { start, end } = getRange(days, tz);
  const url = buildSearchUrl(env.TENDER_BASE_URL, start, end);
  const html = await fetchTenderHtml(url);
  const parsed = await parseTenderTable(html, url);
  const fetchedDate = toYmd(new Date(), tz);
  const stats = await insertTenders(getDb(env), parsed, fetchedDate);
  return { stats, fetchedDate, url };
}
