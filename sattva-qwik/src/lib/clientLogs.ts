// Browser-side log capture: reports failed/slow network requests and uncaught JS errors to
// the backend (/api/logs/client), where they land in the same ServerLog store the admin panel
// and the devutsav-logs MCP read. Best-effort, batched, and self-excluding (never logs its own
// ingest calls). Initialise once, site-wide, from the root layout.
import { getApiBase } from './apiBase';

interface ClientEvent {
  ts?: string; level: string; service?: string; message: string;
  method?: string; route?: string; status?: number; duration_ms?: number;
  stack?: string; session_id?: string; meta?: Record<string, unknown>;
}

let inited = false;
let queue: ClientEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const SLOW_MS = 6000;
const endpoint = () => `${getApiBase()}/api/logs/client`;
const isIngest = (url: string) => url.includes('/api/logs/client');

function sessionId(): string | undefined {
  try {
    return localStorage.getItem('du_session_id') || localStorage.getItem('user_session_id') || undefined;
  } catch {
    return undefined;
  }
}

function enqueue(e: ClientEvent) {
  queue.push({ ...e, ts: e.ts || new Date().toISOString(), service: e.service || 'web', session_id: sessionId() });
  if (queue.length >= 20) flush();
  else if (!flushTimer) flushTimer = setTimeout(flush, 4000);
}

function flush() {
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  if (!queue.length) return;
  const events = queue.splice(0, queue.length);
  const body = JSON.stringify({ events });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint(), new Blob([body], { type: 'application/json' }));
    } else {
      fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    /* best-effort */
  }
}

export function initClientLogs() {
  if (inited || typeof window === 'undefined') return;
  inited = true;

  const origFetch = window.fetch.bind(window);
  window.fetch = async (input: any, init?: any) => {
    const start = performance.now();
    const url = typeof input === 'string' ? input : (input?.url ?? String(input));
    const method = (init?.method || (typeof input !== 'string' && input?.method) || 'GET').toUpperCase();
    try {
      const res = await origFetch(input, init);
      const dur = Math.round(performance.now() - start);
      if (!isIngest(url)) {
        if (res.status >= 400) {
          enqueue({ level: res.status >= 500 ? 'error' : 'warn', message: `fetch ${method} ${url} → ${res.status}`, method, route: url, status: res.status, duration_ms: dur });
        } else if (dur >= SLOW_MS) {
          enqueue({ level: 'warn', message: `slow fetch ${method} ${url} (${dur}ms)`, method, route: url, status: res.status, duration_ms: dur, meta: { slow: true } });
        }
      }
      return res;
    } catch (err: any) {
      const dur = Math.round(performance.now() - start);
      if (!isIngest(url)) {
        enqueue({ level: 'error', message: `fetch failed ${method} ${url}: ${err?.message || err}`, method, route: url, duration_ms: dur, stack: err?.stack });
      }
      throw err;
    }
  };

  window.addEventListener('error', (e: ErrorEvent) => {
    enqueue({
      level: 'error', message: `JS error: ${e.message}`, route: location.pathname,
      stack: e.error?.stack, meta: { filename: e.filename, lineno: e.lineno, colno: e.colno },
    });
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const r: any = e.reason;
    enqueue({ level: 'error', message: `Unhandled rejection: ${r?.message || r}`, route: location.pathname, stack: r?.stack });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
