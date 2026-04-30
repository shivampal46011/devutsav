import { component$, useContext } from '@builder.io/qwik';
import { countdown, dur, fmtDate, ms, PulseCtx } from '../shared';

export default component$(() => {
  const store = useContext(PulseCtx);
  const p = store.pulse;
  if (!p) return <div class="p-8 term-dim">loading…</div>;

  return (
    <div class="p-3 space-y-6">
      <div>
        <div class="term-amber font-bold tracking-widest mb-2">SCHEDULER HEALTH</div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="term-dim text-[10px] uppercase">
                <th class="text-left py-1">JOB</th>
                <th class="text-left">CRON</th>
                <th class="text-right">NEXT IN</th>
                <th class="text-right">LAST</th>
                <th class="text-right">STATUS</th>
                <th class="text-right">DUR</th>
                <th class="text-right">7D OK/ERR</th>
                <th class="text-right">AVG</th>
              </tr>
            </thead>
            <tbody>
              {p.scheduler.map((s) => (
                <tr key={s.job} class="term-row border-t border-[#111827]">
                  <td class="py-2 term-cyan">{s.label}</td>
                  <td class="term-dim">{s.cron}</td>
                  <td class="text-right tabular-nums term-amber">{countdown(s.next_run_at)}</td>
                  <td class="text-right term-dim">{fmtDate(s.last_run_at)}</td>
                  <td class={`text-right ${s.last_status === 'success' ? 'term-green' : s.last_status === 'error' ? 'term-red' : 'term-dim'}`}>
                    {(s.last_status || '—').toUpperCase()}
                  </td>
                  <td class="text-right tabular-nums">{dur(s.last_duration_ms)}</td>
                  <td class="text-right tabular-nums">
                    <span class="term-green">{s.success_7d}</span>
                    <span class="term-dim">/</span>
                    <span class="term-red">{s.error_7d}</span>
                  </td>
                  <td class="text-right tabular-nums">{ms(s.avg_ms_7d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {p.prompt_schedules.length > 0 && (
        <div>
          <div class="term-amber font-bold tracking-widest mb-2">USER-DEFINED PROMPT SCHEDULES</div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="term-dim text-[10px] uppercase">
                  <th class="text-left py-1">PROMPT</th>
                  <th class="text-left">CRON</th>
                  <th class="text-right">ACTIVE</th>
                  <th class="text-right">NEXT IN</th>
                  <th class="text-right">LAST</th>
                  <th class="text-right">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {p.prompt_schedules.map((s) => (
                  <tr key={s._id} class="term-row border-t border-[#111827]">
                    <td class="py-2 truncate max-w-[260px] term-cyan">{s.prompt}</td>
                    <td class="term-dim">{s.cron}</td>
                    <td class={`text-right ${s.active ? 'term-green' : 'term-dim'}`}>{s.active ? 'YES' : 'NO'}</td>
                    <td class="text-right tabular-nums term-amber">{s.active ? countdown(s.next_run_at) : '—'}</td>
                    <td class="text-right term-dim">{fmtDate(s.last_run_at)}</td>
                    <td class={`text-right ${s.last_status === 'success' ? 'term-green' : s.last_status === 'error' ? 'term-red' : 'term-dim'}`}>
                      {(s.last_status || '—').toUpperCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});
