/**
 * Lightweight first-party analytics beacon.
 *
 * - Generates / persists a session id in localStorage.
 * - Queues events and flushes via navigator.sendBeacon on visibility hide / unload.
 * - Auto page_view on mount + page_leave with scroll depth + time on page.
 * - Section view + engagement via IntersectionObserver helper.
 * - All ingestion: POST /api/tracking/events
 */

import { getApiBase } from './apiBase';
import { logFirebaseEvent, setFirebaseUserId } from './firebase';

type EvtType =
  | 'page_view' | 'page_leave' | 'section_view' | 'section_engaged' | 'section_click'
  | 'click' | 'touch' | 'scroll_depth' | 'blog_view' | 'error';

interface TrackEvent {
  type: EvtType;
  path?: string;
  section_id?: string;
  blog_slug?: string;
  value?: number;
  duration_ms?: number;
  scroll_pct?: number;
  meta?: Record<string, unknown>;
  ts?: number;
}

const SESSION_KEY = 'du_session_id';
const QUEUE: TrackEvent[] = [];
let lastPath: string | null = null;
let pageEnteredAt = 0;
let maxScrollPct = 0;
let initialised = false;

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'du_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

function endpoint(): string {
  return `${getApiBase()}/api/tracking/events`;
}

function flushSync(): void {
  if (!QUEUE.length) return;
  const payload = JSON.stringify({ session_id: getSessionId(), events: QUEUE.splice(0, QUEUE.length) });
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'text/plain' });
      navigator.sendBeacon(endpoint(), blob);
      return;
    }
  } catch {}
  fetch(endpoint(), { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => { flushTimer = null; flushSync(); }, 2000);
}

function forwardToVendors(type: EvtType, evt: TrackEvent): void {
  const w = window as any;
  if (typeof w.gtag === 'function') {
    if (type === 'page_view') {
      w.gtag('event', 'page_view', { page_path: evt.path, page_location: location.href });
    } else {
      w.gtag('event', type, {
        page_path: evt.path,
        section_id: evt.section_id,
        blog_slug: evt.blog_slug,
        scroll_pct: evt.scroll_pct,
        duration_ms: evt.duration_ms,
      });
    }
  }
  // Firebase Analytics (GA4) — sanitize undefined values
  const fbParams: Record<string, unknown> = {};
  for (const [k, v] of Object.entries({
    page_path: evt.path,
    page_location: typeof location !== 'undefined' ? location.href : undefined,
    section_id: evt.section_id,
    blog_slug: evt.blog_slug,
    scroll_pct: evt.scroll_pct,
    duration_ms: evt.duration_ms,
    value: evt.value,
  })) {
    if (v !== undefined && v !== null) fbParams[k] = v;
  }
  logFirebaseEvent(type === 'page_view' ? 'page_view' : type, fbParams);

  if (typeof w.fbq === 'function') {
    if (type === 'page_view') w.fbq('track', 'PageView');
    else w.fbq('trackCustom', type, {
      path: evt.path,
      section_id: evt.section_id,
      blog_slug: evt.blog_slug,
      scroll_pct: evt.scroll_pct,
    });
  }
}

function isAdminPath(p?: string): boolean {
  const path = p ?? (typeof location !== 'undefined' ? location.pathname : '');
  return path.startsWith('/admin');
}

export function track(type: EvtType, props: Partial<TrackEvent> = {}): void {
  if (typeof window === 'undefined') return;
  if (isAdminPath(props.path)) return;
  const evt: TrackEvent = {
    type,
    path: props.path ?? location.pathname,
    ts: Date.now(),
    ...props,
  };
  // attach session id to each event so backend can dedupe/group
  (evt as TrackEvent & { session_id: string }).session_id = getSessionId();
  QUEUE.push(evt);
  forwardToVendors(type, evt);
  if (QUEUE.length >= 20) flushSync();
  else scheduleFlush();
}

function getScrollPct(): number {
  const doc = document.documentElement;
  const scroll = window.scrollY || doc.scrollTop;
  const viewport = window.innerHeight || doc.clientHeight;
  const full = doc.scrollHeight - viewport;
  if (full <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((scroll / full) * 100)));
}

