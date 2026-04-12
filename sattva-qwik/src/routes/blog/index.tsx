import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import { getApiBase } from '~/lib/apiBase';
import { blogPosts as legacyBlogPosts } from '~/data/blogPosts';
import BlogPostCard from '~/components/BlogPostCard';

export const useBlogLanding = routeLoader$(async () => {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/api/blogs/hub`);
    if (!res.ok) return { apiOk: false, featuredLegacy: legacyBlogPosts };
    const data = (await res.json()) as {
      series: { posts?: { slug: string }[] }[];
      ungrouped: { slug: string }[];
    };
    const slugs = new Set<string>();
    for (const s of data.series || []) {
      for (const p of s.posts || []) {
        if (p.slug) slugs.add(p.slug);
      }
    }
    for (const p of data.ungrouped || []) {
      if (p.slug) slugs.add(p.slug);
    }
    const featuredLegacy = legacyBlogPosts.filter((p) => !slugs.has(p.slug));
    return { apiOk: true, featuredLegacy };
  } catch {
    return { apiOk: false, featuredLegacy: legacyBlogPosts };
  }
});

export default component$(() => {
  const landing = useBlogLanding();

  return (
    <main class="px-4 md:px-0 max-w-5xl mx-auto relative pt-6 min-h-screen pb-24">
      <section class="px-6 mb-12">
        <div class="relative overflow-hidden rounded-[2.5rem] bg-surface-container-high aspect-[4/1] min-h-[200px] flex flex-col justify-center p-8">
          <div class="absolute inset-0">
            <div class="absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-90" />
          </div>
          <div class="relative z-10 space-y-4">
            <h1 class="font-headline text-4xl font-bold tracking-tight text-white leading-[1.1]">DevUtsav Knowledge Hub</h1>
            <p class="text-white/80 max-w-2xl font-body text-lg">
              Browse topics by category or see every article in one place—with pagination for easy scanning.
            </p>
          </div>
        </div>
      </section>

      {!landing.value.apiOk && (
        <p class="px-6 text-sm text-on-surface-variant mb-8">
          Could not reach the article API. Start the backend and set{' '}
          <code class="text-xs bg-surface-container-high px-1 rounded">PUBLIC_API_URL</code> for live categories and lists.
        </p>
      )}

      <section class="px-6 mb-14">
        <h2 class="font-headline text-xl font-bold text-on-surface mb-4">Explore</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <Link
            href="/blog/categories"
            class="flex gap-4 p-6 rounded-3xl bg-surface-container border border-outline-variant/20 hover:border-primary/40 hover:shadow-md transition-all no-underline text-inherit"
          >
            <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
              <span class="material-symbols-outlined text-3xl">folder_special</span>
            </span>
            <div>
              <h3 class="font-headline font-bold text-lg text-on-surface">Categories</h3>
              <p class="text-sm text-on-surface-variant mt-1">Series and topics—jump into a theme.</p>
              <span class="inline-flex items-center gap-1 text-primary text-xs font-bold mt-3">
                Open
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </Link>
          <Link
            href="/blog/articles"
            class="flex gap-4 p-6 rounded-3xl bg-surface-container border border-outline-variant/20 hover:border-primary/40 hover:shadow-md transition-all no-underline text-inherit"
          >
            <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
              <span class="material-symbols-outlined text-3xl">library_books</span>
            </span>
            <div>
              <h3 class="font-headline font-bold text-lg text-on-surface">All articles</h3>
              <p class="text-sm text-on-surface-variant mt-1">Full library, newest first—with pages.</p>
              <span class="inline-flex items-center gap-1 text-primary text-xs font-bold mt-3">
                Open
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {landing.value.featuredLegacy.length > 0 && (
        <section class="px-6 mb-16">
          <h2 class="font-headline text-2xl md:text-3xl font-bold text-on-surface mb-6">Featured guides</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landing.value.featuredLegacy.map((post) => (
              <BlogPostCard
                key={post.id}
                post={{ slug: post.slug, title: post.title, excerpt: post.excerpt }}
                categoryLabel={post.category}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Knowledge Hub — DevUtsav',
  meta: [
    {
      name: 'description',
      content: 'Spiritual guides and articles from DevUtsav—browse by category or read the full list.',
    },
  ],
};
