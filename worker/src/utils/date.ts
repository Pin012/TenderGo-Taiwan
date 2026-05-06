export function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function ymdToPcc(ymd: string): string {
  return ymd.replace(/-/g, '/');
}

export function getRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { start: toYmd(start), end: toYmd(end) };
}
