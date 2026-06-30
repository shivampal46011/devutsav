import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { TOKEN_KEY } from '../shared';

// Admin editor for the fleet's persistent memory. Agents read these entries every run; the
// orchestrator also writes here automatically (source 'orchestrator'). One fact per row.

interface Memory {
  _id: string;
  scope: string;
  key: string;
  content: string;
  pinned: boolean;
  source: 'admin' | 'orchestrator';
  updatedAt: string;
}

const SCOPES = ['global', 'orchestrator', 'writer', 'healer', 'audit', 'analytics'];

const scopeColor = (s: string) =>
  s === 'global' ? 'term-amber'
    : s === 'orchestrator' ? 'term-cyan'
    : 'term-dim';

export default component$(() => {
  const token = useSignal('');
  const store = useStore<{ items: Memory[]; filter: string; err: string }>({ items: [], filter: '', err: '' });
  const form = useStore({ scope: 'global', key: '', content: '', pinned: false, saving: false });

  const base = `${getApiBase()}/api/admin/agents`;
  const authH = $(() => ({ Authorization: `Bearer ${token.value}` }));

  const load = $(async () => {
    if (!token.value) return;
    try {
      const qs = store.filter ? `?scope=${store.filter}` : '';
      const r = await fetch(`${base}/memory${qs}`, { headers: await authH() });
      if (r.ok) store.items = await r.json();
    } catch (e: any) {
      store.err = String(e?.message || e);
    }
  });

  const save = $(async () => {
    if (!token.value || form.saving) return;
    if (!form.key.trim() || !form.content.trim()) { store.err = 'key and content are required'; return; }
    form.saving = true; store.err = '';
    try {
      const r = await fetch(`${base}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authH()) },
        body: JSON.stringify({ scope: form.scope, key: form.key.trim(), content: form.content.trim(), pinned: form.pinned }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
      form.key = ''; form.content = ''; form.pinned = false;
      await load();
    } catch (e: any) {
      store.err = String(e?.message || e);
    } finally {
      form.saving = false;
    }
  });

  const togglePin = $(async (m: Memory) => {
    if (!token.value) return;
    await fetch(`${base}/memory/${m._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(await authH()) },
      body: JSON.stringify({ pinned: !m.pinned }),
    }).catch(() => {});
    await load();
  });

  const remove = $(async (id: string) => {
    if (!token.value) return;
    await fetch(`${base}/memory/${id}`, { method: 'DELETE', headers: await authH() }).catch(() => {});
    await load();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    try { token.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    load();
    const id = setInterval(() => { try { token.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {} load(); }, 10000);
    cleanup(() => clearInterval(id));
  });

  return (
    <div class="term-panel p-3 space-y-3">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="term-amber font-bold tracking-widest text-[11px]">🗃 FLEET MEMORY — WHAT THE AGENTS KNOW</div>
        <select
          value={store.filter}
          onChange$={(e) => { store.filter = (e.target as HTMLSelectElement).value; load(); }}
          class="bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6] text-[11px]"
        >
          <option value="">all scopes</option>
          {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Add / update */}
      <div class="flex flex-wrap gap-2 items-start">
        <select
          value={form.scope}
          onChange$={(e) => (form.scope = (e.target as HTMLSelectElement).value)}
          class="bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1.5 outline-none text-[#e6e6e6]"
        >
          {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          value={form.key}
          onInput$={(e) => (form.key = (e.target as HTMLInputElement).value)}
          placeholder="key (e.g. live-blog-list-path)"
          class="w-[200px] bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1.5 outline-none text-[#e6e6e6]"
        />
        <input
          value={form.content}
          onInput$={(e) => (form.content = (e.target as HTMLInputElement).value)}
          onKeyDown$={(e) => { if (e.key === 'Enter') save(); }}
          placeholder="fact / preference, e.g. Blog list lives at /blog/articles"
          class="flex-1 min-w-[200px] bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1.5 outline-none text-[#e6e6e6]"
        />
        <label class="flex items-center gap-1 term-dim border border-[#1f2937] px-2 py-1.5 cursor-pointer text-[11px]">
          <input type="checkbox" checked={form.pinned} onChange$={() => (form.pinned = !form.pinned)} /> pin
        </label>
        <button onClick$={save} disabled={form.saving} class="term-green border border-[#00ff7f] hover:bg-[#001a0d] px-3 py-1.5 disabled:opacity-50">
          {form.saving ? '…' : 'SAVE'}
        </button>
      </div>
      {store.err && <div class="term-red text-[11px]">{store.err}</div>}

      {/* Entries */}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="term-dim text-[10px] uppercase">
            <th class="text-left py-1 px-1">SCOPE</th><th class="text-left">KEY</th><th class="text-left">CONTENT</th>
            <th class="text-left">SRC</th><th class="text-right px-1"></th>
          </tr></thead>
          <tbody>
            {store.items.length === 0 && <tr><td colSpan={5} class="term-dim text-center py-3">no memory yet — add a fact above, or let the orchestrator learn</td></tr>}
            {store.items.map((m) => (
              <tr key={m._id} class="term-row border-t border-[#111827] align-top">
                <td class={`py-1.5 px-1 ${scopeColor(m.scope)} whitespace-nowrap`}>{m.pinned ? '📌 ' : ''}{m.scope}</td>
                <td class="term-cyan max-w-[160px] truncate" title={m.key}>{m.key}</td>
                <td class="text-[#e6e6e6] max-w-[360px] break-words text-[12px]">{m.content}</td>
                <td class="term-dim text-[10px]">{m.source}</td>
                <td class="text-right px-1 whitespace-nowrap">
                  <button onClick$={() => togglePin(m)} class="term-dim hover:term-amber border border-[#1f2937] px-1.5" title="pin/unpin">📌</button>
                  <button onClick$={() => remove(m._id)} class="term-dim hover:term-red border border-[#1f2937] px-1.5 ml-1" title="forget">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
