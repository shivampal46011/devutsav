import { type RequestHandler } from '@builder.io/qwik-city';
// @ts-ignore - JS data module
import { blogPosts } from '~/data/blogPosts';
import { getApiBase } from '~/lib/apiBase';

const SITE = 'https://devutsav.com';

type ApiBlog = { slug?: string; status?: string; updated_at?: string; updatedAt?: string };

async function fetchDynamicSlugs(): Promise<{ slug: string; lastmod?: string }[]> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/blogs/posts`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    const list: ApiBlog[] = Array.isArray(data) ? data : Array.isArray(data?.posts) ? data.posts : [];
    return list
      .filter((b) => b?.slug && (b.status === 'PUBLISHED' || !b.status))
      .map((b) => {
        const raw = b.updated_at || b.updatedAt;
        const lastmod = raw ? new Date(raw).toISOString().split('T')[0] : undefined;
        return { slug: b.slug as string, lastmod };
      });
  } catch {
    return [];
  }
}

const STATIC_ROUTES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/blog', priority: '0.9', changefreq: 'daily' },
  { loc: '/blog/categories', priority: '0.7', changefreq: 'weekly' },
  { loc: '/blog/articles', priority: '0.7', changefreq: 'daily' },
  { loc: '/horoscope', priority: '0.9', changefreq: 'daily' },
  { loc: '/analyzer', priority: '0.8', changefreq: 'monthly' },
  { loc: '/whisper', priority: '0.8', changefreq: 'monthly' },
  { loc: '/puja', priority: '0.8', changefreq: 'weekly' },
  { loc: '/chadhawa', priority: '0.8', changefreq: 'weekly' },
  { loc: '/ritual-guide', priority: '0.7', changefreq: 'monthly' },
];

export const onGet: RequestHandler = async ({ send }) => {
  const today = new Date().toISOString().split('T')[0];

  const slugMap = new Map<string, { lastmod: string }>();
  for (const p of blogPosts as { slug: string }[]) {
    if (p?.slug) slugMap.set(p.slug, { lastmod: today });
  }
  const dynamic = await fetchDynamicSlugs();
  for (const d of dynamic) {
    slugMap.set(d.slug, { lastmod: d.lastmod || today });
  }

  const urls = [
    ...STATIC_ROUTES.map((r) => ({ ...r, lastmod: today })),
    ...[...slugMap.entries()].map(([slug, meta]) => ({
      loc: `/blog/${slug}`,
      lastmod: meta.lastmod,
      changefreq: 'weekly',
      priority: '0.6',
    })),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${SITE}${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  send(
    new Response(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    })
  );
};
