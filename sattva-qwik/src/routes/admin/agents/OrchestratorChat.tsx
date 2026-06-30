import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { TOKEN_KEY, fmtDate } from '../shared';

// Multi-turn chat with the reactive Orchestrator. You give it a goal + a step budget; it runs the
// goal as a loop (propose next step → run it → feed the result back → re-plan) until it finishes,
// hits the cap, or you pause it. Each step's RESULT flows back so the next step can build on it.

interface PlanStep {
  _id: string;
  agent: string;
  prompt: string;
  options?: Record<string, unknown>;
  why?: string;
  status: 'proposed' | 'queued' | 'running' | 'done' | 'error' | 'skipped';
  command_id?: string | null;
}
interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  plan?: PlanStep[];
  error?: string | null;
  ts: string;
}
interface Chat {
  _id: string;
  title: string;
  thinking: boolean;
  auto: boolean;
  max_steps: number;
  steps_used: number;
  goal_status: 'idle' | 'running' | 'paused' | 'done' | 'capped';
  messages: ChatMessage[];
  updatedAt: string;
}
interface ChatSummary {
  _id: string;
  title: string;
  thinking: boolean;
  message_count: number;
  last: string;
  updatedAt: string;
}

const AGENT_ICON: Record<string, string> = { writer: '✍', audit: '🔍', healer: '🛠', analytics: '📊' };

const stepColor = (s: string) =>
  s === 'done' ? 'term-green'
    : s === 'error' ? 'term-red'
    : s === 'running' || s === 'queued' ? 'term-amber'
    : s === 'skipped' ? 'term-dim'
    : 'term-cyan';

const goalColor = (s: string) =>
  s === 'running' ? 'term-amber'
    : s === 'done' ? 'term-green'
    : s === 'capped' ? 'term-red'
    : s === 'paused' ? 'term-cyan'
    : 'term-dim';

