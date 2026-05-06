import type { Env } from './types';

export function getWindowDays(env: Env): number {
  const raw = Number.parseInt(env.CRAWL_DAYS_WINDOW ?? '7', 10);
  return Number.isNaN(raw) ? 7 : Math.max(1, raw);
}
