import { component$, useContext } from '@builder.io/qwik';
import { fmtTime, PulseCtx, sparkPath } from './shared';

export default component$(() => {
  const store = useContext(PulseCtx);
  const p = store.pulse;

  if (!p) {
    return (
      <div class="p-8">
        <div class="term-amber mb-2">Waiting for metrics …</div>
        {store.errorMsg && <div class="term-red mb-2">Error: {store.errorMsg}</div>}
        <div class="term-dim text-[11px] leading-relaxed">
          · backend not running — <span class="term-cyan">cd backend &amp;&amp; npm run dev</span><br />
          · token mismatch — LOGOUT and re-enter the value from <span class="term-cyan">backend/.env ADMIN_API_TOKEN</span><br />
          · check the browser network tab if the request is failing
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Ticker tape */}
      <div class="overflow-hidden border-b border-[#1f2937] bg-black">
        <div class="whitespace-nowrap py-1 term-marquee inline-block">
          {[...p.recent_events, ...p.recent_events].slice(0, 80).map((e, i) => (
            <span key={i} class="inline-block px-4 border-r border-[#1f2937]">
              <span class="term-amber">{fmtTime(e.ts)}</span>
              {' '}<span class="term-cyan">{e.type}</span>
              {' '}<span class="term-dim">{e.path || e.blog_slug || e.section_id || ''}</span>
              {e.scroll_pct != null && <span class="term-green"> · {e.scroll_pct}%</span>}
            </span>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div class="grid grid-cols-2 md:grid-cols-7 term-grid">
        {[
          ['LIVE 5M', p.realtime.live_5m, 'term-green'],
          ['PV 1H', p.realtime.pv_1h, 'term-amber'],
          ['PV 24H', p.realtime.pv_24h, 'term-amber'],
          ['PV 7D', p.realtime.pv_7d, 'term-amber'],
          ['UNIQ 24H', p.realtime.unique_24h, 'term-cyan'],
          ['UNIQ 7D', p.realtime.unique_7d, 'term-cyan'],
          ['SESSIONS', p.realtime.sessions_total, 'term-cyan'],
        ].map(([label, val, color]) => (
          <div key={label as string} class="term-cell">
            <div class="term-dim text-[10px] uppercase tracking-widest">{label}</div>
            <div class={`${color} text-2xl font-bold tabular-nums`}>{val}</div>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div class="term-cell border-b border-[#1f2937] flex items-center gap-4">
        <span class="term-dim text-[10px] uppercase tracking-widest">PV · 24H</span>
        <svg width="100%" height="36" viewBox="0 0 240 40" preserveAspectRatio="none" class="flex-1">
          <path d={sparkPath(p.sparkline_24h)} stroke="#ffb000" stroke-width="1.2" fill="none" vector-effect="non-scaling-stroke" />
        </svg>
      </div>

      <div class="p-3 term-dim text-[11px]">
        Drill into <span class="term-cyan">PAGES</span>, <span class="term-cyan">BLOGS</span>, <span class="term-cyan">SCHEDULER</span>, or <span class="term-cyan">EVENTS</span> via the nav above.
      </div>
    </>
  );
});
