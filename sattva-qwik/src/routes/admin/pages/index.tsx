import { component$, useContext } from '@builder.io/qwik';
import { dur, pct, PulseCtx } from '../shared';

export default component$(() => {
  const store = useContext(PulseCtx);
  const p = store.pulse;
  if (!p) return <div class="p-8 term-dim">loading…</div>;

  return (
    <div class="p-3">
      <div class="term-amber font-bold tracking-widest mb-2">TOP PAGES // 24H</div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="term-dim text-[10px] uppercase">
              <th class="text-left py-1">PATH</th>
              <th class="text-right">VIEWS</th>
              <th class="text-right">UNIQUE</th>
              <th class="text-right">AVG SCROLL</th>
              <th class="text-right">AVG TIME</th>
            </tr>
          </thead>
          <tbody>
            {p.pages.length === 0 && <tr><td colSpan={5} class="term-dim py-4">no data yet — waiting for traffic</td></tr>}
            {p.pages.map((row) => (
              <tr key={row.path} class="term-row border-t border-[#111827]">
                <td class="py-2 term-cyan">{row.path}</td>
                <td class="text-right tabular-nums term-amber">{row.views}</td>
                <td class="text-right tabular-nums">{row.sessions}</td>
                <td class="text-right tabular-nums">{pct(row.avg_scroll)}</td>
                <td class="text-right tabular-nums">{dur(row.avg_time_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
