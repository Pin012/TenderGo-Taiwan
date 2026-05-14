import type { Env, CrawlStats, ParsedTender } from '../types';
import { toYmd } from '../utils/date';
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
  const today = toYmd(new Date(), 'Asia/Taipei');

  const allParsed: ParsedTender[] = [];
  let pageIndex = 1;
  let lastUrl = '';

  while (true) {
    const url = buildSearchUrl(env.TENDER_BASE_URL, today, today, pageIndex);
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