function emitPageLeave(): void {
  if (!lastPath) return;
  const dur = Date.now() - pageEnteredAt;
  track('page_leave', { path: lastPath, duration_ms: dur, scroll_pct: maxScrollPct });
}

export function trackPageView(path: string, extra: Partial<TrackEvent> = {}): void {
  if (typeof window === 'undefined') return;
  if (lastPath && lastPath !== path) emitPageLeave();
  if (isAdminPath(path)) {
    lastPath = null;
    return;
  }
  lastPath = path;
  pageEnteredAt = Date.now();
  maxScrollPct = 0;
  track('page_view', { path, ...extra });
  if (path.startsWith('/blog/') && path !== '/blog' && !path.startsWith('/blog/categories') && !path.startsWith('/blog/articles')) {
    const slug = path.replace(/^\/blog\//, '').replace(/\/$/, '');
    track('blog_view', { path, blog_slug: slug });
  }
}

/**
 * Initialise global listeners. Idempotent. Call once from layout.
 */
export function initTracker(): void {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;

  // Tie our session to Firebase so user-scoped reports line up.
  setFirebaseUserId(getSessionId());

  // First view (also on full reload).
  trackPageView(location.pathname);

  // SPA navigations — Qwik City fires popstate; we also patch pushState/replaceState.
  const wrap = (key: 'pushState' | 'replaceState') => {
    const orig = history[key];
    history[key] = function (...args: Parameters<typeof orig>) {
      const ret = orig.apply(this, args);
      queueMicrotask(() => trackPageView(location.pathname));
      return ret;
    };
  };
  wrap('pushState');
  wrap('replaceState');
  window.addEventListener('popstate', () => trackPageView(location.pathname));

  // Scroll depth.
  let scrollRaf = 0;
  window.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const pct = getScrollPct();
      if (pct > maxScrollPct) {
        maxScrollPct = pct;
        if (pct === 25 || pct === 50 || pct === 75 || pct === 100) {
          track('scroll_depth', { scroll_pct: pct });
        }
      }
    });
  }, { passive: true });

  // Click — capture interactive targets (link/button/[data-track]).
  window.addEventListener('click', (e) => {
    const t = e.target as HTMLElement | null;
    if (!t) return;
    const el = t.closest('a, button, [data-track]') as HTMLElement | null;
    if (!el) return;
    const meta: Record<string, unknown> = {
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || '').trim().slice(0, 80),
    };
    if (el instanceof HTMLAnchorElement && el.href) meta.href = el.href;
    const id = el.getAttribute('data-track') || el.id || undefined;
    track('click', { section_id: id, meta });
  }, { capture: true });

  // Touch — sample one event per gesture.
  window.addEventListener('touchstart', () => {
    track('touch', { meta: { x: 0, y: 0 } });
  }, { passive: true, capture: false });

  // Flush on hide / unload.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      emitPageLeave();
      flushSync();
    }
  });
  window.addEventListener('pagehide', () => { emitPageLeave(); flushSync(); });

  // Error capture.
  window.addEventListener('error', (e) => {
    track('error', { meta: { msg: String(e.message).slice(0, 200), src: e.filename } });
  });
}

/**
 * Observe a section element for impression + engagement (>= 2s in view, >= 50% visible).
 */
export function observeSection(el: Element, sectionId: string): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return () => {};
  let viewedAt = 0;
  let engagedFired = false;
  let impressionFired = false;
  let engagementTimer: ReturnType<typeof setTimeout> | null = null;

  const obs = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        if (!impressionFired) {
          impressionFired = true;
          track('section_view', { section_id: sectionId });
        }
        viewedAt = Date.now();
        if (!engagedFired && !engagementTimer) {
          engagementTimer = setTimeout(() => {
            engagedFired = true;
            track('section_engaged', { section_id: sectionId, duration_ms: Date.now() - viewedAt });
          }, 2000);
        }
      } else {
        if (engagementTimer) { clearTimeout(engagementTimer); engagementTimer = null; }
      }
    }
  }, { threshold: [0, 0.5, 1] });

  obs.observe(el);
  return () => { obs.disconnect(); if (engagementTimer) clearTimeout(engagementTimer); };
}
