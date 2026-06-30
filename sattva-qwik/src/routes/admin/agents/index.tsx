import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { TOKEN_KEY, fmtDate, dur } from '../shared';
import OrchestratorChat from './OrchestratorChat';
import MemoryPanel from './MemoryPanel';
import InstructionsPanel from './InstructionsPanel';

interface AgentSummary {
  agent: string;
  last_run_at: string | null;
  last_status: string | null;
  last_run_id: string | null;
  last_duration_ms: number | null;
  last_failed_step: string | null;
  runs_7d: number; success_7d: number; error_7d: number; open_tickets: number;
}
interface Status {
  now: string;
  runner: { online: boolean; last_seen: string | null; info: Record<string, unknown> };
  open_tickets: number;
  queued_commands: number;
  agents: AgentSummary[];
}
interface RunRow {
  run_id: string; agent: string; mode?: string; status: string;
  duration_ms?: number; failed_step?: string | null; ts: string;
  result?: any;
}
interface TicketRow {
  id: string; title: string; priority: string; status: string; category?: string;
  source_agent?: string; failed_step?: string; occurrences?: number; last_seen?: string;
}
interface CommandRow {
  _id: string; agent: string; prompt: string; status: string;
  result?: any; error?: string | null; run_id?: string | null;
  createdAt: string; started_at?: string | null; ended_at?: string | null;
}

const AGENT_META: Record<string, { label: string; icon: string; needsPrompt?: boolean; desc: string }> = {
  writer: { label: 'WRITER', icon: '✍', needsPrompt: true, desc: 'Generate + publish a blog post on a topic' },
  audit: { label: 'AUDIT', icon: '🔍', desc: 'Crawl the live site, file tickets for issues' },
  healer: { label: 'HEALER', icon: '🛠', desc: 'Triage logs → tickets → fix code tickets' },
  analytics: { label: 'ANALYTICS', icon: '📊', desc: 'Pull GA4 data and write a report' },
};

const statusColor = (s: string | null | undefined) =>
  s === 'success' || s === 'done' ? 'term-green'
    : s === 'error' || s === 'failed' ? 'term-red'
    : s === 'running' || s === 'queued' ? 'term-amber'
    : 'term-dim';

const prioColor = (p: string) =>
  p === 'critical' ? 'term-red' : p === 'high' ? 'term-amber' : p === 'medium' ? 'term-cyan' : 'term-dim';

