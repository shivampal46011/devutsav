import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import { getApiBase } from '~/lib/apiBase';

type SeriesRow = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coming_soon?: boolean;
  post_count: number;
};

export const useCategories = routeLoader$(async () => {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/api/blogs/series`);
    if (!res.ok) return { apiOk: false, series: [] as SeriesRow[], ungrouped_count: 0 };
    const data = (await res.json()) as { series: SeriesRow[]; ungrouped_count: number };
    return {
      apiOk: true,
      series: data.series || [],
      ungrouped_count: data.ungrouped_count ?? 0,
    };
  } catch {
    return { apiOk: false, series: [] as SeriesRow[], ungrouped_count: 0 };
  }
});

export default component$(() => {
  const data = useCategories();

  return (
    <main class="px-4 md:px-0 max-w-5xl mx-auto relative pt-6 min-h-screen pb-24">
      <div class="px-6 mb-8">
        <Link href="/blog" class="inline-flex items-center text-primary text-sm font-bold uppercase tracking-widest hover:underline mb-6">
          <span class="material-symbols-outlined text-sm mr-2">arrow_back</span>
          Knowledge hub
        </Link>
        <h1 class="font-headline text-3xl md:text-4xl font-bold text-on-surface">Categories</h1>
        <p class="text-on-surface-variant mt-2 max-w-2xl">Each topic links to its articles. General posts live under “All articles”.</p>
      </div>

      {!data.value.apiOk && (
        <p class="px-6 text-sm text-on-surface-variant mb-6">Could not load categories. Check the API connection.</p>
      )}

      <ul class="px-6 space-y-4 mb-10">
        {data.value.series.map((s) => (
          <li key={s._id}>
            {s.coming_soon ? (
              <div class="block rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6 opacity-90">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 class="font-headline text-xl font-bold text-on-surface">{s.name}</h2>
                    {s.description ? <p class="text-sm text-on-surface-variant mt-2 max-w-2xl">{s.description}</p> : null}
                  </div>
                  <span class="bg-amber-500/15 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase border border-amber-500/30 shrink-0">
                    Coming soon
                  </span>
                </div>
              </div>
            ) : (
              <Link
                href={`/blog/articles?series=${encodeURIComponent(s.slug)}`}
                class="block rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6 no-underline text-inherit transition-all hover:border-primary/35 hover:shadow-md"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 class="font-headline text-xl font-bold text-on-surface">{s.name}</h2>
                    {s.description ? <p class="text-sm text-on-surface-variant mt-2 max-w-2xl">{s.description}</p> : null}
                    <p class="text-xs text-on-surface-variant mt-3">
                      {s.post_count} article{s.post_count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span class="material-symbols-outlined text-primary text-2xl shrink-0">chevron_right</span>
                </div>
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div class="px-6">
        <Link
          href="/blog/articles"
          class="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-3 text-primary font-bold text-sm hover:bg-primary/10 no-underline"
        >
          <span class="material-symbols-outlined text-lg">library_books</span>
          View all articles
        </Link>
        {data.value.ungrouped_count > 0 ? (
          <p class="text-xs text-on-surface-variant mt-2">Includes posts without a category.</p>
        ) : null}
      </div>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Categories — Knowledge Hub | DevUtsav',
  meta: [{ name: 'description', content: 'Browse article categories and series on DevUtsav.' }],
};
