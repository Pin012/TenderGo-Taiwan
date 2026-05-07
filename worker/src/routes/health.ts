import { Hono } from 'hono';

export const healthRoute = new Hono();

healthRoute.get('/api/health', (c) => c.json({ ok: true, service: 'tendergo-worker', now: new Date().toISOString() }));
