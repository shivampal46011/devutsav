import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { getApiBase } from '../../../lib/apiBase';

export default component$(() => {
  const blogSeries = useSignal<Record<string, unknown>[]>([]);
  const seriesName = useSignal('');
  const seriesSlug = useSignal('');
  const seriesDescription = useSignal('');
  const seriesComingSoon = useSignal(false);

  const fetchSeries = $(async () => {
    const api = getApiBase();
    try {
      const res = await fetch(`${api}/api/admin/blog-series`);
      blogSeries.value = await res.json();
    } catch (e) {
      console.error(e);
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    await fetchSeries();
  });

  return (
    <main class="px-4 md:px-8 max-w-5xl mx-auto pt-6 pb-28 md:pb-16">
      <h1 class="font-headline text-2xl md:text-3xl font-bold text-primary mb-2">Categories</h1>
      <p class="text-sm text-on-surface-variant mb-8">Series group posts on the public blog hub. Deleting a category unlinks its posts (it does not delete the posts).</p>

      <section class="mb-10 bg-surface-container rounded-3xl p-5 shadow-sm border border-outline-variant/10">
        <form
          preventdefault:submit
          onSubmit$={async () => {
            if (!seriesName.value.trim()) return;
            const api = getApiBase();
            const res = await fetch(`${api}/api/admin/blog-series`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: seriesName.value.trim(),
                slug: seriesSlug.value.trim() || undefined,
                description: seriesDescription.value,
                coming_soon: seriesComingSoon.value,
              }),
            });
            if (res.ok) {
              seriesName.value = '';
              seriesSlug.value = '';
              seriesDescription.value = '';
              seriesComingSoon.value = false;
              await fetchSeries();
              alert('Category created.');
            } else {
              const err = await res.json().catch(() => ({}));
              alert((err as { error?: string }).error || 'Failed');
            }
          }}
          class="space-y-3 bg-surface-container-high rounded-2xl p-4 border-2 border-primary/30"
        >
          <input
            class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm outline-none focus:border-primary"
            placeholder="Name (e.g. Maa Baglamukhi)"
            value={seriesName.value}
            onInput$={(e) => (seriesName.value = (e.target as HTMLInputElement).value)}
            required
          />
          <input
            class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm outline-none focus:border-primary"
            placeholder="Slug (optional)"
            value={seriesSlug.value}
            onInput$={(e) => (seriesSlug.value = (e.target as HTMLInputElement).value)}
          />
          <textarea
            class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm outline-none focus:border-primary"
            rows={2}
            placeholder="Short description for the hub"
            value={seriesDescription.value}
            onInput$={(e) => (seriesDescription.value = (e.target as HTMLTextAreaElement).value)}
          />
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={seriesComingSoon.value}
              onChange$={(e) => (seriesComingSoon.value = (e.target as HTMLInputElement).checked)}
            />
            Entire category coming soon
          </label>
          <button type="submit" class="w-full bg-primary text-on-primary font-bold py-3 rounded-xl text-sm">
            Create category
          </button>
        </form>

        <div class="mt-6">
          <h2 class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Your categories</h2>
          <ul class="space-y-2">
            {blogSeries.value.length === 0 ? (
              <li class="text-sm text-on-surface-variant italic">None yet.</li>
            ) : (
              blogSeries.value.map((s: any) => (
                <li
                  key={s._id}
                  class="flex flex-wrap items-center justify-between gap-2 bg-surface-container-low rounded-xl px-3 py-2 border border-outline-variant/15 text-sm"
                >
                  <span>
                    {s.name} <span class="text-on-surface-variant">({s.slug})</span>
                    {s.coming_soon && <span class="ml-2 text-[10px] uppercase font-bold text-amber-800">soon</span>}
                  </span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="text-xs font-bold px-2 py-1 rounded-lg bg-surface-container-high border border-outline-variant/30"
                      onClick$={async () => {
                        const api = getApiBase();
                        await fetch(`${api}/api/admin/blog-series/${s._id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ coming_soon: !s.coming_soon }),
                        });
                        await fetchSeries();
                      }}
                    >
                      Toggle teaser
                    </button>
                    <button
                      type="button"
                      class="text-xs font-bold px-2 py-1 rounded-lg bg-error-container text-on-error-container border border-error/20"
                      onClick$={async () => {
                        if (!confirm(`Delete category “${s.name}”? Posts stay; they are just unlinked.`)) return;
                        const api = getApiBase();
                        const res = await fetch(`${api}/api/admin/blog-series/${s._id}`, { method: 'DELETE' });
                        if (res.ok) await fetchSeries();
                        else {
                          const err = await res.json().catch(() => ({}));
                          alert((err as { error?: string }).error || 'Delete failed');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Categories — Admin',
};
