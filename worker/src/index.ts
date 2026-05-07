import { Hono } from 'hono';
import { healthRoute } from './routes/health';
import { tenderRoute } from './routes/tenders';
import { crawlAndStore } from './services/crawlAndStore';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();
app.route('/', healthRoute);
app.route('/', tenderRoute);

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
