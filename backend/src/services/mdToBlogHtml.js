import { mdToHtml } from '../utils/markdown.js';
import { parseMarkdownFrontmatter } from '../utils/mdFrontmatter.js';
import { hasBedrockCredentials, invokeClaudeText } from './bedrockService.js';

/** Claude 3 Haiku on Bedrock: output max_tokens must be below 4096 (API rejects 8192). */
const HAIKU_MAX_OUTPUT_TOKENS = 4095;
const DEFAULT_BLOG_HTML_MAX_TOKENS = 3500;

/**
 * Convert Markdown to publication-ready HTML.
 * Uses Bedrock (Claude InvokeModel) when credentials exist; otherwise marked().
 * Set BLOG_HTML_ENGINE=markdown (or marked, md) to force classic Markdown parsing only (no LLM).
 */

function useMarkdownEngineOnly() {
  const v = (process.env.BLOG_HTML_ENGINE || '').trim().toLowerCase();
  return v === 'marked' || v === 'markdown' || v === 'md';
}

function stripCodeFences(text) {
  if (!text) return '';
  let s = text.trim();
  const fenced = s.match(/^```(?:html)?\s*([\s\S]*?)```\s*$/i);
  if (fenced) return fenced[1].trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:html)?\s*/i, '');
    s = s.replace(/```\s*$/i, '');
  }
  return s.trim();
}

export async function renderBlogMarkdownToHtml(markdown) {
  if (!markdown || typeof markdown !== 'string') return '';
  const { body } = parseMarkdownFrontmatter(markdown);
  const md = body.trim();
  if (!md) return '';

  if (useMarkdownEngineOnly()) {
    return mdToHtml(md);
  }

  if (!hasBedrockCredentials()) {
    if (process.env.BLOG_HTML_DEBUG === '1') {
      console.warn('[mdToBlogHtml] No AWS keys; using marked');
    }
    return mdToHtml(md);
  }

  const instruction = `You are generating the **body of a published article page** for DevUtsav (spiritual / wellness). The site wraps your HTML in Tailwind Typography (\`prose\`): your job is to make the page feel **beautiful, calm, and editorial**—not a bland dump of tags.

Visual & rhythm (critical):
- Think like a magazine or premium blog: clear **sections**, breathing room, and hierarchy. Group related ideas inside <section> (you may add a short descriptive aria-label on sections if helpful).
- Open with a **strong lead**: the first <p> after the opening heading should feel inviting (1–3 sentences), not a stub.
- Break long Markdown paragraphs into **shorter <p> blocks** where it improves scannability; vary rhythm (mix short and medium paragraphs).
- Use <h2> for major parts of the article and <h3> for sub-parts. Never use <h1>. Do not skip heading levels.
- Use <blockquote> for mantras, scripture, memorable lines, or “words of guidance”—not for every paragraph.
- Use <ol> for ordered steps (rituals, practices); use <ul> for benefits, lists, or collections. Nest lists only when the source clearly nests.
- Use <strong> for terms or emphasis that should pop; use <em> sparingly for gentle emphasis.
- Use <hr> **sparingly** (at most a few times) only between large thematic shifts.
- If the source implies an image, use <figure> with <img src="..." alt="descriptive alt"> and optional <figcaption>. Preserve real URLs from the Markdown; do not invent image URLs.
- Optional: <aside> for a short “In this section” or practical tip—keep it brief.

Technical rules:
- Output ONLY an HTML fragment (no <!DOCTYPE>, <html>, <head>, or <body>). You may wrap everything in a single <article> root if you want cleaner structure.
- Do **not** add arbitrary CSS \`class\` or \`style\` attributes unless the Markdown already contained them and they are safe (no url(javascript:), no expression). Prefer semantic tags; the theme styles prose automatically.
- Preserve meaning and intent; you may tighten unclear phrasing lightly.
- Do not output Markdown. Do not wrap the result in \`\`\` code fences.
- No <script>, no on* event handlers, no javascript: URLs.

The following is Markdown **body only** (YAML frontmatter was already removed). Delimiters must not appear in your output.

<<<MD>>>
${md}
<<<END_MD>>>

Respond with the HTML fragment only.`;

  try {
    const requested = Number(process.env.BLOG_HTML_MAX_TOKENS);
    const maxTokens = Math.min(
      HAIKU_MAX_OUTPUT_TOKENS,
      Math.max(256, Number.isFinite(requested) && requested > 0 ? requested : DEFAULT_BLOG_HTML_MAX_TOKENS)
    );
    const raw = await invokeClaudeText(instruction, {
      maxTokens,
      temperature: Number(process.env.BLOG_HTML_TEMPERATURE) || 0.2,
    });
    const html = stripCodeFences(raw);
    if (!html || html.length < 3) {
      throw new Error('Sanitized HTML empty');
    }
    if (process.env.BLOG_HTML_DEBUG === '1') {
      console.info('[mdToBlogHtml] Bedrock OK, html length', html.length);
    }
    return html;
  } catch (err) {
    const code = err.name || err.Code || err.code || '?';
    console.warn('[mdToBlogHtml] Bedrock failed, using marked:', code, err.message || err);
    return mdToHtml(md);
  }
}
