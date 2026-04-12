import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { getApiBase } from '../../../lib/apiBase';

export default component$(() => {
  const blogs = useSignal<Record<string, unknown>[]>([]);

  const fetchBlogs = $(async () => {
    const api = getApiBase();
    try {
      const res = await fetch(`${api}/api/admin/blogs`);
      blogs.value = await res.json();
    } catch (e) {
      console.error(e);
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    await fetchBlogs();
  });

  return (
    <main class="px-4 md:px-8 max-w-5xl mx-auto pt-6 pb-28 md:pb-16">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="font-headline text-2xl md:text-3xl font-bold text-primary">All blogs</h1>
          <p class="text-sm text-on-surface-variant mt-1">Publish, unpublish, or permanently delete.</p>
        </div>
        <div class="flex gap-2">
          <a
            href="/admin/new-post"
            class="text-sm font-bold px-4 py-2 rounded-xl bg-primary text-on-primary inline-flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-lg">add</span>
            New post
          </a>
          <button type="button" onClick$={() => fetchBlogs()} class="text-primary font-bold text-sm px-4 py-2 rounded-xl border border-outline-variant/30">
            Refresh
          </button>
        </div>
      </div>

      <section class="space-y-6">
        {blogs.value.length === 0 ? (
          <p class="text-sm text-on-surface-variant italic text-center py-12 bg-surface-container rounded-3xl border border-outline-variant/10">
            No blogs yet.{' '}
            <a href="/admin/new-post" class="text-primary font-bold">
              Create one
            </a>
            .
          </p>
        ) : (
          blogs.value.map((blog: any) => (
            <article key={blog._id} class="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm">
              <div class="bg-inverse-surface text-inverse-on-surface p-4 flex flex-wrap justify-between gap-2">
                <div>
                  <h2 class="font-bold text-lg">{blog.title}</h2>
                  <p class="text-xs opacity-80 mt-1">
                    /blog/{blog.slug}
                    {blog.series_id?.name && ` · ${blog.series_id.name}`}
                  </p>
                </div>
                <span
                  class={`px-2 py-1 rounded text-xs font-bold shrink-0 h-fit ${blog.status === 'PUBLISHED' ? 'bg-secondary text-white' : 'bg-surface text-on-surface'}`}
                >
                  {blog.status}
                </span>
              </div>
              <pre class="p-4 text-xs text-on-surface-variant whitespace-pre-wrap break-words max-h-40 overflow-y-auto border-t border-outline-variant/10">
                {String(blog.content_md || '').slice(0, 800)}
                {(blog.content_md?.length || 0) > 800 ? '…' : ''}
              </pre>
              <div class="border-t border-outline-variant/10 p-4 bg-surface-container-low flex flex-wrap justify-end gap-2">
                {blog.status === 'DRAFT' ? (
                  <button
                    type="button"
                    class="bg-secondary text-white px-4 py-2 font-bold rounded-lg text-sm"
                    onClick$={async () => {
                      const api = getApiBase();
                      await fetch(`${api}/api/admin/blogs/${blog._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'PUBLISHED' }),
                      });
                      await fetchBlogs();
                    }}
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    type="button"
                    class="text-sm font-bold px-4 py-2 rounded-lg border border-outline-variant/30"
                    onClick$={async () => {
                      const api = getApiBase();
                      await fetch(`${api}/api/admin/blogs/${blog._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'DRAFT' }),
                      });
                      await fetchBlogs();
                    }}
                  >
                    Unpublish
                  </button>
                )}
                <button
                  type="button"
                  class="text-sm font-bold px-4 py-2 rounded-lg bg-error-container text-on-error-container border border-error/25"
                  onClick$={async () => {
                    if (!confirm(`Permanently delete “${blog.title}”? This cannot be undone.`)) return;
                    const api = getApiBase();
                    const res = await fetch(`${api}/api/admin/blogs/${blog._id}`, { method: 'DELETE' });
                    if (res.ok) await fetchBlogs();
                    else {
                      const err = await res.json().catch(() => ({}));
                      alert((err as { error?: string }).error || 'Delete failed');
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'All blogs — Admin',
};
