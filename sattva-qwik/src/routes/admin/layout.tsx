import { $, component$, Slot, useContextProvider, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { getApiBase } from '~/lib/apiBase';
import { fmtDate, PulseCtx, type PulseStore, type Pulse, TOKEN_KEY, BulkJobCtx, type BulkJobStore } from './shared';

const NAV = [
  { href: '/admin', label: 'OVERVIEW' },
  { href: '/admin/pages', label: 'PAGES' },
  { href: '/admin/blogs', label: 'BLOGS' },
  { href: '/admin/scheduler', label: 'SCHEDULER' },
  { href: '/admin/events', label: 'EVENTS' },
  { href: '/admin/users', label: 'USERS' },
  { href: '/admin/images', label: 'IMAGES' },
];

function navActive(pathname: string, href: string) {
  const p = pathname.replace(/\/$/, '') || '/';
  const h = href.replace(/\/$/, '') || '/';
  if (h === '/admin') return p === '/admin';
  return p === h || p.startsWith(`${h}/`);
}

export default component$(() => {
  const tokenSig = useSignal<string>('');
  const promptOpen = useSignal(false);
  const progressOpen = useSignal(true);
  const loc = useLocation();
  const BULK_KEY = 'du_admin_bulkjob';
  const PROG_OPEN_KEY = 'du_admin_progress_open';

  const store = useStore<PulseStore>({
    pulse: null,
    isLoading: false,
    errorMsg: '',
    lastFetch: '',
  });
  useContextProvider(PulseCtx, store);

  const bulk = useStore<BulkJobStore>({
    active: false, current: '', queueNames: [], doneCount: 0, totalCount: 0,
    results: [], startedAt: '', label: '', collapsed: false,
  });
  useContextProvider(BulkJobCtx, bulk);

  const fetchPulse = $(async () => {
    if (!tokenSig.value) return;
    store.isLoading = true;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/metrics/pulse`, {
        headers: { Authorization: `Bearer ${tokenSig.value}` },
      });
      if (res.status === 401) {
        store.errorMsg = 'Invalid token';
        promptOpen.value = true;
        try { localStorage.removeItem(TOKEN_KEY); } catch {}
        tokenSig.value = '';
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      store.pulse = (await res.json()) as Pulse;
      store.lastFetch = new Date().toLocaleTimeString('en-GB', { hour12: false });
      store.errorMsg = '';
    } catch (e: any) {
      store.errorMsg = String(e?.message || e);
    } finally {
      store.isLoading = false;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup, track }) => {
    let saved = '';
    try { saved = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    if (!saved) {
      promptOpen.value = true;
    } else {
      tokenSig.value = saved;
      fetchPulse();
    }

    // Restore bulk job + toggle state across SPA navigation / reload
    try {
      const raw = localStorage.getItem(BULK_KEY);
      if (raw) {
        const j = JSON.parse(raw) as Partial<BulkJobStore>;
        if (j && typeof j === 'object') {
          // Only restore if it has meaningful state.
          if (j.totalCount || (j.results && j.results.length) || j.active) {
            Object.assign(bulk, j);
            // If page was killed mid-flight, the request is gone — mark as not active.
            bulk.active = false;
            bulk.current = '';
          }
        }
      }
      const p = localStorage.getItem(PROG_OPEN_KEY);
      if (p != null) progressOpen.value = p === '1';
    } catch {}

    // Persist bulk on every change.
    const persist = () => {
      track(() => bulk.active);
      track(() => bulk.doneCount);
      track(() => bulk.totalCount);
      track(() => bulk.current);
      track(() => bulk.results.length);
      track(() => bulk.label);
      track(() => bulk.collapsed);
      try { localStorage.setItem(BULK_KEY, JSON.stringify(bulk)); } catch {}
    };
    persist();
    track(() => progressOpen.value);
    try { localStorage.setItem(PROG_OPEN_KEY, progressOpen.value ? '1' : '0'); } catch {}

    const id = setInterval(() => {
      if (tokenSig.value) fetchPulse();
    }, 10000);
    cleanup(() => clearInterval(id));
  });

  const submitToken = $((tok: string) => {
    if (!tok.trim()) return;
    try { localStorage.setItem(TOKEN_KEY, tok.trim()); } catch {}
    tokenSig.value = tok.trim();
    promptOpen.value = false;
    fetchPulse();
  });

  return (
    <div class="min-h-screen bg-black text-[#e6e6e6] font-mono text-xs leading-tight">
      <style dangerouslySetInnerHTML={`
        .term-amber { color: #ffb000; }
        .term-cyan { color: #4fc3f7; }
        .term-green { color: #00ff7f; }
        .term-red { color: #ff4d4d; }
        .term-dim { color: #6b7280; }
        .term-panel { border: 1px solid #1f2937; background: #0a0a0a; }
        .term-row:hover { background: #111827; }
        .term-grid { display: grid; gap: 1px; background: #1f2937; }
        .term-cell { background: #0a0a0a; padding: 6px 10px; }
        .term-marquee { animation: tickerSlide 60s linear infinite; }
        @keyframes tickerSlide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `} />

      {promptOpen.value && (
        <div class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div class="term-panel p-6 max-w-md w-full">
            <h2 class="term-amber font-bold uppercase tracking-widest mb-2">DEVUTSAV // ADMIN TERMINAL</h2>
            <p class="term-dim mb-4">Authenticate to access the live metrics feed.</p>
            <input
              type="password" placeholder="ADMIN_API_TOKEN" autoFocus
              class="w-full bg-black border border-[#1f2937] focus:border-[#ffb000] px-3 py-2 outline-none text-[#e6e6e6]"
              onKeyDown$={(e, el) => { if (e.key === 'Enter') submitToken(el.value); }}
            />
            {store.errorMsg && <p class="term-red mt-2">{store.errorMsg}</p>}
            <p class="term-dim mt-3 text-[10px]">stored in localStorage. backend reads ADMIN_API_TOKEN from .env</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div class="border-b border-[#1f2937] bg-[#0a0a0a] px-3 py-1.5 flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-3 flex-wrap">
          <a href="/" class="term-cyan hover:term-amber no-underline border border-[#1f2937] px-2 py-0.5">← SITE</a>
          <span class="term-amber font-bold tracking-widest">DEVUTSAV//ADMIN</span>
          <span class="term-dim">{store.pulse ? fmtDate(store.pulse.now) : '—'}</span>
          <span class={`${store.isLoading ? 'term-amber blink' : store.errorMsg ? 'term-red' : 'term-green'}`}>
            ● {store.isLoading ? 'SYNC' : store.errorMsg ? 'ERR' : 'LIVE'}
          </span>
          {store.errorMsg && <span class="term-red">{store.errorMsg}</span>}
        </div>
        <div class="flex items-center gap-3">
          <span class="term-dim">last sync {store.lastFetch || '—'}</span>
          <button
            onClick$={() => (progressOpen.value = !progressOpen.value)}
            class={`border border-[#1f2937] px-2 py-0.5 ${progressOpen.value ? 'term-amber' : 'term-dim hover:term-amber'}`}
            title="Toggle bulk progress card"
          >
            {bulk.active ? '◐' : '○'} PROGRESS{bulk.totalCount ? ` ${bulk.doneCount}/${bulk.totalCount}` : ''}
          </button>
          <button onClick$={() => fetchPulse()} class="term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5">REFRESH</button>
          <button onClick$={() => { try { localStorage.removeItem(TOKEN_KEY); } catch {}; tokenSig.value = ''; promptOpen.value = true; }} class="term-dim hover:term-red border border-[#1f2937] px-2 py-0.5">LOGOUT</button>
        </div>
      </div>

      {/* Nav strip */}
      <div class="border-b border-[#1f2937] bg-black px-3 py-1 flex flex-wrap gap-1">
        {NAV.map((n) => {
          const active = navActive(loc.url.pathname, n.href);
          return (
            <a
              key={n.href}
              href={n.href}
              class={`no-underline px-3 py-1 border ${active ? 'term-amber border-[#ffb000] bg-[#1a1300]' : 'term-cyan border-[#1f2937] hover:term-amber'}`}
            >
              {n.label}
            </a>
          );
        })}
      </div>

      <Slot />

      {progressOpen.value && (bulk.active || bulk.results.length > 0) && (() => {
        const errs = bulk.results.filter((r) => !r.ok);
        const hasErr = errs.length > 0;
        const lastErr = errs[errs.length - 1];
        const stateColor = bulk.active ? 'term-amber' : hasErr ? 'term-red' : 'term-green';
        const borderColor = bulk.active ? '#ffb000' : hasErr ? '#ff4d4d' : '#00ff7f';
        return (
        <div
          class={`fixed bottom-3 right-3 z-40 term-panel max-w-md w-[min(92vw,28rem)] shadow-2xl ${bulk.active ? 'blink' : ''}`}
          style={`border-color: ${borderColor};`}
        >
          <div class="flex items-center justify-between px-3 py-1.5 border-b" style={`border-color: ${borderColor};`}>
            <div class="flex items-center gap-2">
              <span class={`${stateColor} ${bulk.active ? 'blink' : hasErr && !bulk.active ? 'blink' : ''}`}>●</span>
              <span class={`${stateColor} font-bold tracking-widest text-[11px]`}>
                {bulk.active ? 'PROCESSING' : hasErr ? 'COMPLETED WITH ERRORS' : 'DONE'} · {bulk.label || 'BULK MD'}
              </span>
              <span class="term-dim tabular-nums">{bulk.doneCount}/{bulk.totalCount}</span>
              {hasErr && <span class="term-red tabular-nums text-[10px]">· {errs.length} ERR</span>}
            </div>
            <div class="flex gap-2">
              <button
                onClick$={() => (bulk.collapsed = !bulk.collapsed)}
                class="term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5 text-[10px]"
              >{bulk.collapsed ? 'OPEN' : 'HIDE'}</button>
              {!bulk.active && (
                <button
                  onClick$={() => { bulk.results = []; bulk.totalCount = 0; bulk.doneCount = 0; bulk.label = ''; }}
                  class="term-dim hover:term-red border border-[#1f2937] px-2 py-0.5 text-[10px]"
                >CLEAR</button>
              )}
            </div>
          </div>
          {!bulk.collapsed && (
            <div class="p-3 space-y-2 max-h-72 overflow-y-auto">
              <div class="h-1.5 bg-[#1f2937]">
                <div
                  class="h-full bg-[#ffb000] transition-all"
                  style={`width: ${bulk.totalCount ? Math.round((bulk.doneCount / bulk.totalCount) * 100) : 0}%`}
                />
              </div>
              {bulk.active && (
                <div class="text-[11px]">
                  <span class="term-dim">now: </span>
                  <span class="term-cyan">{bulk.current || '…'}</span>
                </div>
              )}
              {bulk.results.length > 0 && (
                <ul class="text-[11px] space-y-0.5">
                  {bulk.results.slice(-8).reverse().map((r, i) => (
                    <li key={i} class="flex gap-2">
                      <span class={r.ok ? 'term-green' : 'term-red'}>{r.ok ? '✓' : '✗'}</span>
                      <span class="truncate flex-1" title={r.file}>{r.file}</span>
                      <span class="term-dim truncate max-w-[8rem]">{r.ok ? r.slug : r.error}</span>
                    </li>
                  ))}
                </ul>
              )}
              {hasErr && lastErr && (
                <div class="border border-[#ff4d4d] bg-[#1a0000] p-2 text-[11px]">
                  <div class="term-red font-bold">LAST ERROR</div>
                  <div class="term-dim">file: <span class="term-amber">{lastErr.file}</span></div>
                  <div class="term-red break-words">{lastErr.error}</div>
                </div>
              )}
              <a href="/admin/blogs/bulk" class="term-cyan hover:term-amber text-[10px] no-underline">→ open bulk page</a>
            </div>
          )}
        </div>
        );
      })()}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Admin Terminal — DevUtsav',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
};
