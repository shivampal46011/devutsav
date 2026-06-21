#!/usr/bin/env node
// devutsav-logs MCP server.
//
// Exposes DevUtsav's centralized logs (the `server_logs` capped collection) so an MCP client
// (e.g. Claude) can read + slice them by service/level/time/route to find and fix problems.
// Reads MongoDB directly — set MONGO_URI (and optionally MONGO_DB, default "devutsav").
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || process.env.DEVUTSAV_MONGO_URI;
const DB_NAME = process.env.MONGO_DB || 'devutsav';
const COLLECTION = 'server_logs';

if (!MONGO_URI) {
  // eslint-disable-next-line no-console
  console.error('[devutsav-logs] MONGO_URI environment variable is required.');
  process.exit(1);
}

let _coll = null;
async function coll() {
  if (_coll) return _coll;
  const client = new MongoClient(MONGO_URI, { maxPoolSize: 3 });
  await client.connect();
  _coll = client.db(DB_NAME).collection(COLLECTION);
  return _coll;
}

// Parse a "since"/"until" value: ISO date, epoch ms, or relative like "30m", "2h", "1d", "45s".
function parseTime(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return new Date(v);
  const rel = /^(\d+)\s*(s|m|h|d)$/.exec(String(v).trim());
  if (rel) {
    const n = Number(rel[1]);
    const mult = { s: 1e3, m: 60e3, h: 3600e3, d: 86400e3 }[rel[2]];
    return new Date(Date.now() - n * mult);
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function buildFilter(a = {}) {
  const filter = {};
  if (a.service) filter.service = a.service;
  if (a.source) filter.source = a.source;
  if (a.level) filter.level = a.level === 'warn' ? { $in: ['warn', 'error'] } : a.level;
  if (a.status != null) filter.status = Number(a.status);
  if (a.route) filter.route = new RegExp(String(a.route).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const ts = {};
  const since = parseTime(a.since);
  const until = parseTime(a.until);
  if (since) ts.$gte = since;
  if (until) ts.$lte = until;
  if (Object.keys(ts).length) filter.ts = ts;
  if (a.search) {
    const rx = new RegExp(String(a.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ message: rx }, { route: rx }, { stack: rx }];
  }
  return filter;
}

// Trim a log doc to a compact, model-friendly shape.
function compact(r) {
  const o = {
    ts: r.ts instanceof Date ? r.ts.toISOString() : r.ts,
    level: r.level, service: r.service, source: r.source,
    message: r.message,
  };
  if (r.method || r.route) o.req = `${r.method || ''} ${r.route || ''}`.trim();
  if (r.status != null) o.status = r.status;
  if (r.duration_ms != null) o.ms = r.duration_ms;
  if (r.session_id) o.session = r.session_id;
  if (r.ip) o.ip = r.ip;
  if (r.stack) o.stack = r.stack;
  if (r.meta && Object.keys(r.meta).length) o.meta = r.meta;
  return o;
}

const text = (obj) => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] });

const server = new McpServer({ name: 'devutsav-logs', version: '1.0.0' });

server.tool(
  'query_logs',
  'Query DevUtsav logs (server app logs, HTTP access logs, browser/client logs, agent logs). ' +
    'Filter by service, source (server|http|client|agent), level, HTTP status, route, free-text search, and time window. ' +
    'Returns matching log entries, newest first.',
  {
    service: z.string().optional().describe('e.g. api, devpunya, llm, web, writer, healer, audit'),
    source: z.enum(['server', 'http', 'client', 'agent']).optional(),
    level: z.enum(['debug', 'info', 'warn', 'error']).optional().describe('"warn" includes errors too'),
    status: z.number().int().optional().describe('exact HTTP status code, e.g. 500'),
    route: z.string().optional().describe('substring/regex match on the route/url'),
    search: z.string().optional().describe('free-text over message, route and stack'),
    since: z.string().optional().describe('ISO date or relative like "30m", "2h", "1d"'),
    until: z.string().optional().describe('ISO date or relative'),
    limit: z.number().int().min(1).max(500).optional().describe('default 50'),
  },
  async (a) => {
    const c = await coll();
    const rows = await c.find(buildFilter(a)).sort({ ts: -1 }).limit(a.limit || 50).toArray();
    return text({ count: rows.length, logs: rows.map(compact) });
  }
);

server.tool(
  'recent_errors',
  'Get the most recent error-level logs and HTTP 5xx responses across all services — the fast path to "what is broken right now".',
  {
    minutes: z.number().int().min(1).optional().describe('look-back window in minutes, default 60'),
    limit: z.number().int().min(1).max(500).optional().describe('default 50'),
  },
  async (a) => {
    const c = await coll();
    const since = new Date(Date.now() - (a.minutes || 60) * 60000);
    const rows = await c
      .find({ ts: { $gte: since }, $or: [{ level: 'error' }, { status: { $gte: 500 } }] })
      .sort({ ts: -1 })
      .limit(a.limit || 50)
      .toArray();
    return text({ since: since.toISOString(), count: rows.length, errors: rows.map(compact) });
  }
);

server.tool(
  'log_stats',
  'Aggregate log counts by level and by service over a time window — a quick health overview.',
  { minutes: z.number().int().min(1).optional().describe('window in minutes, default 1440 (24h)') },
  async (a) => {
    const c = await coll();
    const since = new Date(Date.now() - (a.minutes || 1440) * 60000);
    const [byLevel, byService, total] = await Promise.all([
      c.aggregate([{ $match: { ts: { $gte: since } } }, { $group: { _id: '$level', n: { $sum: 1 } } }]).toArray(),
      c.aggregate([{ $match: { ts: { $gte: since } } }, { $group: { _id: '$service', n: { $sum: 1 } } }, { $sort: { n: -1 } }]).toArray(),
      c.countDocuments({ ts: { $gte: since } }),
    ]);
    return text({
      since: since.toISOString(),
      total,
      by_level: Object.fromEntries(byLevel.map((r) => [r._id || 'unknown', r.n])),
      by_service: byService.map((r) => ({ service: r._id || 'unknown', count: r.n })),
    });
  }
);

server.tool(
  'log_services',
  'List the distinct service and source names present in the logs (useful before filtering).',
  {},
  async () => {
    const c = await coll();
    const [services, sources] = await Promise.all([c.distinct('service'), c.distinct('source')]);
    return text({ services: services.filter(Boolean).sort(), sources: sources.filter(Boolean).sort() });
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
// eslint-disable-next-line no-console
console.error('[devutsav-logs] MCP server ready (stdio).');
