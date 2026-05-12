function formatYmdInTz(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const y = parts.find((x) => x.type === 'year')?.value ?? '1970';
  const m = parts.find((x) => x.type === 'month')?.value ?? '01';
  const d = parts.find((x) => x.type === 'day')?.value ?? '01';
  return `${y}-${m}-${d}`;
}

export function toYmd(date: Date, timeZone = 'UTC'): string {
  return formatYmdInTz(date, timeZone);
}

export function ymdToPcc(ymd: string): string {
  return ymd.replace(/-/g, '/');
}

export function getRange(days: number, timeZone = 'UTC'): { start: string; end: string } {
  const now = new Date();
  const end = toYmd(now, timeZone);

  const startSeed = new Date(now);
  startSeed.setUTCDate(startSeed.getUTCDate() - (days - 1));
  const start = toYmd(startSeed, timeZone);

  return { start, end };
}
