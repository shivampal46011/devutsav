import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import { getApiBase } from '~/lib/apiBase';
import { blogPosts } from '~/data/blogPosts';

export type ResolvedBlogPost = {
  source: 'api' | 'legacy';
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  content_html: string;
  coming_soon: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: string;
  ctaText?: string;
  ctaLink?: string;
};

export const usePost = routeLoader$(async ({ params, redirect }) => {
  const raw = params.slug ?? '';
  let slug = String(raw).trim();
  try {
    slug = decodeURIComponent(slug);
  } catch {
    /* keep slug as-is */
  }
  if (!slug) {
    throw redirect(302, '/blog');
  }

  const base = getApiBase();
  let fromApi: ResolvedBlogPost | null = null;

  try {
    const res = await fetch(`${base}/api/blogs/post/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const d = (await res.json()) as {
        slug: string;
        title: string;
        excerpt?: string;
        image?: string;
        coming_soon?: boolean;
        content_html?: string;
        seo_title?: string;
        seo_description?: string;
        seo_keywords?: string;
        og_image?: string;
        series_id?: { name?: string } | null;
      };
      if (d?.slug && d?.title) {
        fromApi = {
          source: 'api',
          slug: d.slug,
          title: d.title,
          excerpt: d.excerpt || '',
          image: d.image || '',
          category: d.series_id?.name || 'Knowledge hub',
          content_html: d.content_html || '',
          coming_soon: !!d.coming_soon,
          seo_title: d.seo_title,
          seo_description: d.seo_description,
          seo_keywords: d.seo_keywords,
          og_image: d.og_image,
        };
      }
    }
  } catch {
    /* network or invalid JSON — use legacy when available */
  }

  if (fromApi) {
    return fromApi;
  }

  const legacy = blogPosts.find((p) => p.slug === slug);
  if (legacy) {
    return {
      source: 'legacy',
      slug: legacy.slug,
      title: legacy.title,
      excerpt: legacy.excerpt,
      image: legacy.image,
      category: legacy.category,
      content_html: legacy.content,
      coming_soon: false,
      seo_title: legacy.title,
      seo_description: legacy.excerpt,
      og_image: legacy.image,
      ctaText: legacy.ctaText,
      ctaLink: legacy.ctaLink,
    } satisfies ResolvedBlogPost;
  }

  throw redirect(302, '/blog');
});

export default component$(() => {
  const post = usePost();
  const p = post.value;
  const showImage = !!p.image;
  const metaTitle = p.seo_title || p.title;
  const metaDesc = p.seo_description || p.excerpt;
  const metaImage = p.og_image || p.image;

  return (
    <article class="px-4 md:px-0 max-w-4xl mx-auto relative pt-6 pb-20">
      <header class="mb-10 px-6 mt-4">
        <Link href="/blog" class="inline-flex items-center text-primary text-sm font-bold uppercase tracking-widest hover:underline mb-8">
          <span class="material-symbols-outlined text-sm mr-2">arrow_back</span>
          Back to hub
        </Link>
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <span class="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{p.category}</span>
          {p.coming_soon ? (
            <span class="bg-amber-500/15 text-amber-900 dark:text-amber-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/30">
              Coming soon
            </span>
          ) : null}
          <span class="text-on-surface-variant text-sm font-label">Spiritual read</span>
        </div>
        <h1 class="font-headline text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-6">{p.title}</h1>
        <p class="text-on-surface-variant text-lg md:text-xl font-body leading-relaxed max-w-2xl mb-8">{p.excerpt}</p>

        {showImage ? (
          <div class="w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl shadow-surface-container-high relative">
            <img src={p.image} alt="" class="w-full h-full object-cover" />
            <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ) : null}
      </header>

      <div class="px-6 relative">
        {p.coming_soon ? (
          <div class="mb-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-5 text-on-surface">
            <p class="font-headline font-bold text-lg mb-1">Full article coming soon</p>
            <p class="text-sm text-on-surface-variant">We are preparing this piece. Explore other articles in the Knowledge Hub.</p>
          </div>
        ) : null}

        {!p.coming_soon && p.content_html ? (
          <div
            class="prose prose-lg md:prose-xl max-w-none prose-headings:font-headline prose-headings:font-bold prose-headings:text-on-surface prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-8 prose-h3:mb-3 prose-p:text-on-surface-variant prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-on-surface-variant prose-strong:text-on-surface prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl prose-blockquote:text-on-surface prose-hr:border-outline-variant/30 prose-hr:my-10 prose-img:rounded-2xl prose-figure:my-8 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-on-surface-variant prose-aside:border prose-aside:border-outline-variant/25 prose-aside:bg-surface-container-low prose-aside:rounded-2xl prose-aside:px-5 prose-aside:py-4 prose-aside:text-sm"
            dangerouslySetInnerHTML={p.content_html}
          />
        ) : null}

        {!p.coming_soon && p.ctaLink && p.ctaText ? (
          <div class="mt-16 bg-surface-container-lowest border border-primary/20 rounded-3xl p-8 md:p-12 text-center shadow-lg shadow-primary/5">
            <h2 class="font-headline text-2xl md:text-3xl font-bold text-on-surface mb-4">Take the next step</h2>
            <p class="text-on-surface-variant mb-8 max-w-xl mx-auto">
              Experience the transformative power firsthand—whether you seek divine support or sacred protection for your path.
            </p>
            {p.ctaLink.startsWith('http') ? (
              <a
                href={p.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
              >
                {p.ctaText}
                <span class="material-symbols-outlined text-lg">open_in_new</span>
              </a>
            ) : (
              <Link
                href={p.ctaLink}
                class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
              >
                {p.ctaText}
                <span class="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const p = resolveValue(usePost);
  const title = `${p.seo_title || p.title} | DevUtsav`;
  const desc = p.seo_description || p.excerpt || '';
  const img = p.og_image || p.image || '';
  const keywords = p.seo_keywords?.trim();
  return {
    title,
    meta: [
      { name: 'description', content: desc },
      ...(keywords ? [{ name: 'keywords', content: keywords }] : []),
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:type', content: 'article' },
      ...(img ? [{ property: 'og:image', content: img }] : []),
    ],
  };
};
