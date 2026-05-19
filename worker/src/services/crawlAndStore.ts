import type { Env, CrawlStats, ParsedTender } from '../types';
import { getRange, toYmd } from '../utils/date';
import { buildSearchUrl } from '../crawler/buildSearchUrl';
import { fetchTenderHtml } from '../crawler/fetchTenderHtml';
import { parseTenderTable } from '../crawler/parseTenderTable';
import { getDb } from '../db/client';
import { insertTenders } from '../db/tenderRepo';

const PAGE_SIZE = 100;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function crawlAndStore(env: Env): Promise<{ stats: CrawlStats; fetchedDate: string; url: string }> {
  const timeZone = env.CRAWL_TIMEZONE || 'Asia/Taipei';
  const daysWindow = Math.max(1, Number.parseInt(env.CRAWL_DAYS_WINDOW || '1', 10) || 1);
  const today = toYmd(new Date(), timeZone);
  const { start, end } = getRange(daysWindow, timeZone);

  const allParsed: ParsedTender[] = [];
  let pageIndex = 1;
  let lastUrl = '';

  while (true) {
    const url = buildSearchUrl(env.TENDER_BASE_URL, start, end, pageIndex);
    lastUrl = url;
    const html = await fetchTenderHtml(url);
    const parsed = await parseTenderTable(html, url);

    if (parsed.length === 0) break;

    allParsed.push(...parsed);

    if (parsed.length < PAGE_SIZE) break;

    pageIndex += 1;
    const delayMs = 200 + Math.floor(Math.random() * 500);
    await wait(delayMs);
  }

  const stats = await insertTenders(getDb(env), allParsed, today);
  return { stats, fetchedDate: today, url: lastUrl };
}
