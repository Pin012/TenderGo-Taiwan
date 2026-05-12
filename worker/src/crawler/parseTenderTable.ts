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

function splitTenderIdAndTitle(cellText: string): { tenderId: string; title: string | null } {
  const lines = cellText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (lines.length >= 2) {
    return {
      tenderId: lines[0],
      title: lines.slice(1).join(' ')
    };
  }

  return {
    tenderId: cellText.trim(),
    title: null
  };
}

function findHeaderRowIndex(rows: Array<{ querySelectorAll: (selector: string) => any[] }>): number {
  for (let i = 0; i < rows.length; i += 1) {
    const headers = [...rows[i].querySelectorAll('th,td')].map((cell) => normalizeHeader(cell.textContent?.trim() ?? ''));
    if (!headers.length) continue;
    const looksLikeHeader = headers.some((h) => h.includes('機關名稱')) && headers.some((h) => h.includes('標案案號'));
    if (looksLikeHeader) return i;
  }
  return 0;
}

export async function parseTenderTable(html: string, sourceUrl: string): Promise<ParsedTender[]> {
  const { document } = parseHTML(html);
  const rows = [...document.querySelectorAll('table tr')];
  if (rows.length < 2) return [];

  const headerRowIndex = findHeaderRowIndex(rows);
  const headerCells = [...rows[headerRowIndex].querySelectorAll('th,td')].map((cell) => normalizeHeader(cell.textContent?.trim() ?? ''));
  const idxTenderId = findHeaderIndex(headerCells, ['標案案號', '案號', '招標案號'], 1);
  const idxTitle = findHeaderIndex(headerCells, ['標案名稱', '案名', '標的名稱'], 2);
  const idxSerialNo = findHeaderIndex(headerCells, ['項次'], 0);
  const idxAgency = findHeaderIndex(headerCells, ['機關名稱', '招標機關', '機關'], 1);
  const idxAmount = findHeaderIndex(headerCells, ['預算金額', '採購金額', '金額'], 4);
  const idxBiddingMethod = findHeaderIndex(headerCells, ['招標方式'], 5);
  const idxTenderType = findHeaderIndex(headerCells, ['採購性質', '採購類別', '標案類型'], 6);
  const idxStartDate = findHeaderIndex(headerCells, ['公告日期', '上網日期', '刊登日期'], 6);
  const idxEndDate = findHeaderIndex(headerCells, ['截止投標', '截止日期', '截止時間'], 7);
  const idxAwardStatus = findHeaderIndex(headerCells, ['決標狀態'], -1);
  const idxAwardAmount = findHeaderIndex(headerCells, ['決標金額'], -1);
  const idxWinningVendor = findHeaderIndex(headerCells, ['得標廠商'], -1);

  const out: ParsedTender[] = [];
  for (const tr of rows.slice(headerRowIndex + 1)) {
    const tds = [...tr.querySelectorAll('td')].map((td) => td.textContent?.trim() ?? '');
    if (tds.length < 3) continue;
    const joined = tds.join('|');
    const sourceHash = await sha256Hex(joined);

    const tenderCell = tds[idxTenderId] ?? '';
    const parsedTenderCell = splitTenderIdAndTitle(tenderCell);
    const tenderId = parsedTenderCell.tenderId || tds[0] || '';
    const title = (idxTitle === idxTenderId ? parsedTenderCell.title : (tds[idxTitle] ?? null)) ?? null;

    out.push({
      tenderId,
      title,
      serialNo: tds[idxSerialNo] ?? null,
      agency: tds[idxAgency] ?? null,
      biddingMethod: tds[idxBiddingMethod] ?? null,
      amountText: tds[idxAmount] ?? null,
      amountValue: toAmount(tds[idxAmount] ?? null),
      tenderType: tds[idxTenderType] ?? null,
      startDate: tds[idxStartDate] ?? null,
      endDate: tds[idxEndDate] ?? null,
      awardStatus: idxAwardStatus >= 0 ? (tds[idxAwardStatus] ?? null) : null,
      awardAmountText: idxAwardAmount >= 0 ? (tds[idxAwardAmount] ?? null) : null,
      awardAmountValue: idxAwardAmount >= 0 ? toAmount(tds[idxAwardAmount] ?? null) : null,
      winningVendor: idxWinningVendor >= 0 ? (tds[idxWinningVendor] ?? null) : null,
      sourceUrl,
      sourceHash
    });
  }

  return out.filter((x) => x.tenderId);
}
