import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export type BlogCardPost = {
  slug: string;
  title: string;
  excerpt?: string;
  coming_soon?: boolean;
  series_name?: string | null;
};

export default component$(
  (props: {
    post: BlogCardPost;
    categoryLabel: string;
    seriesComingSoon?: boolean;
  }) => {
    const soon = !!props.post.coming_soon || !!props.seriesComingSoon;
    return (
      <Link
        href={`/blog/${props.post.slug}`}
        class={`group bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform hover:shadow-lg hover:shadow-primary/5 flex flex-col ${soon ? 'ring-1 ring-amber-500/25' : ''}`}
      >
        <div class="p-6 flex-1 flex flex-col items-start">
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {props.categoryLabel}
            </span>
            {soon ? (
              <span class="bg-amber-500/95 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Coming soon
              </span>
            ) : null}
          </div>
          <h3 class="font-headline text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {props.post.title}
          </h3>
          <p class="text-on-surface-variant text-sm line-clamp-3 mt-auto">
            {props.post.excerpt || 'Read the full article.'}
          </p>
        </div>
        <div class="bg-surface-container/30 px-6 py-4 flex items-center justify-between border-t border-outline-variant/10 text-primary">
          <span class="text-sm font-bold tracking-wider uppercase">{soon ? 'Preview' : 'Read article'}</span>
          <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-2">arrow_forward</span>
        </div>
      </Link>
    );
  }
);
