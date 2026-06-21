import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { TOKEN_KEY, fmtDate } from '../shared';

interface LogRow {
  _id: string; ts: string; source: string; service: string; level: string; message: string;
  method?: string; route?: string; status?: number; duration_ms?: number;
  session_id?: string; ip?: string; stack?: string; meta?: any;
}
interface Stats {
  since: string; total: number;
  by_level: Record<string, number>;
  by_service: { service: string; count: number }[];
}

const levelColor = (l: string) =>
  l === 'error' ? 'term-red' : l === 'warn' ? 'term-amber' : l === 'debug' ? 'term-dim' : 'term-green';
const statusColor = (s?: number) =>
  s == null ? '' : s >= 500 ? 'term-red' : s >= 400 ? 'term-amber' : 'term-green';

export default component$(() => {
  const store = useStore<{
    logs: LogRow[]; stats: Stats | null; services: string[]; sources: string[];
    err: string; lastSync: string;
  }>({ logs: [], stats: null, services: [], sources: [], err: '', lastSync: '' });

  const f = useStore({ service: '', source: '', level: '', q: '', live: true });
  const expanded = useSignal<string>('');
  const token = useSignal('');

  const fetchLogs = $(async () => {
    if (!token.value) return;
    const h = { Authorization: `Bearer ${token.value}` };
    const base = `${getApiBase()}/api/admin/logs`;
    const params = new URLSearchParams({ limit: '200' });
    if (f.service) params.set('service', f.service);
    if (f.source) params.set('source', f.source);
    if (f.level) params.set('level', f.level);
    if (f.q) params.set('q', f.q);
    try {
      const [l, s] = await Promise.all([
        fetch(`${base}?${params.toString()}`, { headers: h }),
        fetch(`${base}/stats`, { headers: h }),
      ]);
      if (l.status === 401) { store.err = 'Unauthorized — re-authenticate via the top bar.'; return; }
      store.logs = await l.json();
      store.stats = await s.json();
      store.err = '';
      store.lastSync = new Date().toLocaleTimeString('en-GB', { hour12: false });
    } catch (e: any) {
      store.err = String(e?.message || e);
    }
  });

  const loadServices = $(async () => {
    if (!token.value) return;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/logs/services`, { headers: { Authorization: `Bearer ${token.value}` } });
      const d = await res.json();
      store.services = d.services || [];
      store.sources = d.sources || [];
    } catch { /* ignore */ }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    try { token.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    loadServices();
    fetchLogs();
    const id = setInterval(() => { if (f.live) { try { token.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {} fetchLogs(); } }, 5000);
    cleanup(() => clearInterval(id));
  });

  const st = store.stats;

  return (
    <div class="p-3 space-y-4">
      {/* Header + stats */}
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="term-amber font-bold tracking-widest">LIVE LOGS</div>
        <div class="flex items-center gap-4 flex-wrap">
          {st && (
            <>
              <span class="term-dim">24h <span class="text-[#e6e6e6]">{st.total}</span></span>
              <span class="term-dim">err <span class="term-red">{st.by_level?.error || 0}</span></span>
              <span class="term-dim">warn <span class="term-amber">{st.by_level?.warn || 0}</span></span>
              <span class="term-dim">info <span class="term-green">{st.by_level?.info || 0}</span></span>
            </>
          )}
          <span class="term-dim">sync {store.lastSync || '—'}</span>
        </div>
      </div>

      {/* Filters */}
      <div class="term-panel p-2 flex flex-wrap gap-2 items-center">
        <select value={f.service} onChange$={(e) => { f.service = (e.target as HTMLSelectElement).value; fetchLogs(); }}
          class="bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]">
          <option value="">all services</option>
          {store.services.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={f.source} onChange$={(e) => { f.source = (e.target as HTMLSelectElement).value; fetchLogs(); }}
          class="bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]">
          <option value="">all sources</option>
          {store.sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={f.level} onChange$={(e) => { f.level = (e.target as HTMLSelectElement).value; fetchLogs(); }}
          class="bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]">
          <option value="">all levels</option>
          <option value="error">error</option>
          <option value="warn">warn+error</option>
          <option value="info">info</option>
          <option value="debug">debug</option>
        </select>
        <input value={f.q} placeholder="search message / route / stack"
          onInput$={(e) => (f.q = (e.target as HTMLInputElement).value)}
          onKeyDown$={(e) => { if (e.key === 'Enter') fetchLogs(); }}
          class="flex-1 min-w-[180px] bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]" />
        <button onClick$={() => fetchLogs()} class="term-cyan hover:term-amber border border-[#1f2937] px-3 py-1">SEARCH</button>
        <button onClick$={() => (f.live = !f.live)}
          class={`border border-[#1f2937] px-3 py-1 ${f.live ? 'term-green' : 'term-dim hover:term-amber'}`}>
          {f.live ? '● LIVE' : '○ PAUSED'}
        </button>
      </div>

      {store.err && <div class="term-red">{store.err}</div>}

      {/* Log stream */}
      <div class="term-panel overflow-x-auto">
        <table class="w-full">
          <thead><tr class="term-dim text-[10px] uppercase">
            <th class="text-left py-1 px-2">TIME</th><th class="text-left">SVC</th><th class="text-left">SRC</th>
            <th class="text-left">LVL</th><th class="text-right">STATUS</th><th class="text-right">MS</th><th class="text-left px-2">MESSAGE</th>
          </tr></thead>
          <tbody>
            {store.logs.length === 0 && <tr><td colSpan={7} class="term-dim text-center py-4">no logs match</td></tr>}
            {store.logs.map((r) => (
              <>
                <tr key={r._id} class="term-row border-t border-[#111827] cursor-pointer align-top"
                  onClick$={() => (expanded.value = expanded.value === r._id ? '' : r._id)}>
                  <td class="py-1 px-2 term-dim whitespace-nowrap">{fmtDate(r.ts)}</td>
                  <td class="term-cyan whitespace-nowrap">{r.service}</td>
                  <td class="term-dim whitespace-nowrap">{r.source}</td>
                  <td class={`${levelColor(r.level)} font-bold`}>{(r.level || '').toUpperCase()}</td>
                  <td class={`text-right tabular-nums ${statusColor(r.status)}`}>{r.status ?? ''}</td>
                  <td class="text-right tabular-nums term-dim">{r.duration_ms ?? ''}</td>
                  <td class="px-2 max-w-[520px] truncate" title={r.message}>{r.message}</td>
                </tr>
                {expanded.value === r._id && (
                  <tr key={r._id + '-x'} class="border-t border-[#111827] bg-[#0a0a0a]">
                    <td colSpan={7} class="px-3 py-2 space-y-1">
                      {(r.method || r.route) && <div class="term-dim">{r.method} <span class="term-cyan">{r.route}</span></div>}
                      {r.ip && <div class="term-dim">ip: {r.ip}</div>}
                      {r.session_id && <div class="term-dim">session: {r.session_id}</div>}
                      {r.stack && <pre class="term-red whitespace-pre-wrap text-[11px] mt-1">{r.stack}</pre>}
                      {r.meta && <pre class="term-dim whitespace-pre-wrap text-[11px] mt-1">{JSON.stringify(r.meta, null, 2)}</pre>}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
