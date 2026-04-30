import { type RequestHandler } from '@builder.io/qwik-city';
// @ts-ignore - JS data module
import { blogPosts } from '~/data/blogPosts';

const SITE = 'https://devutsav.com';

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

export const onGet: RequestHandler = ({ send }) => {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    ...STATIC_ROUTES.map((r) => ({ ...r, lastmod: today })),
    ...(blogPosts as { slug: string }[]).map((p) => ({
      loc: `/blog/${p.slug}`,
      lastmod: today,
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
