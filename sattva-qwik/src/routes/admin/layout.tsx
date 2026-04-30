import { $, component$, Slot, useContextProvider, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { getApiBase } from '~/lib/apiBase';
import { fmtDate, PulseCtx, type PulseStore, type Pulse, TOKEN_KEY } from './shared';

const NAV = [
  { href: '/admin', label: 'OVERVIEW' },
  { href: '/admin/pages', label: 'PAGES' },
  { href: '/admin/blogs', label: 'BLOGS' },
  { href: '/admin/scheduler', label: 'SCHEDULER' },
  { href: '/admin/events', label: 'EVENTS' },
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
  const loc = useLocation();

  const store = useStore<PulseStore>({
    pulse: null,
    isLoading: false,
    errorMsg: '',
    lastFetch: '',
  });
  useContextProvider(PulseCtx, store);

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
  useVisibleTask$(({ cleanup }) => {
    let saved = '';
    try { saved = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    if (!saved) {
      promptOpen.value = true;
    } else {
      tokenSig.value = saved;
      fetchPulse();
    }
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
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Admin Terminal — DevUtsav',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
};
