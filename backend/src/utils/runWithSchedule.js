import ScheduleRun from '../models/ScheduleRun.js';

// Wraps a cron job so each invocation is recorded as a ScheduleRun.
// Returns a function suitable for cron.schedule(...).
export function runWithSchedule(jobName, cronExpression, fn) {
  return async () => {
    const run = await ScheduleRun.create({
      job_name: jobName,
      cron_expression: cronExpression,
      started_at: new Date(),
      status: 'running',
    });
    const t0 = Date.now();
    try {
      const result = await fn();
      const items = typeof result === 'number' ? result : 0;
      run.status = 'success';
      run.items_processed = items;
      run.ended_at = new Date();
      run.duration_ms = Date.now() - t0;
      await run.save();
    } catch (err) {
      run.status = 'error';
      run.error = String(err?.message || err);
      run.ended_at = new Date();
      run.duration_ms = Date.now() - t0;
      await run.save();
    }
  };
}
