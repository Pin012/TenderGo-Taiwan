import { parseHTML } from 'linkedom';
import type { ParsedTender } from '../types';
import { sha256Hex } from '../utils/hash';

function toAmount(text: string | null): number | null {
  if (!text) return null;
  const n = Number(text.replace(/[^\d]/g, ''));
  return Number.isNaN(n) ? null : n;
}

export async function parseTenderTable(html: string, sourceUrl: string): Promise<ParsedTender[]> {
  const { document } = parseHTML(html);
  const rows = [...document.querySelectorAll('table tr')];
  if (rows.length < 2) return [];

  const out: ParsedTender[] = [];
  for (const tr of rows.slice(1)) {
    const tds = [...tr.querySelectorAll('td')].map((td) => td.textContent?.trim() ?? '');
    if (tds.length < 3) continue;
    const joined = tds.join('|');
    const sourceHash = await sha256Hex(joined);

    out.push({
      tenderId: tds[1] || tds[0],
      title: tds[2] ?? null,
      agency: tds[3] ?? null,
      amountText: tds[4] ?? null,
      amountValue: toAmount(tds[4] ?? null),
      tenderType: tds[5] ?? null,
      startDate: tds[6] ?? null,
      endDate: tds[7] ?? null,
      sourceUrl,
      sourceHash
    });
  }
  return out.filter((x) => x.tenderId);
}
