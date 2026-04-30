import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';
import TrackedSection from '~/components/TrackedSection';
import DailyGuidanceCard from '~/components/DailyGuidanceCard';
// @ts-ignore - JS data module
import { blogPosts } from '~/data/blogPosts';

type BlogPost = { id: string; slug: string; title: string; excerpt: string; category: string };

export default component$(() => {
  const dailyReads = (blogPosts as BlogPost[]).slice(0, 3);

  return (
    <main class="px-3 md:px-0 max-w-5xl mx-auto relative pt-4 md:pt-6">
      {/* Daily Reads */}
      <TrackedSection id="home_daily_reads" class="px-3 md:px-6 mb-10 md:mb-12 block">
        <div class="flex items-end justify-between mb-4">
          <div>
            <h2 class="font-headline text-2xl font-bold text-on-surface">Today's Reads</h2>
            <p class="text-on-surface-variant font-label text-xs uppercase tracking-widest">Most-loved spiritual guides</p>
          </div>
          <Link href="/blog" class="text-primary text-xs font-bold uppercase tracking-widest no-underline">All</Link>
        </div>
        <div class="flex overflow-x-auto gap-3 md:gap-4 no-scrollbar snap-x -mx-3 md:-mx-6 px-3 md:px-6 pb-2">
          {dailyReads.map((post: BlogPost) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              class="snap-start shrink-0 w-[82%] sm:w-[55%] md:w-[40%] bg-surface-container rounded-2xl md:rounded-3xl p-4 md:p-5 border border-outline-variant/10 hover:border-primary/40 transition-colors no-underline text-inherit flex flex-col gap-3"
            >
              <span class="self-start text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">{post.category}</span>
              <h3 class="font-headline text-lg font-bold text-on-surface leading-snug line-clamp-3">{post.title}</h3>
              <p class="text-sm text-on-surface-variant leading-relaxed line-clamp-2">{post.excerpt}</p>
              <span class="mt-auto inline-flex items-center gap-1 text-primary text-xs font-bold pt-2">
                Read
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </TrackedSection>

      {/* Quick Tools Bento Grid */}
      <TrackedSection id="home_sacred_tools" class="px-3 md:px-6 mb-12 md:mb-16 block">
        <div class="mb-5">
          <h2 class="font-headline text-2xl font-bold text-on-surface">Sacred Tools</h2>
        </div>
        <div class="grid grid-cols-2 gap-3 md:gap-4">
          <Link href="/analyzer" class="col-span-2 bg-surface-container-low rounded-2xl md:rounded-3xl p-5 md:p-6 relative overflow-hidden group">
            <div class="relative z-10 flex flex-col h-full justify-between min-h-[140px] md:min-h-[160px]">
              <span class="material-symbols-outlined text-primary text-4xl mb-4" style="font-variation-settings: 'FILL' 1">psychology_alt</span>
              <div>
                <h3 class="font-headline text-xl font-bold text-on-surface mb-1">Kundali Dosha Calculator</h3>
                <p class="text-sm text-on-surface-variant leading-relaxed">Divine mapping of your current life challenges.</p>
              </div>
            </div>
            <div class="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span class="material-symbols-outlined text-[120px]">storm</span>
            </div>
          </Link>
          <Link href="/horoscope" class="bg-surface-container-highest rounded-2xl md:rounded-3xl p-4 md:p-5 aspect-square flex flex-col justify-between">
            <span class="material-symbols-outlined text-secondary text-3xl" style="font-variation-settings: 'FILL' 1">auto_awesome</span>
            <h3 class="font-headline text-base font-bold text-on-surface">Daily Horoscope</h3>
          </Link>
          <Link href="/whisper" class="bg-tertiary-fixed rounded-2xl md:rounded-3xl p-4 md:p-5 aspect-square flex flex-col justify-between">
            <span class="material-symbols-outlined text-on-tertiary-fixed text-3xl" style="font-variation-settings: 'FILL' 1">record_voice_over</span>
            <h3 class="font-headline text-base font-bold text-on-surface">Nandi Whisper</h3>
          </Link>
          <Link href="/blog" class="col-span-2 bg-primary/5 border border-primary/20 rounded-2xl md:rounded-3xl p-5 md:p-6 relative overflow-hidden group mt-1">
            <div class="relative z-10 flex items-center justify-between">
              <div>
                <h3 class="font-headline text-xl font-bold text-primary mb-1">Knowledge Hub</h3>
                <p class="text-sm text-on-surface-variant leading-relaxed">Spiritual wisdom &amp; sacred item guides</p>
              </div>
              <span class="material-symbols-outlined text-primary text-4xl" style="font-variation-settings: 'FILL' 1">menu_book</span>
            </div>
          </Link>
        </div>
      </TrackedSection>

      {/* Daily Guidance */}
      <TrackedSection id="home_daily_guidance" class="mb-12 md:mb-16 block">
        <div class="px-3 md:px-6 mb-5">
          <h2 class="font-headline text-2xl font-bold text-on-surface">Daily Guidance</h2>
          <p class="text-on-surface-variant font-label text-xs uppercase tracking-widest">Auspicious Insights for Today</p>
        </div>
        <div class="px-3 md:px-6">
          <DailyGuidanceCard />
        </div>
      </TrackedSection>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Devutsav — Sacred Tools, Horoscopes & Spiritual Guidance',
  meta: [
    {
      name: 'description',
      content: 'AI Kundali Dosha analysis, daily horoscopes for all 12 zodiac signs, Nandi Whisper ritual, verified pujas & chadhawa offerings, and curated Hindu spiritual guides — all on Devutsav.',
    },
    { name: 'keywords', content: 'kundali dosha, horoscope, nandi whisper, puja booking, chadhawa, spiritual guidance, vedic astrology, hindu rituals' },
    { property: 'og:title', content: 'Devutsav — Sacred Tools, Horoscopes & Spiritual Guidance' },
    { property: 'og:description', content: 'AI Kundali Dosha analysis, daily horoscopes, verified pujas & chadhawa, and a Hindu spiritual knowledge hub.' },
  ],
};