export default component$(() => {
  const token = useSignal('');
  const store = useStore<{
    chats: ChatSummary[];
    active: Chat | null;
    activeId: string;
    input: string;
    maxSteps: number;
    sending: boolean;
    err: string;
  }>({ chats: [], active: null, activeId: '', input: '', maxSteps: 8, sending: false, err: '' });

  const base = `${getApiBase()}/api/admin/agents`;
  const authH = $(() => ({ Authorization: `Bearer ${token.value}` }));

  const loadChats = $(async () => {
    if (!token.value) return;
    try {
      const r = await fetch(`${base}/chats?limit=30`, { headers: await authH() });
      if (r.ok) store.chats = await r.json();
    } catch (e: any) {
      store.err = String(e?.message || e);
    }
  });

  const loadActive = $(async (id: string) => {
    if (!token.value || !id) return;
    try {
      const r = await fetch(`${base}/chats/${id}`, { headers: await authH() });
      if (r.ok) {
        store.active = await r.json();
        store.activeId = id;
      }
    } catch (e: any) {
      store.err = String(e?.message || e);
    }
  });

  const send = $(async () => {
    const msg = store.input.trim();
    if (!msg || !token.value || store.sending) return;
    store.sending = true;
    store.err = '';
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authH()) };
      const body = JSON.stringify({ message: msg, auto: true, max_steps: store.maxSteps });
      const url = store.activeId ? `${base}/chats/${store.activeId}/messages` : `${base}/chats`;
      const r = await fetch(url, { method: 'POST', headers, body });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
      const chat: Chat = await r.json();
      store.active = chat;
      store.activeId = chat._id;
      store.input = '';
      await loadChats();
    } catch (e: any) {
      store.err = String(e?.message || e);
    } finally {
      store.sending = false;
    }
  });

  const approve = $(async (messageId: string, stepId?: string) => {
    if (!token.value || !store.activeId) return;
    try {
      const r = await fetch(`${base}/chats/${store.activeId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authH()) },
        body: JSON.stringify({ message_id: messageId, step_id: stepId }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
      store.active = await r.json();
    } catch (e: any) {
      store.err = String(e?.message || e);
    }
  });

  const setGoal = $(async (action: 'pause' | 'resume') => {
    if (!token.value || !store.activeId) return;
    try {
      const r = await fetch(`${base}/chats/${store.activeId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authH()) },
        body: JSON.stringify({ max_steps: store.maxSteps }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
      store.active = await r.json();
    } catch (e: any) {
      store.err = String(e?.message || e);
    }
  });

  const newChat = $(() => { store.active = null; store.activeId = ''; store.input = ''; store.err = ''; });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    try { token.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    loadChats();
    // Poll the active chat so the assistant reply + step progress appear without a manual refresh.
    const id = setInterval(() => {
      try { token.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
      if (store.activeId) loadActive(store.activeId);
      loadChats();
    }, 4000);
    cleanup(() => clearInterval(id));
  });

  const a = store.active;

  return (
    <div class="term-panel p-3 flex flex-col h-[calc(100vh-130px)] min-h-[520px]">
      <div class="flex items-center justify-between shrink-0">
        <div class="term-amber font-bold tracking-widest text-[11px]">🧠 ORCHESTRATOR — TELL IT THE GOAL</div>
        <button onClick$={newChat} class="term-dim hover:term-cyan border border-[#1f2937] px-2 py-0.5 text-[11px]">+ NEW CHAT</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 flex-1 min-h-0 mt-3">
        {/* Chat list */}
        <div class="space-y-1 overflow-y-auto border-r border-[#1f2937] pr-2 min-h-0 hidden md:block">
          {store.chats.length === 0 && <div class="term-dim text-[11px]">no chats yet</div>}
          {store.chats.map((c) => (
            <button
              key={c._id}
              onClick$={() => loadActive(c._id)}
              class={`w-full text-left px-2 py-1 border ${c._id === store.activeId ? 'border-[#ffb000] term-amber' : 'border-[#111827] term-dim hover:border-[#1f2937]'}`}
            >
              <div class="truncate text-[11px]">{c.title || 'New chat'}</div>
              <div class="term-dim text-[9px]">{c.thinking ? 'thinking…' : `${c.message_count} msg`}</div>
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div class="flex flex-col min-h-0 min-w-0">
          <div class="space-y-2 overflow-y-auto overflow-x-hidden pr-1 flex-1 min-h-0 min-w-0">
            {!a && <div class="term-dim text-[11px]">Start a new goal, e.g. <span class="term-cyan">"Audit the site, then write a blog fixing the biggest SEO gap."</span> — it will run the steps itself up to the cap.</div>}
            {a?.messages.map((m) => m.role === 'system' ? (
              // An agent's RESULT fed back into the loop.
              <div key={m._id} class="text-center">
                <span class={`text-[10px] break-words ${m.content.includes('ERROR') ? 'term-red' : 'term-dim'}`}>↳ {m.content}</span>
              </div>
            ) : (
              <div key={m._id} class={m.role === 'user' ? 'text-right' : ''}>
                <div class={`inline-block max-w-[90%] px-3 py-1.5 border text-left break-words ${m.role === 'user' ? 'border-[#1f2937] term-cyan' : 'border-[#111827] text-[#e6e6e6]'}`}>
                  <div class="term-dim text-[9px] uppercase mb-0.5">{m.role === 'user' ? 'you' : 'orchestrator'}</div>
                  {m.error ? <span class="term-red break-words">⚠ {m.error}</span> : <span class="whitespace-pre-wrap break-words text-[12px]">{m.content}</span>}

                  {/* Proposed plan */}
                  {m.plan && m.plan.length > 0 && (
                    <div class="mt-2 space-y-1.5 border-t border-[#1f2937] pt-2">
                      <div class="flex items-center justify-between">
                        <span class="term-amber text-[10px] tracking-widest">PROPOSED PLAN</span>
                        {m.plan.some((s) => s.status === 'proposed') && (
                          <button onClick$={() => approve(m._id)} class="term-green border border-[#00ff7f] hover:bg-[#001a0d] px-2 py-0.5 text-[10px]">RUN ALL ▸</button>
                        )}
                      </div>
                      {m.plan.map((s, i) => (
                        <div key={s._id} class="border border-[#111827] px-2 py-1.5">
                          <div class="flex items-center justify-between gap-2">
                            <span class="term-cyan text-[11px]">{i + 1}. {AGENT_ICON[s.agent]} {s.agent.toUpperCase()}</span>
                            <div class="flex items-center gap-2">
                              <span class={`text-[9px] uppercase ${stepColor(s.status)}`}>{s.status}</span>
                              {s.status === 'proposed' && (
                                <button onClick$={() => approve(m._id, s._id)} class="term-green border border-[#00ff7f] hover:bg-[#001a0d] px-1.5 py-0.5 text-[9px]">RUN</button>
                              )}
                            </div>
                          </div>
                          {s.prompt && <div class="term-dim text-[11px] mt-0.5 truncate" title={s.prompt}>“{s.prompt}”</div>}
                          {s.options && Object.keys(s.options).length > 0 && (
                            <div class="term-dim text-[9px] break-all">opts: {JSON.stringify(s.options)}</div>
                          )}
                          {s.why && <div class="term-dim text-[9px] italic break-words">↳ {s.why}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {a?.thinking && <div class="term-amber text-[11px] animate-pulse">orchestrator is thinking…</div>}
          </div>

          {/* Goal status / autonomy bar */}
          {a && (
            <div class="flex items-center justify-between gap-2 shrink-0 mt-2 border-t border-[#1f2937] pt-2 flex-wrap">
              <div class="flex items-center gap-3 text-[10px]">
                <span class="term-dim">GOAL <span class={goalColor(a.goal_status)}>{(a.goal_status || 'idle').toUpperCase()}</span></span>
                <span class="term-dim">STEPS <span class="text-[#e6e6e6]">{a.steps_used}/{a.max_steps}</span></span>
              </div>
              <div class="flex items-center gap-2">
                {a.goal_status === 'running' && (
                  <button onClick$={() => setGoal('pause')} class="term-amber border border-[#ffb000] hover:bg-[#1a1400] px-2 py-0.5 text-[10px]">⏸ PAUSE</button>
                )}
                {(a.goal_status === 'paused' || a.goal_status === 'capped') && (
                  <button onClick$={() => setGoal('resume')} class="term-green border border-[#00ff7f] hover:bg-[#001a0d] px-2 py-0.5 text-[10px]">▸ RESUME</button>
                )}
              </div>
            </div>
          )}

          {store.err && <div class="term-red text-[11px] shrink-0 mt-2">{store.err}</div>}

          {/* Composer */}
          <div class="flex gap-2 shrink-0 mt-2 items-center">
            <input
              value={store.input}
              onInput$={(e) => (store.input = (e.target as HTMLInputElement).value)}
              onKeyDown$={(e) => { if (e.key === 'Enter') send(); }}
              placeholder="Tell the orchestrator the goal…"
              class="flex-1 min-w-0 bg-black border border-[#1f2937] focus:border-[#ffb000] px-3 py-1.5 outline-none text-[#e6e6e6]"
            />
            <label class="flex items-center gap-1 term-dim text-[10px] border border-[#1f2937] px-2 py-1" title="max agent runs for this goal">
              cap
              <input
                type="number" min="1" max="30"
                value={store.maxSteps}
                onInput$={(e) => (store.maxSteps = Math.max(1, Math.min(30, Number((e.target as HTMLInputElement).value) || 8)))}
                class="w-10 bg-black outline-none text-[#e6e6e6] text-center"
              />
            </label>
            <button onClick$={send} disabled={store.sending} class="term-green border border-[#00ff7f] hover:bg-[#001a0d] px-4 py-1.5 disabled:opacity-50">
              {store.sending ? '…' : 'SEND ▸'}
            </button>
          </div>
          <div class="term-dim text-[9px] shrink-0 mt-1">{a ? `chat updated ${fmtDate(a.updatedAt)} · sending a new message starts a fresh goal (resets the budget)` : 'new conversation'}</div>
        </div>
      </div>
    </div>
  );
});
