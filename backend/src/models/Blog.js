import mongoose from 'mongoose';
import { renderBlogMarkdownToHtml } from '../services/mdToBlogHtml.js';
import { applyFrontmatterToBlog, parseMarkdownFrontmatter } from '../utils/mdFrontmatter.js';
import slugify from '../utils/slugify.js';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    content_md: { type: String, required: true },
    content_html: { type: String, default: '' },
    series_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogSeries', default: null },
    excerpt: { type: String, default: '' },
    image: { type: String, default: '' },
    seo_title: { type: String, default: '' },
    seo_description: { type: String, default: '' },
    og_image: { type: String, default: '' },
    seo_keywords: { type: String, default: '' },
    coming_soon: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'DRAFT',
    },
    generated_at: { type: Date, default: Date.now },
    schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PromptSchedule' },
  },
  { timestamps: true }
);

blogSchema.pre('save', async function preBlogSave(next) {
  try {
    if (this.isModified('content_md')) {
      const { body, meta } = parseMarkdownFrontmatter(this.content_md);
      applyFrontmatterToBlog(this, meta);
      this.content_html = await renderBlogMarkdownToHtml(body);
    }

    const hasSlug = this.slug && String(this.slug).trim();
    const BlogModel = this.constructor;

    if (hasSlug && this.isModified('slug')) {
      let desired = slugify(String(this.slug));
      if (!desired && this.title) desired = slugify(this.title);
      if (!desired) desired = 'post';
      let candidate = desired;
      let n = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const existing = await BlogModel.findOne({ slug: candidate, _id: { $ne: this._id } }).lean();
        if (!existing) break;
        candidate = `${desired}-${++n}`;
      }
      this.slug = candidate;
    } else if (!hasSlug) {
      let base = slugify(this.title) || 'post';
      let candidate = base;
      let n = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const existing = await BlogModel.findOne({ slug: candidate, _id: { $ne: this._id } }).lean();
        if (!existing) break;
        candidate = `${base}-${++n}`;
      }
      this.slug = candidate;
    }

    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('Blog', blogSchema);
