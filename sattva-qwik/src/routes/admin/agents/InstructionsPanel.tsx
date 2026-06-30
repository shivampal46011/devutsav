import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { TOKEN_KEY } from '../shared';

// Operator instructions editor. Per-scope markdown that OVERRIDES an agent's built-in system
// prompt (injected as an authoritative system prompt at run time). 'global' applies to every
// agent; an agent name targets just that one. The output contract (e.g. the writer's required
// format) is still enforced so publishing keeps working.

interface Instr {
  scope: string;
  content: string;
  enabled: boolean;
  updatedAt: string | null;
}

const SCOPES = ['global', 'orchestrator', 'writer', 'healer', 'audit', 'analytics'];

export default component$(() => {
  const token = useSignal('');
  const store = useStore<{ all: Record<string, Instr>; scope: string; draft: string; enabled: boolean; saving: boolean; saved: boolean; err: string }>({
    all: {}, scope: 'global', draft: '', enabled: true, saving: false, saved: false, err: '',
  });

  const base = `${getApiBase()}/api/admin/agents`;
  const authH = $(() => ({ Authorization: `Bearer ${token.value}` }));

  const load = $(async () => {
    if (!token.value) return;
    try {
      const r = await fetch(`${base}/instructions`, { headers: await authH() });
      if (!r.ok) return;
      const list: Instr[] = await r.json();
      store.all = Object.fromEntries(list.map((i) => [i.scope, i]));
      const cur = store.all[store.scope];
      store.draft = cur?.content || '';
      store.enabled = cur ? cur.enabled : true;
    } catch (e: any) {
      store.err = String(e?.message || e);
    }
  });

  const pick = $((scope: string) => {
    store.scope = scope;
    const cur = store.all[scope];
    store.draft = cur?.content || '';
    store.enabled = cur ? cur.enabled : true;
    store.saved = false;
    store.err = '';
  });

  const save = $(async () => {
    if (!token.value || store.saving) return;
    store.saving = true; store.err = ''; store.saved = false;
    try {
      const r = await fetch(`${base}/instructions/${store.scope}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await authH()) },
        body: JSON.stringify({ content: store.draft, enabled: store.enabled }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
      const doc: Instr = await r.json();
      store.all[store.scope] = doc;
      store.saved = true;
    } catch (e: any) {
      store.err = String(e?.message || e);
    } finally {
      store.saving = false;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    try { token.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    load();
  });

  const dirty = store.draft !== (store.all[store.scope]?.content || '') || store.enabled !== (store.all[store.scope] ? store.all[store.scope].enabled : true);
  const hasContent = (s: string) => !!store.all[s]?.content?.trim();

  return (
    <div class="term-panel p-3 space-y-3">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="term-amber font-bold tracking-widest text-[11px]">📝 AGENT INSTRUCTIONS — OVERRIDE THE SYSTEM PROMPT</div>
        <span class="term-dim text-[10px]">markdown · injected as an authoritative system prompt</span>
      </div>

      {/* Scope tabs */}
      <div class="flex flex-wrap gap-1">
        {SCOPES.map((s) => (
          <button
            key={s}
            onClick$={() => pick(s)}
            class={`px-2 py-1 border text-[11px] ${s === store.scope ? 'border-[#ffb000] term-amber' : 'border-[#1f2937] term-dim hover:border-[#374151]'}`}
          >
            {hasContent(s) ? (store.all[s]?.enabled ? '● ' : '○ ') : ''}{s}
          </button>
        ))}
      </div>

      <textarea
        value={store.draft}
        onInput$={(e) => { store.draft = (e.target as HTMLTextAreaElement).value; store.saved = false; }}
        placeholder={store.scope === 'global'
          ? '# Rules for every agent\n\n- Brand voice: warm, practical, no hype\n- Always write for an Indian audience'
          : `# Instructions for the ${store.scope}\n\nThese override the ${store.scope}'s default behavior.`}
        rows={10}
        class="w-full bg-black border border-[#1f2937] focus:border-[#ffb000] px-3 py-2 outline-none text-[#e6e6e6] font-mono text-[12px] resize-y"
      />

      <div class="flex items-center justify-between flex-wrap gap-2">
        <label class="flex items-center gap-1.5 term-dim text-[11px] cursor-pointer">
          <input type="checkbox" checked={store.enabled} onChange$={() => { store.enabled = !store.enabled; store.saved = false; }} />
          enabled {store.enabled ? '' : '(agents will ignore this)'}
        </label>
        <div class="flex items-center gap-3">
          {store.err && <span class="term-red text-[11px]">{store.err}</span>}
          {store.saved && !dirty && <span class="term-green text-[11px]">saved ✓</span>}
          {dirty && <span class="term-amber text-[10px]">unsaved</span>}
          <button onClick$={save} disabled={store.saving || !dirty} class="term-green border border-[#00ff7f] hover:bg-[#001a0d] px-4 py-1.5 disabled:opacity-40">
            {store.saving ? 'SAVING…' : 'SAVE'}
          </button>
        </div>
      </div>
      <div class="term-dim text-[10px]">
        Takes effect on the next run of <span class="term-cyan">{store.scope === 'global' ? 'every agent' : `the ${store.scope}`}</span>. The agent's required output format is always preserved.
      </div>
    </div>
  );
});
