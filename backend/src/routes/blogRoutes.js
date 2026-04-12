import express from 'express';
import Blog from '../models/Blog.js';
import BlogSeries from '../models/BlogSeries.js';

const router = express.Router();

function toPublicListPost(doc) {
  const s = doc.series_id;
  return {
    _id: doc._id,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    image: doc.image,
    coming_soon: doc.coming_soon,
    seo_title: doc.seo_title,
    seo_description: doc.seo_description,
    seo_keywords: doc.seo_keywords,
    og_image: doc.og_image,
    series_slug: s && typeof s === 'object' && s.slug ? s.slug : null,
    series_name: s && typeof s === 'object' && s.name ? s.name : null,
    updatedAt: doc.updatedAt,
    createdAt: doc.createdAt,
  };
}

/** Series list with published post counts (for categories page; no post bodies). */
router.get('/series', async (req, res) => {
  try {
    const seriesList = await BlogSeries.find().sort({ sort_order: 1, name: 1 }).lean();
    const counts = await Blog.aggregate([
      { $match: { status: 'PUBLISHED', series_id: { $ne: null } } },
      { $group: { _id: '$series_id', count: { $sum: 1 } } },
    ]);
    const countById = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    const series = seriesList.map((s) => ({
      _id: s._id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      coming_soon: s.coming_soon,
      post_count: countById[String(s._id)] || 0,
    }));
    const ungrouped_count = await Blog.countDocuments({ status: 'PUBLISHED', series_id: null });
    res.json({ series, ungrouped_count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Paginated published posts (optional filter by series slug). */
router.get('/posts', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '12'), 10) || 12));
    const seriesSlug = req.query.series_slug || req.query.series;

    const filter = { status: 'PUBLISHED' };
    if (seriesSlug && String(seriesSlug).trim()) {
      const s = await BlogSeries.findOne({ slug: String(seriesSlug).trim() }).lean();
      if (!s) {
        return res.json({ posts: [], total: 0, page, limit, totalPages: 0 });
      }
      filter.series_id = s._id;
    }

    const total = await Blog.countDocuments(filter);
    const skip = (page - 1) * limit;
    const raw = await Blog.find(filter)
      .populate('series_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const posts = raw.map(toPublicListPost);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    res.json({ posts, total, page, limit, totalPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Published posts grouped by series for the knowledge hub. */
router.get('/hub', async (req, res) => {
  try {
    const seriesList = await BlogSeries.find().sort({ sort_order: 1, name: 1 }).lean();
    const posts = await Blog.find({ status: 'PUBLISHED' })
      .populate('series_id')
      .sort({ createdAt: -1 })
      .lean();

    const bySeriesId = {};
    for (const s of seriesList) {
      bySeriesId[s._id.toString()] = [];
    }

    const ungrouped = [];
    for (const p of posts) {
      const list = toPublicListPost(p);
      const sid = p.series_id?._id?.toString();
      if (sid && bySeriesId[sid]) {
        bySeriesId[sid].push(list);
      } else {
        ungrouped.push(list);
      }
    }

    const series = seriesList.map((s) => ({
      _id: s._id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      sort_order: s.sort_order,
      coming_soon: s.coming_soon,
      posts: bySeriesId[s._id.toString()] || [],
    }));

    res.json({ series, ungrouped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Single published article by slug (full body unless coming_soon). */
router.get('/post/:slug', async (req, res) => {
  try {
    const p = await Blog.findOne({ slug: req.params.slug, status: 'PUBLISHED' })
      .populate('series_id')
      .lean();
    if (!p) {
      return res.status(404).json({ error: 'Not found' });
    }

    const base = {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      image: p.image,
      coming_soon: p.coming_soon,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      seo_keywords: p.seo_keywords,
      og_image: p.og_image,
      series_id: p.series_id,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    };

    if (p.coming_soon) {
      return res.json({
        ...base,
        content_html: '',
      });
    }

    return res.json({
      ...base,
      content_html: p.content_html || '',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