export default component$(() => {
  const store = useStore<{
    status: Status | null; runs: RunRow[]; tickets: TicketRow[]; commands: CommandRow[];
    err: string; lastSync: string; loading: boolean;
  }>({ status: null, runs: [], tickets: [], commands: [], err: '', lastSync: '', loading: false });

  const sel = useStore({ agent: 'writer', prompt: '', deep: false, commit: false, sending: false });

  const token = useSignal('');

  const fetchAll = $(async () => {
    if (!token.value) return;
    store.loading = true;
    const h = { Authorization: `Bearer ${token.value}` };
    try {
      const base = `${getApiBase()}/api/admin/agents`;
      const [s, r, t, c] = await Promise.all([
        fetch(`${base}/status`, { headers: h }),
        fetch(`${base}/runs?limit=25`, { headers: h }),
        fetch(`${base}/tickets?limit=40`, { headers: h }),
        fetch(`${base}/commands?limit=25`, { headers: h }),
      ]);
      if (s.status === 401) { store.err = 'Unauthorized — re-authenticate via the top bar.'; return; }
      store.status = await s.json();
      store.runs = await r.json();
      store.tickets = await t.json();
      store.commands = await c.json();
      store.err = '';
      store.lastSync = new Date().toLocaleTimeString('en-GB', { hour12: false });
    } catch (e: any) {
      store.err = String(e?.message || e);
    } finally {
      store.loading = false;
    }
  });

  const send = $(async () => {
    if (!token.value || sel.sending) return;
    if (AGENT_META[sel.agent]?.needsPrompt && !sel.prompt.trim()) {
      store.err = 'A topic/prompt is required for the writer.';
      return;
    }
    sel.sending = true;
    store.err = '';
    try {
      const options: Record<string, unknown> = {};
      if (sel.agent === 'audit') options.deep = sel.deep;
      if (sel.agent === 'healer') options.commit = sel.commit;
      const res = await fetch(`${getApiBase()}/api/admin/agents/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
        body: JSON.stringify({ agent: sel.agent, prompt: sel.prompt.trim(), options }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      sel.prompt = '';
      await fetchAll();
    } catch (e: any) {
      store.err = String(e?.message || e);
    } finally {
      sel.sending = false;
    }
  });

  const cancel = $(async (id: string) => {
    if (!token.value) return;
    await fetch(`${getApiBase()}/api/admin/agents/commands/${id}/cancel`, {
      method: 'POST', headers: { Authorization: `Bearer ${token.value}` },
    }).catch(() => {});
    await fetchAll();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    try { token.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    fetchAll();
    const id = setInterval(() => { try { token.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {} fetchAll(); }, 8000);
    cleanup(() => clearInterval(id));
  });

  const s = store.status;
  const runner = s?.runner;

  return (
    <div class="p-3 space-y-6">
      {/* Header / runner status */}
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="term-amber font-bold tracking-widest">AGENT CONTROL</div>
        <div class="flex items-center gap-4 flex-wrap">
          <span>
            <span class="term-dim">RUNNER </span>
            <span class={runner?.online ? 'term-green' : 'term-red'}>
              ● {runner?.online ? 'ONLINE' : 'OFFLINE'}
            </span>
            {runner?.last_seen && <span class="term-dim"> · seen {fmtDate(runner.last_seen)}</span>}
          </span>
          <span class="term-dim">QUEUED <span class="term-amber">{s?.queued_commands ?? 0}</span></span>
          <span class="term-dim">OPEN TICKETS <span class="term-cyan">{s?.open_tickets ?? 0}</span></span>
          <span class="term-dim">sync {store.lastSync || '—'}</span>
        </div>
      </div>

      {!runner?.online && (
        <div class="term-panel p-2 term-dim border-[#ff4d4d]">
          <span class="term-red">runner offline</span> — start it on the machine with the repo:
          <span class="term-amber"> cd agent &amp;&amp; bun src/cli.js agents:listen</span>. Commands you send will queue until it's up.
        </div>
      )}
      {store.err && <div class="term-red">{store.err}</div>}

      {/* Orchestrator: natural-language control that proposes a plan across agents */}
      <OrchestratorChat />

      {/* Operator instructions — override each agent's system prompt */}
      <InstructionsPanel />

      {/* Persistent memory the whole fleet reads */}
      <MemoryPanel />

      {/* Trigger a run (manual single-agent fallback) */}
      <div class="term-panel p-3 space-y-3">
        <div class="term-amber font-bold tracking-widest text-[11px]">OR TRIGGER A SINGLE AGENT DIRECTLY</div>
        <div class="flex flex-wrap gap-2 items-start">
          <select
            value={sel.agent}
            onChange$={(e) => (sel.agent = (e.target as HTMLSelectElement).value)}
            class="bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1.5 outline-none text-[#e6e6e6]"
          >
            {Object.entries(AGENT_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
          <input
            value={sel.prompt}
            onInput$={(e) => (sel.prompt = (e.target as HTMLInputElement).value)}
            onKeyDown$={(e) => { if (e.key === 'Enter') send(); }}
            placeholder={AGENT_META[sel.agent]?.needsPrompt ? 'Topic, e.g. "Rahu in the 7th house"' : 'Optional note'}
            class="flex-1 min-w-[200px] bg-black border border-[#1f2937] focus:border-[#ffb000] px-3 py-1.5 outline-none text-[#e6e6e6]"
          />
          {sel.agent === 'audit' && (
            <label class="flex items-center gap-1.5 term-dim border border-[#1f2937] px-2 py-1.5 cursor-pointer">
              <input type="checkbox" checked={sel.deep} onChange$={() => (sel.deep = !sel.deep)} /> deep
            </label>
          )}
          {sel.agent === 'healer' && (
            <label class="flex items-center gap-1.5 term-dim border border-[#1f2937] px-2 py-1.5 cursor-pointer">
              <input type="checkbox" checked={sel.commit} onChange$={() => (sel.commit = !sel.commit)} /> commit fix
            </label>
          )}
          <button
            onClick$={send}
            disabled={sel.sending}
            class="term-green border border-[#00ff7f] hover:bg-[#001a0d] px-4 py-1.5 disabled:opacity-50"
          >
            {sel.sending ? 'SENDING…' : 'SEND ▸'}
          </button>
        </div>
        <div class="term-dim text-[10px]">{AGENT_META[sel.agent]?.desc}</div>
      </div>

      {/* Per-agent status cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {(s?.agents || []).map((a) => (
          <div key={a.agent} class="term-panel p-3 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="term-cyan font-bold tracking-widest">{AGENT_META[a.agent]?.icon} {AGENT_META[a.agent]?.label || a.agent}</span>
              <span class={statusColor(a.last_status)}>{(a.last_status || '—').toUpperCase()}</span>
            </div>
            <div class="term-dim">last run <span class="text-[#e6e6e6]">{a.last_run_at ? fmtDate(a.last_run_at) : '—'}</span></div>
            <div class="term-dim">duration <span class="text-[#e6e6e6]">{dur(a.last_duration_ms)}</span></div>
            {a.last_failed_step && <div class="term-red">failed: {a.last_failed_step}</div>}
            <div class="flex gap-3 pt-1 border-t border-[#1f2937]">
              <span class="term-dim">7d <span class="term-green">{a.success_7d}</span>/<span class="term-red">{a.error_7d}</span></span>
              <span class="term-dim">tickets <span class="term-amber">{a.open_tickets}</span></span>
            </div>
          </div>
        ))}
      </div>

      {/* Command history */}
      <div>
        <div class="term-amber font-bold tracking-widest mb-2">COMMAND HISTORY</div>
        <div class="overflow-x-auto term-panel">
          <table class="w-full">
            <thead><tr class="term-dim text-[10px] uppercase">
              <th class="text-left py-1 px-2">TIME</th><th class="text-left">AGENT</th><th class="text-left">PROMPT</th>
              <th class="text-left">STATUS</th><th class="text-left">RESULT</th><th class="text-right px-2"></th>
            </tr></thead>
            <tbody>
              {store.commands.length === 0 && <tr><td colSpan={6} class="term-dim text-center py-3">no commands yet</td></tr>}
              {store.commands.map((c) => (
                <tr key={c._id} class="term-row border-t border-[#111827] align-top">
                  <td class="py-1.5 px-2 term-dim whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                  <td class="term-cyan">{AGENT_META[c.agent]?.label || c.agent}</td>
                  <td class="max-w-[280px] truncate" title={c.prompt}>{c.prompt || <span class="term-dim">—</span>}</td>
                  <td class={statusColor(c.status)}>{c.status.toUpperCase()}</td>
                  <td class="max-w-[260px] truncate term-dim" title={c.error || JSON.stringify(c.result || {})}>
                    {c.error ? <span class="term-red">{c.error}</span> : c.result ? JSON.stringify(c.result) : '—'}
                  </td>
                  <td class="text-right px-2">
                    {c.status === 'queued' && (
                      <button onClick$={() => cancel(c._id)} class="term-dim hover:term-red border border-[#1f2937] px-1.5">✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent runs */}
      <div>
        <div class="term-amber font-bold tracking-widest mb-2">RECENT RUNS</div>
        <div class="overflow-x-auto term-panel">
          <table class="w-full">
            <thead><tr class="term-dim text-[10px] uppercase">
              <th class="text-left py-1 px-2">TIME</th><th class="text-left">AGENT</th><th class="text-left">MODE</th>
              <th class="text-left">STATUS</th><th class="text-right">DUR</th><th class="text-left px-2">DETAIL</th>
            </tr></thead>
            <tbody>
              {store.runs.length === 0 && <tr><td colSpan={6} class="term-dim text-center py-3">no runs synced yet</td></tr>}
              {store.runs.map((r) => (
                <tr key={r.run_id} class="term-row border-t border-[#111827]">
                  <td class="py-1.5 px-2 term-dim whitespace-nowrap">{fmtDate(r.ts)}</td>
                  <td class="term-cyan">{r.agent}</td>
                  <td class="term-dim">{r.mode || '—'}</td>
                  <td class={statusColor(r.status)}>{r.status.toUpperCase()}</td>
                  <td class="text-right tabular-nums">{dur(r.duration_ms)}</td>
                  <td class="px-2 term-dim max-w-[280px] truncate" title={r.failed_step || JSON.stringify(r.result || {})}>
                    {r.failed_step ? <span class="term-red">failed: {r.failed_step}</span> : r.result ? JSON.stringify(r.result) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tickets */}
      <div>
        <div class="term-amber font-bold tracking-widest mb-2">TICKET QUEUE</div>
        <div class="overflow-x-auto term-panel">
          <table class="w-full">
            <thead><tr class="term-dim text-[10px] uppercase">
              <th class="text-left py-1 px-2">ID</th><th class="text-left">PRIO</th><th class="text-left">STATUS</th>
              <th class="text-left">AGENT</th><th class="text-left">TITLE</th><th class="text-right">OCC</th><th class="text-right px-2">LAST</th>
            </tr></thead>
            <tbody>
              {store.tickets.length === 0 && <tr><td colSpan={7} class="term-dim text-center py-3">no tickets</td></tr>}
              {store.tickets.map((t) => (
                <tr key={t.id} class="term-row border-t border-[#111827]">
                  <td class="py-1.5 px-2 term-dim whitespace-nowrap">{t.id}</td>
                  <td class={prioColor(t.priority)}>{(t.priority || '—').toUpperCase()}</td>
                  <td class={statusColor(t.status)}>{(t.status || '—').toUpperCase()}</td>
                  <td class="term-cyan">{t.source_agent || '—'}</td>
                  <td class="max-w-[320px] truncate" title={t.title}>{t.title}</td>
                  <td class="text-right tabular-nums">{t.occurrences ?? 1}</td>
                  <td class="text-right px-2 term-dim whitespace-nowrap">{t.last_seen ? fmtDate(t.last_seen) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
