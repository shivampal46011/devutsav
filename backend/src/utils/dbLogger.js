// Batched, fail-safe pipe from the app's logs into the ServerLog capped collection.
//
// Design goals:
//  - NEVER throw into the caller or block a request (logging must not break the app).
//  - NEVER recurse: a failed DB write reports via console only, never through winston.
//  - Cheap: enqueue in memory, flush in batches on a timer / size threshold.
import Transport from 'winston-transport';
import ServerLog from '../models/ServerLog.js';

const queue = [];
const MAX_QUEUE = 5000; // hard cap so a DB outage can't grow memory unbounded
const FLUSH_EVERY_MS = 2000;
const FLUSH_AT = 50;
let warned = false;
let timer = null;

export function recordLog(entry) {
  try {
    if (queue.length >= MAX_QUEUE) queue.shift(); // drop oldest under sustained backpressure
    queue.push({
      ts: entry.ts ? new Date(entry.ts) : new Date(),
      source: entry.source || 'server',
      service: entry.service || 'api',
      level: entry.level || 'info',
      message: typeof entry.message === 'string' ? entry.message.slice(0, 8000) : String(entry.message ?? ''),
      method: entry.method,
      route: entry.route,
      status: entry.status,
      duration_ms: entry.duration_ms,
      request_id: entry.request_id,
      session_id: entry.session_id,
      ip: entry.ip,
      ua: entry.ua ? String(entry.ua).slice(0, 400) : undefined,
      stack: entry.stack ? String(entry.stack).slice(0, 8000) : undefined,
      meta: entry.meta,
    });
    if (queue.length >= FLUSH_AT) flush();
  } catch {
    /* never throw */
  }
}

async function flush() {
  if (!queue.length) return;
  const batch = queue.splice(0, queue.length);
  try {
    await ServerLog.insertMany(batch, { ordered: false });
  } catch (err) {
    // Don't requeue indefinitely; just note it once via console (NOT winston → no recursion).
    if (!warned) {
      warned = true;
      // eslint-disable-next-line no-console
      console.error('[dbLogger] failed to persist logs:', err?.message || err);
    }
  }
}

export function startDbLogger() {
  if (timer) return;
  timer = setInterval(flush, FLUSH_EVERY_MS);
  if (timer.unref) timer.unref();
}

// Winston transport: forwards every log record to the DB queue, tagged with a service name.
export class MongoTransport extends Transport {
  constructor(opts = {}) {
    super(opts);
    this.service = opts.service || 'api';
    this.source = opts.source || 'server';
  }
  log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    try {
      const { level, message, timestamp, stack, ...meta } = info;
      // Strip noisy/duplicate keys from meta.
      delete meta.service; delete meta.splat; delete meta[Symbol.for('level')]; delete meta[Symbol.for('message')];
      const hasMeta = meta && Object.keys(meta).length > 0;
      recordLog({
        ts: timestamp,
        source: this.source,
        service: info.service || this.service,
        level,
        message,
        stack: stack || info.stack,
        meta: hasMeta ? meta : undefined,
      });
    } catch {
      /* never throw */
    }
    callback();
  }
}

// Express middleware: one structured access-log row per finished response.
export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    try {
      // Skip the log-ingest endpoint to avoid feedback loops + noise.
      if (req.originalUrl && req.originalUrl.startsWith('/api/logs/client')) return;
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      recordLog({
        source: 'http',
        service: 'api',
        level,
        message: `${req.method} ${req.originalUrl} → ${res.statusCode}`,
        method: req.method,
        route: req.originalUrl,
        status: res.statusCode,
        duration_ms: Math.round(ms),
        request_id: req.headers['x-request-id'] || undefined,
        ip: (req.headers['x-forwarded-for'] || req.ip || '').toString().split(',')[0].trim() || undefined,
        ua: req.headers['user-agent'],
      });
    } catch {
      /* never throw */
    }
  });
  next();
}

export default { recordLog, startDbLogger, MongoTransport, requestLogger };
