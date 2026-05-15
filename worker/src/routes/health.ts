import { Hono } from 'hono';
import { toSqlTimestamp, toYmd } from '../utils/date';

export const healthRoute = new Hono();

healthRoute.get('/api/health', (c) => {
  const now = new Date();
  return c.json({
    ok: true,
    service: 'tendergo-worker',
    nowTaipei: toSqlTimestamp(now, 'Asia/Taipei'),
    todayTaipei: toYmd(now, 'Asia/Taipei')
  });
});
