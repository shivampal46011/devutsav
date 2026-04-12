import slugify from './slugify.js';

/**
 * Parse optional YAML-like frontmatter at the start of a Markdown file:
 * ---
 * title: "..."
 * description: "..."
 * keywords: "..."
 * url: "/path/to/slug"
 * ---
 *
 * Returns body text (without the frontmatter block) and a flat meta object (lowercase keys).
 */
export function parseMarkdownFrontmatter(source) {
  if (!source || typeof source !== 'string') {
    return { body: source || '', meta: {} };
  }

  const m = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)([\s\S]*)$/);
  if (!m) {
    return { body: source, meta: {} };
  }

  const yamlBlock = m[1];
  const body = (m[2] ?? '').replace(/^\r?\n/, '');
  const meta = parseSimpleYamlBlock(yamlBlock);
  return { body, meta };
}

function parseSimpleYamlBlock(block) {
  const meta = {};
  const lines = block.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim().toLowerCase();
    let val = trimmed.slice(colon + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) meta[key] = val;
  }
  return meta;
}

/**
 * Last path segment of a URL or path, then slugified (blog slug).
 * e.g. "/maa-baglamukhi/10-mahavidyas" -> "10-mahavidyas"
 */
export function slugFromBlogUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return '';
  const t = urlStr.trim();
  if (!t) return '';
  try {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) {
      const u = new URL(t);
      const parts = u.pathname.split('/').filter(Boolean);
      if (!parts.length) return '';
      return slugify(parts[parts.length - 1]);
    }
  } catch {
    /* ignore */
  }
  const path = t.startsWith('/') ? t : `/${t}`;
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) return '';
  return slugify(parts[parts.length - 1]);
}

/**
 * Apply frontmatter fields to a Blog mongoose document (only sets when value present).
 */
export function applyFrontmatterToBlog(blog, meta) {
  if (!meta || typeof meta !== 'object') return;

  if (meta.title) {
    const t = String(meta.title).trim();
    if (t) {
      blog.title = t;
      blog.seo_title = t;
    }
  }

  if (meta.description) {
    const d = String(meta.description).trim();
    if (d) {
      blog.excerpt = d;
      blog.seo_description = d;
    }
  }

  if (meta.keywords) {
    const k = String(meta.keywords).trim();
    if (k) blog.seo_keywords = k;
  }

  if (meta.url) {
    const s = slugFromBlogUrl(meta.url);
    if (s) blog.slug = s;
  }
}
