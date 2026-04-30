import express from 'express';
import crypto from 'crypto';
import UserSession from '../models/UserSession.js';
import WebsiteClick from '../models/WebsiteClick.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

const router = express.Router();

// sendBeacon submits as text/plain — accept it explicitly here.
router.use(express.text({ type: ['text/plain', 'application/x-www-form-urlencoded'], limit: '256kb' }));

const ALLOWED_TYPES = new Set([
  'page_view', 'page_leave', 'section_view', 'section_engaged', 'section_click',
  'click', 'touch', 'scroll_depth', 'blog_view', 'error',
  'guidance_locked_view', 'guidance_unlock_open', 'guidance_unlock_submit',
  'guidance_unlock_close', 'guidance_unlock_skip_tob', 'guidance_email_subscribe',
]);

function hashIp(ip, salt = 'du') {
  if (!ip) return undefined;
  return crypto.createHash('sha256').update(salt + ip).digest('hex').slice(0, 16);
}

function parseBody(req) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return req.body;
}

/**
 * @desc Bulk-ingest analytics events (page views, sections, clicks, scroll, etc).
 * @route POST /api/tracking/events
 */
router.post('/events', async (req, res) => {
  const body = parseBody(req);
  if (!body) return res.status(204).end();
  const events = Array.isArray(body.events) ? body.events : Array.isArray(body) ? body : [body];
  if (!events.length) return res.status(204).end();

  const ipHash = hashIp(req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip);
  const ua = req.headers['user-agent'];
  const ref = req.headers['referer'];

  const docs = events
    .filter((e) => e && ALLOWED_TYPES.has(e.type))
    .map((e) => ({
      type: e.type,
      session_id: e.session_id ? String(e.session_id).slice(0, 64) : undefined,
      path: e.path ? String(e.path).slice(0, 256) : undefined,
      section_id: e.section_id ? String(e.section_id).slice(0, 64) : undefined,
      blog_slug: e.blog_slug ? String(e.blog_slug).slice(0, 200) : undefined,
      value: typeof e.value === 'number' ? e.value : undefined,
      duration_ms: typeof e.duration_ms === 'number' ? e.duration_ms : undefined,
      scroll_pct: typeof e.scroll_pct === 'number' ? Math.max(0, Math.min(100, e.scroll_pct)) : undefined,
      meta: e.meta && typeof e.meta === 'object' ? e.meta : undefined,
      user_agent: ua,
      referer: ref,
      ip_hash: ipHash,
      ts: e.ts ? new Date(e.ts) : new Date(),
    }));

  if (!docs.length) return res.status(204).end();
  try {
    await AnalyticsEvent.insertMany(docs, { ordered: false });
    res.status(204).end();
  } catch (err) {
    console.error('events ingest error:', err?.message);
    res.status(204).end();
  }
});

/**
 * @desc Create or update a user session
 * @route POST /api/tracking/sessions
 */
router.post('/sessions', async (req, res) => {
  try {
    const { user_session_id, first_landing_url, browser_details, device_details, location } = req.body;

    if (!user_session_id) {
      return res.status(400).json({ error: 'user_session_id is required' });
    }

    let session = await UserSession.findOne({ user_session_id });
    if (session) {
      session.count_of_sessions += 1;
      await session.save();
    } else {
      session = new UserSession({
        user_session_id,
        first_landing_url,
        browser_details,
        device_details,
        location,
        count_of_sessions: 1
      });
      await session.save();
    }
    
    res.status(201).json({ message: 'Session tracked', session });
  } catch (error) {
    console.error('Session tracking error:', error);
    res.status(500).json({ error: 'Server error tracking session' });
  }
});

/**
 * @desc Track a website click or CTA interaction
 * @route POST /api/tracking/click
 */
router.post('/click', async (req, res) => {
  try {
    const { user_session_id, url, cta, deep_link } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    const click = new WebsiteClick({
      user_session_id,
      url,
      cta,
      deep_link
    });

    await click.save();
    res.status(201).json({ message: 'Click tracked', click });
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ error: 'Server error tracking click' });
  }
});

export default router;
