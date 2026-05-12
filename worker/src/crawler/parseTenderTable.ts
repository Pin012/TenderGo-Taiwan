import { parseHTML } from 'linkedom';
import type { ParsedTender } from '../types';
import { sha256Hex } from '../utils/hash';

function toAmount(text: string | null): number | null {
  if (!text) return null;
  const n = Number(text.replace(/[^\d]/g, ''));
  return Number.isNaN(n) ? null : n;
}

function normalizeHeader(text: string): string {
  return text.replace(/\s+/g, '').toLowerCase();
}

function findHeaderIndex(headers: string[], aliases: string[], fallbackIndex: number): number {
  for (const alias of aliases) {
    const idx = headers.findIndex((h) => h.includes(normalizeHeader(alias)));
    if (idx >= 0) return idx;
  }
  return fallbackIndex;
}

export async function parseTenderTable(html: string, sourceUrl: string): Promise<ParsedTender[]> {
  const { document } = parseHTML(html);
  const rows = [...document.querySelectorAll('table tr')];
  if (rows.length < 2) return [];

  const headerCells = [...rows[0].querySelectorAll('th,td')].map((cell) => normalizeHeader(cell.textContent?.trim() ?? ''));
  const idxTenderId = findHeaderIndex(headerCells, ['標案案號', '案號', '招標案號'], 1);
  const idxTitle = findHeaderIndex(headerCells, ['標案名稱', '案名', '標的名稱'], 2);
  const idxAgency = findHeaderIndex(headerCells, ['機關名稱', '招標機關', '機關'], 3);
  const idxAmount = findHeaderIndex(headerCells, ['預算金額', '採購金額', '金額'], 4);
  const idxTenderType = findHeaderIndex(headerCells, ['招標方式', '採購類別', '標案類型'], 5);
  const idxStartDate = findHeaderIndex(headerCells, ['公告日期', '上網日期', '刊登日期'], 6);
  const idxEndDate = findHeaderIndex(headerCells, ['截止投標', '截止日期', '截止時間'], 7);

  const out: ParsedTender[] = [];
  for (const tr of rows.slice(1)) {
    const tds = [...tr.querySelectorAll('td')].map((td) => td.textContent?.trim() ?? '');
    if (tds.length < 3) continue;
    const joined = tds.join('|');
    const sourceHash = await sha256Hex(joined);

    const tenderId = tds[idxTenderId] || tds[0] || '';
    out.push({
      tenderId,
      title: tds[idxTitle] ?? null,
      agency: tds[idxAgency] ?? null,
      amountText: tds[idxAmount] ?? null,
      amountValue: toAmount(tds[idxAmount] ?? null),
      tenderType: tds[idxTenderType] ?? null,
      startDate: tds[idxStartDate] ?? null,
      endDate: tds[idxEndDate] ?? null,
      sourceUrl,
      sourceHash
    });
  }

  return out.filter((x) => x.tenderId);
}
