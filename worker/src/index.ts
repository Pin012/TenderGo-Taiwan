import { Hono } from 'hono';
import { healthRoute } from './routes/health';
import { tenderRoute } from './routes/tenders';
import { crawlAndStore } from './services/crawlAndStore';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();
app.route('/', healthRoute);
app.route('/', tenderRoute);



app.get('/api/admin/crawl-status', async (c) => {
  const token = new URL(c.req.url).searchParams.get('token');
  if (token !== c.env.ADMIN_RUN_TOKEN) {
    return c.json({ ok: false, code: 'UNAUTHORIZED', message: 'Invalid token' }, 401);
  }

  const latest = await c.env.DB.prepare(
    `SELECT fetched_date, COUNT(*) AS count
     FROM tenders
     GROUP BY fetched_date
     ORDER BY fetched_date DESC
     LIMIT 1`
  ).first<{ fetched_date: string; count: number }>();

  if (!latest) {
    return c.json({ ok: true, hasData: false, message: 'No crawled tenders in database yet.' });
  }

  const samples = await c.env.DB.prepare(
    `SELECT tender_id, title, agency, amount_value, start_date, end_date
     FROM tenders
     WHERE fetched_date = ?
     ORDER BY id DESC
     LIMIT 3`
  ).bind(latest.fetched_date).all();

  return c.json({
    ok: true,
    hasData: true,
    latestFetchedDate: latest.fetched_date,
    latestCount: Number(latest.count ?? 0),
    sampleRows: samples.results
  });
});

app.get('/api/admin/run-crawl', async (c) => {
  const token = new URL(c.req.url).searchParams.get('token');
  if (token !== c.env.ADMIN_RUN_TOKEN) {
    return c.json({ ok: false, code: 'UNAUTHORIZED', message: 'Invalid token' }, 401);
  }
  const result = await crawlAndStore(c.env);
  return c.json({ ok: true, ...result });
});

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, env: Env): Promise<void> => {
    await crawlAndStore(env);
  }
};
