import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { getApiBase } from '../../../lib/apiBase';

export default component$(() => {
  const blogSeries = useSignal<Record<string, unknown>[]>([]);
  const edTitle = useSignal('');
  const edSlug = useSignal('');
  const edSeriesId = useSignal('');
  const edExcerpt = useSignal('');
  const edImage = useSignal('');
  const edSeoTitle = useSignal('');
  const edSeoDesc = useSignal('');
  const edOgImage = useSignal('');
  const edComingSoon = useSignal(false);
  const edMd = useSignal('');
  const edStatus = useSignal('DRAFT');
  const previewHtml = useSignal('');
  const processMdLoading = useSignal(false);

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
      <h1 class="font-headline text-2xl md:text-3xl font-bold text-primary mb-2">New post</h1>
      <p class="text-sm text-on-surface-variant mb-8">
        Optional YAML at the top of the file sets title, description, keywords, and slug (from <code class="text-xs bg-surface-container-low px-1 rounded">url</code> path). HTML is built on the server (Markdown or Bedrock). Manage posts under{' '}
        <a href="/admin/blogs" class="text-primary font-bold underline">
          All blogs
        </a>
        .
      </p>

      <section class="bg-surface-container rounded-3xl p-5 shadow-sm border border-outline-variant/10">
        <form
          preventdefault:submit
          onSubmit$={async () => {
            const md = edMd.value.trim();
            if (!md) {
              alert('Markdown is required.');
              return;
            }
            const fmHasTitle = /^---[\s\S]*?^title\s*:/m.test(md);
            if (!edTitle.value.trim() && !fmHasTitle) {
              alert('Add a title above, or include title: in YAML frontmatter (--- … ---) at the top of the Markdown.');
              return;
            }
            const api = getApiBase();
            const res = await fetch(`${api}/api/admin/blogs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: edTitle.value.trim() || undefined,
                slug: edSlug.value.trim() || undefined,
                series_id: edSeriesId.value || null,
                excerpt: edExcerpt.value,
                image: edImage.value,
                seo_title: edSeoTitle.value,
                seo_description: edSeoDesc.value,
                og_image: edOgImage.value,
                coming_soon: edComingSoon.value,
                status: edStatus.value,
                content_md: edMd.value,
              }),
            });
            if (res.ok) {
              edTitle.value = '';
              edSlug.value = '';
              edSeriesId.value = '';
              edExcerpt.value = '';
              edImage.value = '';
              edSeoTitle.value = '';
              edSeoDesc.value = '';
              edOgImage.value = '';
              edComingSoon.value = false;
              edMd.value = '';
              edStatus.value = 'DRAFT';
              previewHtml.value = '';
              alert('Blog saved. Open All blogs to publish or delete.');
            } else {
              const err = await res.json().catch(() => ({}));
              alert((err as { error?: string }).error || 'Failed');
            }
          }}
          class="space-y-3 bg-surface-container-high rounded-2xl p-4 border-2 border-secondary/40"
        >
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Category</label>
            <select
              class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm outline-none focus:border-primary"
              value={edSeriesId.value}
              onChange$={(e) => (edSeriesId.value = (e.target as HTMLSelectElement).value)}
            >
              <option value="">— No category —</option>
              {blogSeries.value.map((s: any) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <input
            class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm outline-none focus:border-primary"
            placeholder="Title (optional if YAML frontmatter has title:)"
            value={edTitle.value}
            onInput$={(e) => (edTitle.value = (e.target as HTMLInputElement).value)}
          />
          <label class="flex flex-col items-center justify-center gap-2 w-full cursor-pointer rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 py-6 px-4 transition-colors">
            <span class="material-symbols-outlined text-3xl text-primary">upload_file</span>
            <span class="text-sm font-bold text-primary text-center">Tap to choose .md file</span>
            <input
              type="file"
              accept=".md,.markdown,text/markdown"
              class="sr-only"
              onChange$={async (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (!f) return;
                edMd.value = await f.text();
                (e.target as HTMLInputElement).value = '';
              }}
            />
          </label>
          <input
            class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm outline-none focus:border-primary"
            placeholder="Slug (optional)"
            value={edSlug.value}
            onInput$={(e) => (edSlug.value = (e.target as HTMLInputElement).value)}
          />
          <textarea
            class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm outline-none focus:border-primary"
            rows={2}
            placeholder="Excerpt"
            value={edExcerpt.value}
            onInput$={(e) => (edExcerpt.value = (e.target as HTMLTextAreaElement).value)}
          />
          <textarea
            class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm outline-none focus:border-primary font-mono min-h-[180px]"
            rows={8}
            placeholder={`---\ntitle: "…"\ndescription: "…"\nkeywords: "…"\nurl: "/path/post-slug"\n---\n\n# Your article…`}
            value={edMd.value}
            onInput$={(e) => (edMd.value = (e.target as HTMLTextAreaElement).value)}
            required
          />
          <div class="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={processMdLoading.value || !edMd.value.trim()}
              class="flex-1 bg-surface-container-low border border-primary/40 text-primary font-bold py-2.5 rounded-xl text-sm disabled:opacity-50"
              onClick$={async () => {
                if (!edMd.value.trim()) return;
                processMdLoading.value = true;
                previewHtml.value = '';
                try {
                  const api = getApiBase();
                  const res = await fetch(`${api}/api/admin/blogs/process-md`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content_md: edMd.value }),
                  });
                  const data = (await res.json().catch(() => ({}))) as { content_html?: string; error?: string };
                  if (!res.ok) {
                    alert(data.error || 'Failed to process Markdown');
                    return;
                  }
                  previewHtml.value = data.content_html ?? '';
                } catch (e) {
                  console.error(e);
                  alert('Network error');
                } finally {
                  processMdLoading.value = false;
                }
              }}
            >
              {processMdLoading.value ? 'Rendering…' : 'Preview HTML (same as save)'}
            </button>
          </div>
          {previewHtml.value ? (
            <div class="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4">
              <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Rendered HTML preview</p>
              <div
                class="prose prose-sm max-w-none prose-headings:font-headline text-on-surface"
                dangerouslySetInnerHTML={previewHtml.value}
              />
            </div>
          ) : null}
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={edComingSoon.value}
              onChange$={(e) => (edComingSoon.value = (e.target as HTMLInputElement).checked)}
            />
            Coming soon (teaser only)
          </label>
          <select
            class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm outline-none focus:border-primary"
            value={edStatus.value}
            onChange$={(e) => (edStatus.value = (e.target as HTMLSelectElement).value)}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <button type="submit" class="w-full bg-secondary text-white font-bold py-3 rounded-xl text-sm">
            Save blog post
          </button>
        </form>
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'New post — Admin',
};
