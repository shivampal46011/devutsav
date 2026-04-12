import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import { getApiBase } from '~/lib/apiBase';
import BlogPostCard from '~/components/BlogPostCard';

const PAGE_SIZE = 12;

type ListPost = {
  slug: string;
  title: string;
  excerpt?: string;
  coming_soon?: boolean;
  series_name?: string | null;
};

export const useArticlesPage = routeLoader$(async ({ url }) => {
  const base = getApiBase();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const series = (url.searchParams.get('series') || '').trim();

  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(PAGE_SIZE));
  if (series) qs.set('series_slug', series);

  try {
    const res = await fetch(`${base}/api/blogs/posts?${qs.toString()}`);
    if (!res.ok) {
      return {
        apiOk: false,
        posts: [] as ListPost[],
        total: 0,
        page: 1,
        totalPages: 0,
        series,
        seriesTitle: null as string | null,
      };
    }
    const data = (await res.json()) as {
      posts: ListPost[];
      total: number;
      page: number;
      totalPages: number;
    };

    let seriesTitle: string | null = null;
    if (series) {
      const sRes = await fetch(`${base}/api/blogs/series`);
      if (sRes.ok) {
        const sData = (await sRes.json()) as { series: { slug: string; name: string }[] };
        const found = sData.series?.find((x) => x.slug === series);
        seriesTitle = found?.name || null;
      }
    }

    return {
      apiOk: true,
      posts: data.posts || [],
      total: data.total ?? 0,
      page: data.page ?? page,
      totalPages: data.totalPages ?? 0,
      series,
      seriesTitle,
    };
  } catch {
    return {
      apiOk: false,
      posts: [] as ListPost[],
      total: 0,
      page: 1,
      totalPages: 0,
      series,
      seriesTitle: null as string | null,
    };
  }
});

export default component$(() => {
  const state = useArticlesPage();
  const s = state.value;
  const buildHref = (p: number) => {
    const qs = new URLSearchParams();
    if (p > 1) qs.set('page', String(p));
    if (s.series) qs.set('series', s.series);
    const q = qs.toString();
    return q ? `/blog/articles?${q}` : '/blog/articles';
  };

  return (
    <main class="px-4 md:px-0 max-w-5xl mx-auto relative pt-6 min-h-screen pb-24">
      <div class="px-6 mb-8">
        <Link href="/blog" class="inline-flex items-center text-primary text-sm font-bold uppercase tracking-widest hover:underline mb-6">
          <span class="material-symbols-outlined text-sm mr-2">arrow_back</span>
          Knowledge hub
        </Link>
        <h1 class="font-headline text-3xl md:text-4xl font-bold text-on-surface">
          {s.series ? s.seriesTitle || 'Articles' : 'All articles'}
        </h1>
        <p class="text-on-surface-variant mt-2">
          {s.series ? (
            <>
              Filtered by category ·{' '}
              <Link href="/blog/articles" class="text-primary font-bold underline">
                Clear filter
              </Link>
            </>
          ) : (
            <>Newest first · {s.total} article{s.total === 1 ? '' : 's'}</>
          )}
        </p>
        {s.series ? (
          <p class="text-sm text-on-surface-variant mt-1">
            <Link href="/blog/categories" class="text-primary font-bold">
              Categories
            </Link>
          </p>
        ) : null}
      </div>

      {!s.apiOk && (
        <p class="px-6 text-sm text-on-surface-variant mb-6">Could not load articles. Check the API connection.</p>
      )}

      {s.apiOk && s.posts.length === 0 && (
        <p class="px-6 text-on-surface-variant">No articles found{s.series ? ' in this category' : ''}.</p>
      )}

      <div class="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {s.posts.map((post) => (
          <BlogPostCard
            key={post.slug}
            post={post}
            categoryLabel={post.series_name || 'Article'}
            seriesComingSoon={false}
          />
        ))}
      </div>

      {s.apiOk && s.totalPages > 1 && (
        <nav class="px-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
          {s.page > 1 ? (
            <Link
              href={buildHref(s.page - 1)}
              class="px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-bold text-primary hover:bg-surface-container-high no-underline"
            >
              Previous
            </Link>
          ) : (
            <span class="px-4 py-2 rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant opacity-50">Previous</span>
          )}
          <span class="text-sm text-on-surface-variant px-2">
            Page {s.page} of {s.totalPages}
          </span>
          {s.page < s.totalPages ? (
            <Link
              href={buildHref(s.page + 1)}
              class="px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-bold text-primary hover:bg-surface-container-high no-underline"
            >
              Next
            </Link>
          ) : (
            <span class="px-4 py-2 rounded-xl border border-outline-variant/10 text-sm text-on-surface-variant opacity-50">Next</span>
          )}
        </nav>
      )}
    </main>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const v = resolveValue(useArticlesPage);
  const title = v.series
    ? `${v.seriesTitle || 'Articles'} — Knowledge Hub | DevUtsav`
    : 'All articles — Knowledge Hub | DevUtsav';
  return {
    title,
    meta: [
      {
        name: 'description',
        content: v.series
          ? `Articles in ${v.seriesTitle || v.series} on DevUtsav.`
          : 'Browse all articles from the DevUtsav Knowledge Hub.',
      },
    ],
  };
};
