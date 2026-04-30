import { component$, useContext } from '@builder.io/qwik';
import { dur, fmtTime, pct, PulseCtx } from '../shared';

export default component$(() => {
  const store = useContext(PulseCtx);
  const p = store.pulse;
  if (!p) return <div class="p-8 term-dim">loading…</div>;

  return (
    <div class="p-3">
      <div class="term-amber font-bold tracking-widest mb-2">EVENT STREAM // LAST 50</div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="term-dim text-[10px] uppercase">
              <th class="text-left py-1 w-20">TIME</th>
              <th class="text-left w-32">TYPE</th>
              <th class="text-left">PATH / SECTION</th>
              <th class="text-right w-24">SCROLL</th>
              <th class="text-right w-24">DUR</th>
            </tr>
          </thead>
          <tbody>
            {p.recent_events.length === 0 && <tr><td colSpan={5} class="term-dim py-4">no events yet</td></tr>}
            {p.recent_events.map((e, i) => (
              <tr key={i} class="term-row border-t border-[#111827]">
                <td class="py-1.5 term-dim tabular-nums">{fmtTime(e.ts)}</td>
                <td class={`${e.type === 'error' ? 'term-red' : e.type.startsWith('section') ? 'term-green' : 'term-cyan'}`}>{e.type}</td>
                <td class="truncate max-w-[420px]">
                  <span class="term-amber">{e.path || ''}</span>
                  {e.section_id && <span class="term-dim"> · {e.section_id}</span>}
                  {e.blog_slug && <span class="term-dim"> · {e.blog_slug}</span>}
                </td>
                <td class="text-right tabular-nums">{pct(e.scroll_pct)}</td>
                <td class="text-right tabular-nums">{dur(e.duration_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
