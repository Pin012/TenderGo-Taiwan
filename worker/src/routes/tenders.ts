import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types';

const querySchema = z.object({
  date: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  agency: z.string().optional(),
  keyword: z.string().optional()
});

export const tenderRoute = new Hono<{ Bindings: Env }>();

tenderRoute.get('/api/tenders', async (c) => {
  const searchParams = new URL(c.req.url).searchParams;
  const rawQuery: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    rawQuery[key] = value;
  });
  const q = querySchema.parse(rawQuery);
  const where: string[] = [];
  const binds: unknown[] = [];
  if (q.date) { where.push('fetched_date = ?'); binds.push(q.date); }
  if (q.agency) { where.push('agency LIKE ?'); binds.push(`%${q.agency}%`); }
  if (q.keyword) { where.push('(title LIKE ? OR tender_id LIKE ?)'); binds.push(`%${q.keyword}%`, `%${q.keyword}%`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (q.page - 1) * q.pageSize;
  const sql = `SELECT * FROM tenders ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`;
  const rows = await c.env.DB.prepare(sql).bind(...binds, q.pageSize, offset).all();
  return c.json({ items: rows.results, pagination: { page: q.page, pageSize: q.pageSize } });
});

tenderRoute.get('/api/tenders/:tenderId', async (c) => {
  const tenderId = c.req.param('tenderId');
  const date = new URL(c.req.url).searchParams.get('date');
  const sql = date
    ? 'SELECT * FROM tenders WHERE tender_id = ? AND fetched_date = ? LIMIT 1'
    : 'SELECT * FROM tenders WHERE tender_id = ? ORDER BY id DESC LIMIT 1';
  const stmt = date ? c.env.DB.prepare(sql).bind(tenderId, date) : c.env.DB.prepare(sql).bind(tenderId);
  const row = await stmt.first();
  if (!row) return c.json({ ok: false, code: 'NOT_FOUND', message: 'Tender not found' }, 404);
  return c.json(row);
});
