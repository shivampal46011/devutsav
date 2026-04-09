import { component$ } from '@builder.io/qwik';
import { useLocation, Link, type DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import { blogPosts } from '~/data/blogPosts';

export const usePost = routeLoader$(({ params, redirect }) => {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) throw redirect(302, '/blog');
  return post;
});

export default component$(() => {
  const post = usePost();

  return (
    <article class="px-4 md:px-0 max-w-4xl mx-auto relative pt-6 pb-20">
      <header class="mb-10 px-6 mt-4">
        <Link href="/blog" class="inline-flex items-center text-primary text-sm font-bold uppercase tracking-widest hover:underline mb-8">
          <span class="material-symbols-outlined text-sm mr-2">arrow_back</span>
          Back to Hub
        </Link>
        <div class="flex items-center gap-3 mb-6">
          <span class="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{post.value.category}</span>
          <span class="text-on-surface-variant text-sm font-label">5 min read</span>
        </div>
        <h1 class="font-headline text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-6">{post.value.title}</h1>
        <p class="text-on-surface-variant text-lg md:text-xl font-body leading-relaxed max-w-2xl mb-8">{post.value.excerpt}</p>
        <div class="w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl shadow-surface-container-high relative">
          <img src={post.value.image} alt={post.value.title} class="w-full h-full object-cover" />
          <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </header>

      <div class="px-6 relative">
        <div
          class="prose prose-lg md:prose-xl prose-headings:font-headline prose-headings:font-bold prose-headings:text-on-surface prose-p:text-on-surface-variant prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-on-surface-variant prose-strong:text-on-surface max-w-none"
          dangerouslySetInnerHTML={post.value.content}
        />

        <div class="mt-16 bg-surface-container-lowest border border-primary/20 rounded-3xl p-8 md:p-12 text-center shadow-lg shadow-primary/5">
          <h2 class="font-headline text-2xl md:text-3xl font-bold text-on-surface mb-4">Take the Next Step</h2>
          <p class="text-on-surface-variant mb-8 max-w-xl mx-auto">
            Experience the transformative power firsthand. Whether you are looking for divine intervention or sacred objects to protect your aura, we have you covered.
          </p>
          {post.value.ctaLink.startsWith('http') ? (
            <a
              href={post.value.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
            >
              {post.value.ctaText}
              <span class="material-symbols-outlined text-lg">open_in_new</span>
            </a>
          ) : (
            <Link
              href={post.value.ctaLink}
              class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
            >
              {post.value.ctaText}
              <span class="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const post = resolveValue(usePost);
  return {
    title: `${post.title} | Devutsav`,
    meta: [
      { name: 'description', content: post.excerpt },
      { property: 'og:title', content: post.title },
      { property: 'og:description', content: post.excerpt },
      { property: 'og:image', content: post.image },
    ],
  };
};
