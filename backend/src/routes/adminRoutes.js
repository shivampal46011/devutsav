import express from 'express';
import Blog from '../models/Blog.js';
import BlogSeries from '../models/BlogSeries.js';
import PromptSchedule from '../models/PromptSchedule.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import ScheduleRun from '../models/ScheduleRun.js';
import UserSession from '../models/UserSession.js';
import generateBlogContent from '../services/blogGenerator.js';
import { renderBlogMarkdownToHtml } from '../services/mdToBlogHtml.js';
import { parseMarkdownFrontmatter } from '../utils/mdFrontmatter.js';
import { nextCronRun } from '../utils/cronNext.js';
import slugify from '../utils/slugify.js';

const router = express.Router();

// Bearer auth gate for /metrics/* — token from .env. If unset, route is open
// in dev to avoid lockout (warn loudly).
function requireAdminToken(req, res, next) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ error: 'ADMIN_API_TOKEN not configured' });
    }
    return next();
  }
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : (req.query.token || '');
  if (token !== expected) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// --- Blog series (e.g. Baglamukhi) ---

router.get('/blog-series', async (req, res) => {
  try {
    const list = await BlogSeries.find().sort({ sort_order: 1, name: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/blog-series', async (req, res) => {
  try {
    const { name, slug, description, sort_order, coming_soon } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const sSlug = slug && String(slug).trim() ? slugify(slug) : slugify(name);
    const doc = new BlogSeries({
      name: String(name).trim(),
      slug: sSlug,
      description: description ?? '',
      sort_order: Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0,
      coming_soon: Boolean(coming_soon),
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Series slug already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/blog-series/:id', async (req, res) => {
  try {
    const series = await BlogSeries.findById(req.params.id);
    if (!series) return res.status(404).json({ error: 'Not found' });
    await Blog.updateMany({ series_id: series._id }, { $set: { series_id: null } });
    await BlogSeries.deleteOne({ _id: series._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/blog-series/:id', async (req, res) => {
  try {
    const series = await BlogSeries.findById(req.params.id);
    if (!series) return res.status(404).json({ error: 'Not found' });
    const { name, slug, description, sort_order, coming_soon } = req.body;
    if (name != null) series.name = String(name).trim();
    if (slug != null && String(slug).trim()) series.slug = slugify(slug);
    if (description != null) series.description = description;
    if (sort_order != null && Number.isFinite(Number(sort_order))) series.sort_order = Number(sort_order);
    if (coming_soon != null) series.coming_soon = Boolean(coming_soon);
    await series.save();
    res.json(series);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Series slug already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- Blogs ---

router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().populate('series_id').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** LLM (or marked fallback): Markdown → HTML fragment for preview or external use. */
router.post('/blogs/process-md', async (req, res) => {
  try {
    const { content_md } = req.body;
    if (content_md == null || typeof content_md !== 'string') {
      return res.status(400).json({ error: 'content_md (string) is required' });
    }
    const content_html = await renderBlogMarkdownToHtml(content_md);
    res.json({ content_html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Create an editorial / manual blog from Markdown (HTML is derived on save). */
router.post('/blogs', async (req, res) => {
  try {
    const {
      title,
      content_md,
      slug,
      series_id,
      excerpt,
      image,
      seo_title,
      seo_description,
      og_image,
      coming_soon,
      status,
    } = req.body;

    if (content_md == null || !String(content_md).trim()) {
      return res.status(400).json({ error: 'content_md is required' });
    }

    const rawMd = String(content_md);
    const { meta } = parseMarkdownFrontmatter(rawMd);
    const resolvedTitle =
      (title && String(title).trim()) || (meta.title && String(meta.title).trim()) || '';
    if (!resolvedTitle) {
      return res.status(400).json({
        error: 'title is required (or provide title in Markdown frontmatter)',
      });
    }

    const blog = new Blog({
      title: resolvedTitle,
      content_md: rawMd,
      slug: slug && String(slug).trim() ? slugify(String(slug)) : undefined,
      series_id: series_id || null,
      excerpt: excerpt != null ? String(excerpt) : '',
      image: image != null ? String(image) : '',
      seo_title: seo_title != null ? String(seo_title) : '',
      seo_description: seo_description != null ? String(seo_description) : '',
      og_image: og_image != null ? String(og_image) : '',
      coming_soon: Boolean(coming_soon),
      status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
    });

    await blog.save();
    await blog.populate('series_id');
    res.status(201).json(blog);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Blog slug already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Not found' });

    const b = req.body;
    if (b.title != null) blog.title = String(b.title).trim();
    if (b.content_md != null) blog.content_md = String(b.content_md);
    if (b.slug != null && String(b.slug).trim()) blog.slug = slugify(String(b.slug));
    if (Object.prototype.hasOwnProperty.call(b, 'series_id')) blog.series_id = b.series_id || null;
    if (b.excerpt != null) blog.excerpt = String(b.excerpt);
    if (b.image != null) blog.image = String(b.image);
    if (b.seo_title != null) blog.seo_title = String(b.seo_title);
    if (b.seo_description != null) blog.seo_description = String(b.seo_description);
    if (b.og_image != null) blog.og_image = String(b.og_image);
    if (b.seo_keywords != null) blog.seo_keywords = String(b.seo_keywords);
    if (b.coming_soon != null) blog.coming_soon = Boolean(b.coming_soon);
    if (b.status != null) blog.status = b.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';

    await blog.save();
    await blog.populate('series_id');
    res.json(blog);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Blog slug already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/blogs/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const content = await generateBlogContent(prompt);

    const titleMatch = content.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : 'Generated Blog Post';

    const newBlog = new Blog({
      title,
      content_md: content,
      status: 'DRAFT',
      excerpt: title,
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Schedules ---

router.get('/schedules', async (req, res) => {
  try {
    const schedules = await PromptSchedule.find().sort({ createdAt: -1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/schedules', async (req, res) => {
  try {
    const newSchedule = new PromptSchedule(req.body);
    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/schedules/:id', async (req, res) => {
  try {
    const schedule = await PromptSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/schedules/:id', async (req, res) => {
  try {
    const schedule = await PromptSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Bloomberg-style metrics feed ---

const STATIC_CRONS = [
  { job_name: 'blog_bot_daily', cron_expression: '0 0 * * *', label: 'Auto blog bot' },
  { job_name: 'horoscope_daily', cron_expression: '5 0 * * *', label: 'Horoscope · daily' },
  { job_name: 'horoscope_weekly', cron_expression: '15 0 * * 1', label: 'Horoscope · weekly' },
  { job_name: 'horoscope_monthly', cron_expression: '30 0 1 * *', label: 'Horoscope · monthly' },
  { job_name: 'daily_guidance_tip', cron_expression: '10 0 * * *', label: 'Daily guidance tip' },
];

router.get('/metrics/pulse', requireAdminToken, async (_req, res) => {
  try {
    const now = new Date();
    const t5m = new Date(now.getTime() - 5 * 60_000);
    const t1h = new Date(now.getTime() - 60 * 60_000);
    const t24h = new Date(now.getTime() - 24 * 60 * 60_000);
    const t7d = new Date(now.getTime() - 7 * 24 * 60 * 60_000);

    const [
      live5m, pv24h, pv7d, uniq24h, uniq7d, sessionsTotal,
      topPages24h, topBlogs7d, scrollByPath24h, recent, sched7dRuns,
    ] = await Promise.all([
      AnalyticsEvent.distinct('session_id', { type: 'page_view', ts: { $gte: t5m } }),
      AnalyticsEvent.countDocuments({ type: 'page_view', ts: { $gte: t24h } }),
      AnalyticsEvent.countDocuments({ type: 'page_view', ts: { $gte: t7d } }),
      AnalyticsEvent.distinct('session_id', { type: 'page_view', ts: { $gte: t24h } }),
      AnalyticsEvent.distinct('session_id', { type: 'page_view', ts: { $gte: t7d } }),
      UserSession.countDocuments({}),
      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', ts: { $gte: t24h }, path: { $ne: null } } },
        { $group: { _id: '$path', views: { $sum: 1 }, sessions: { $addToSet: '$session_id' } } },
        { $project: { path: '$_id', _id: 0, views: 1, sessions: { $size: '$sessions' } } },
        { $sort: { views: -1 } }, { $limit: 15 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { type: 'blog_view', ts: { $gte: t7d }, blog_slug: { $ne: null } } },
        { $group: {
            _id: '$blog_slug',
            views: { $sum: 1 },
            avg_scroll: { $avg: '$scroll_pct' },
            avg_time: { $avg: '$duration_ms' },
            sessions: { $addToSet: '$session_id' },
        }},
        { $project: {
            slug: '$_id', _id: 0, views: 1,
            avg_scroll: { $round: ['$avg_scroll', 0] },
            avg_time: { $round: ['$avg_time', 0] },
            sessions: { $size: '$sessions' },
        }},
        { $sort: { views: -1 } }, { $limit: 15 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { type: 'page_leave', ts: { $gte: t24h }, path: { $ne: null }, scroll_pct: { $ne: null } } },
        { $group: { _id: '$path', avg_scroll: { $avg: '$scroll_pct' }, avg_time: { $avg: '$duration_ms' } } },
        { $project: { path: '$_id', _id: 0, avg_scroll: { $round: ['$avg_scroll', 0] }, avg_time: { $round: ['$avg_time', 0] } } },
      ]),
      AnalyticsEvent.find({}).sort({ ts: -1 }).limit(50).lean(),
      ScheduleRun.aggregate([
        { $match: { started_at: { $gte: t7d } } },
        { $group: {
          _id: '$job_name',
          total: { $sum: 1 },
          ok: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          err: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } },
          avg_ms: { $avg: '$duration_ms' },
        }},
      ]),
    ]);

    const scrollMap = new Map(scrollByPath24h.map((r) => [r.path, r]));
    const pages = topPages24h.map((p) => {
      const s = scrollMap.get(p.path);
      return {
        path: p.path,
        views: p.views,
        sessions: p.sessions,
        avg_scroll: s?.avg_scroll ?? null,
        avg_time_ms: s?.avg_time ?? null,
      };
    });

    const runMap = new Map(sched7dRuns.map((r) => [r._id, r]));
    const lastByJob = await ScheduleRun.aggregate([
      { $sort: { started_at: -1 } },
      { $group: { _id: '$job_name', last: { $first: '$$ROOT' } } },
    ]);
    const lastMap = new Map(lastByJob.map((r) => [r._id, r.last]));

    const scheduler = STATIC_CRONS.map((c) => {
      const stats = runMap.get(c.job_name);
      const last = lastMap.get(c.job_name);
      const next = nextCronRun(c.cron_expression);
      return {
        job: c.job_name,
        label: c.label,
        cron: c.cron_expression,
        next_run_at: next,
        last_run_at: last?.started_at || null,
        last_status: last?.status || null,
        last_duration_ms: last?.duration_ms ?? null,
        last_error: last?.error || null,
        runs_7d: stats?.total || 0,
        success_7d: stats?.ok || 0,
        error_7d: stats?.err || 0,
        avg_ms_7d: stats?.avg_ms ? Math.round(stats.avg_ms) : null,
      };
    });

    // Per-blog active runs (manual schedules)
    const promptSchedules = await PromptSchedule.find({}).lean();
    const promptScheduleHealth = promptSchedules.map((s) => ({
      _id: s._id,
      cron: s.cron_expression,
      active: s.is_active,
      prompt: (s.prompt_text || '').slice(0, 80),
      last_run_at: s.last_run_at || null,
      last_status: s.last_status || null,
      last_error: s.last_error || null,
      last_duration_ms: s.last_duration_ms || null,
      next_run_at: s.is_active ? nextCronRun(s.cron_expression || '0 0 * * *') : null,
    }));

    // Hourly sparkline of page views over last 24h
    const sparkline = await AnalyticsEvent.aggregate([
      { $match: { type: 'page_view', ts: { $gte: t24h } } },
      { $group: {
        _id: {
          y: { $year: '$ts' }, m: { $month: '$ts' }, d: { $dayOfMonth: '$ts' }, h: { $hour: '$ts' },
        },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.h': 1 } },
    ]);

    res.json({
      now,
      realtime: {
        live_5m: live5m.length,
        pv_1h: await AnalyticsEvent.countDocuments({ type: 'page_view', ts: { $gte: t1h } }),
        pv_24h: pv24h,
        pv_7d: pv7d,
        unique_24h: uniq24h.length,
        unique_7d: uniq7d.length,
        sessions_total: sessionsTotal,
      },
      pages,
      blogs: topBlogs7d,
      scheduler,
      prompt_schedules: promptScheduleHealth,
      sparkline_24h: sparkline.map((b) => ({
        h: `${b._id.y}-${String(b._id.m).padStart(2, '0')}-${String(b._id.d).padStart(2, '0')}T${String(b._id.h).padStart(2, '0')}`,
        c: b.count,
      })),
      recent_events: recent,
    });
  } catch (err) {
    console.error('metrics/pulse error', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/metrics/recent', requireAdminToken, async (req, res) => {
  try {
    const since = req.query.since ? new Date(Number(req.query.since)) : new Date(Date.now() - 60_000);
    const events = await AnalyticsEvent.find({ ts: { $gt: since } }).sort({ ts: -1 }).limit(200).lean();
    res.json({ events, now: new Date() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
