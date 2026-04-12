import express from 'express';
import Blog from '../models/Blog.js';
import BlogSeries from '../models/BlogSeries.js';
import PromptSchedule from '../models/PromptSchedule.js';
import generateBlogContent from '../services/blogGenerator.js';
import { renderBlogMarkdownToHtml } from '../services/mdToBlogHtml.js';
import { parseMarkdownFrontmatter } from '../utils/mdFrontmatter.js';
import slugify from '../utils/slugify.js';

const router = express.Router();

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

export default router;
