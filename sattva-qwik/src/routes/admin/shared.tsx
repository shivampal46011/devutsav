import { createContextId } from '@builder.io/qwik';

export interface Pulse {
  now: string;
  realtime: {
    live_5m: number; pv_1h: number; pv_24h: number; pv_7d: number;
    unique_24h: number; unique_7d: number; sessions_total: number;
  };
  pages: { path: string; views: number; sessions: number; avg_scroll: number | null; avg_time_ms: number | null }[];
  blogs: { slug: string; views: number; sessions: number; avg_scroll: number; avg_time: number }[];
  scheduler: {
    job: string; label: string; cron: string; next_run_at: string | null;
    last_run_at: string | null; last_status: string | null; last_duration_ms: number | null;
    last_error: string | null; runs_7d: number; success_7d: number; error_7d: number; avg_ms_7d: number | null;
  }[];
  prompt_schedules: {
    _id: string; cron: string; active: boolean; prompt: string;
    last_run_at: string | null; last_status: string | null; last_error: string | null;
    last_duration_ms: number | null; next_run_at: string | null;
  }[];
  sparkline_24h: { h: string; c: number }[];
  recent_events: {
    type: string; path?: string; section_id?: string; blog_slug?: string;
    duration_ms?: number; scroll_pct?: number; ts: string; meta?: Record<string, unknown>;
  }[];
}

export interface PulseStore {
  pulse: Pulse | null;
  isLoading: boolean;
  errorMsg: string;
  lastFetch: string;
}

export const PulseCtx = createContextId<PulseStore>('du.admin.pulse');

export const TOKEN_KEY = 'du_admin_token';

export const fmtTime = (s: string | null | Date) => {
  if (!s) return '—';
  return new Date(s).toLocaleTimeString('en-GB', { hour12: false });
};
export const fmtDate = (s: string | null | Date) => {
  if (!s) return '—';
  return new Date(s).toLocaleString('en-GB', { hour12: false });
};
export const ms = (n: number | null | undefined) => (n == null ? '—' : `${n}ms`);
export const pct = (n: number | null | undefined) => (n == null ? '—' : `${n}%`);
export const dur = (n: number | null | undefined) => {
  if (n == null) return '—';
  if (n < 1000) return `${n}ms`;
  if (n < 60000) return `${(n / 1000).toFixed(1)}s`;
  return `${(n / 60000).toFixed(1)}m`;
};
export const countdown = (s: string | null) => {
  if (!s) return '—';
  const diff = new Date(s).getTime() - Date.now();
  if (diff <= 0) return 'now';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const sec = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

export const sparkPath = (data: { c: number }[], w = 240, h = 40) => {
  if (!data.length) return '';
  const max = Math.max(...data.map((d) => d.c), 1);
  const stepX = w / Math.max(data.length - 1, 1);
  return data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${(h - (d.c / max) * h).toFixed(1)}`)
    .join(' ');
};
