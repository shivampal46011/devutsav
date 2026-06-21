// Log ingest + query API.
//
//   publicRouter  (mounted /api/logs)        — POST /client : browser network/JS-error capture
//   adminRouter   (mounted /api/admin/logs)  — token-gated read: list, services, stats
import express from 'express';
import ServerLog from '../models/ServerLog.js';
import { recordLog } from '../utils/dbLogger.js';

// ---- public ingest --------------------------------------------------------

export const publicRouter = express.Router();

const LEVELS = new Set(['debug', 'info', 'warn', 'error']);

// The website posts batches of client-side events here (failed/slow fetches, JS errors).
// Public + best-effort; capped per request so it can't be abused to flood the store.
publicRouter.post('/client', (req, res) => {
  try {
    const body = req.body || {};
    const events = Array.isArray(body.events) ? body.events.slice(0, 50) : [];
    const ip = (req.headers['x-forwarded-for'] || req.ip || '').toString().split(',')[0].trim() || undefined;
    const ua = req.headers['user-agent'];
    for (const e of events) {
      recordLog({
        ts: e.ts,
        source: 'client',
        service: e.service || 'web',
        level: LEVELS.has(e.level) ? e.level : 'error',
        message: String(e.message || '').slice(0, 2000),
        method: e.method,
        route: e.route || e.url,
        status: typeof e.status === 'number' ? e.status : undefined,
        duration_ms: typeof e.duration_ms === 'number' ? e.duration_ms : undefined,
        session_id: e.session_id,
        ip,
        ua,
        stack: e.stack,
        meta: e.meta && typeof e.meta === 'object' ? e.meta : undefined,
      });
    }
    res.json({ ok: true, accepted: events.length });
  } catch (err) {
    res.status(200).json({ ok: false }); // never make the client retry-storm on our error
  }
});

// ---- admin read -----------------------------------------------------------

export const adminRouter = express.Router();

function requireAdminToken(req, res, next) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    if (process.env.NODE_ENV === 'production') return res.status(503).json({ error: 'ADMIN_API_TOKEN not configured' });
    return next();
  }
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : (req.query.token || '');
  if (token !== expected) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
adminRouter.use(requireAdminToken);

function buildQuery(q) {
  const filter = {};
  if (q.source) filter.source = q.source;
  if (q.service) filter.service = q.service;
  if (q.level) {
    // level=warn means warn+error; level=error means error only. Otherwise exact.
    if (q.level === 'warn') filter.level = { $in: ['warn', 'error'] };
    else filter.level = q.level;
  }
  if (q.status) filter.status = Number(q.status);
  if (q.since) filter.ts = { $gte: new Date(q.since) };
  if (q.until) filter.ts = { ...(filter.ts || {}), $lte: new Date(q.until) };
  if (q.q) {
    const rx = new RegExp(String(q.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ message: rx }, { route: rx }, { stack: rx }];
  }
  return filter;
}

// GET /api/admin/logs  — newest first, filtered
adminRouter.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const logs = await ServerLog.find(buildQuery(req.query)).sort({ ts: -1 }).limit(limit).lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/logs/services — distinct service + source names (for filter dropdowns)
adminRouter.get('/services', async (_req, res) => {
  try {
    const [services, sources] = await Promise.all([
      ServerLog.distinct('service'),
      ServerLog.distinct('source'),
    ]);
    res.json({ services: services.filter(Boolean).sort(), sources: sources.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/logs/stats — counts by level + service over a window (default 24h)
adminRouter.get('/stats', async (req, res) => {
  try {
    const sinceMs = Number(req.query.minutes) ? Number(req.query.minutes) * 60000 : 24 * 3600 * 1000;
    const since = new Date(Date.now() - sinceMs);
    const [byLevel, byService, total] = await Promise.all([
      ServerLog.aggregate([{ $match: { ts: { $gte: since } } }, { $group: { _id: '$level', n: { $sum: 1 } } }]),
      ServerLog.aggregate([{ $match: { ts: { $gte: since } } }, { $group: { _id: '$service', n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
      ServerLog.countDocuments({ ts: { $gte: since } }),
    ]);
    res.json({
      since: since.toISOString(),
      total,
      by_level: Object.fromEntries(byLevel.map((r) => [r._id || 'unknown', r.n])),
      by_service: byService.map((r) => ({ service: r._id || 'unknown', count: r.n })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default { publicRouter, adminRouter };
