import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <main class="px-4 md:px-0 max-w-5xl mx-auto relative pt-6">
      {/* Hero Section */}
      <section class="px-6 mb-12">
        <div class="relative overflow-hidden rounded-[2.5rem] bg-surface-container-high aspect-[4/5] flex flex-col justify-end">
          <div class="absolute inset-0">
            <img
              alt="Sacred Background"
              class="w-full h-full object-cover"
              width={800}
              height={1000}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6m6CVg0u7pbLG3B1wW4Dm7l9CWT56CWaYpE9aPMNMmGvKlLV_KktgdRX0d4-7xN8CSetlqNez5myg0jSFrCgXFcl0_yaVs_WNysNviVa_qxLtAx8pVR4543-d5hagasUL-4bo2BOtcsTV5HC5KjipbcfksiYi_CAPQWkEan2mrbr54j7LgjdNp6zUso1haxVjABbBv3t4YO6HfJm1yxVuF4mdT9twx5dZ0IRcn4DflGdRlTysm1D-f89bStlRfrMnSJOfBEha_Ajj"
            />
          </div>
        </div>
      </section>

      {/* Quick Tools Bento Grid */}
      <section class="px-6 mb-16">
        <div class="mb-6">
          <h2 class="font-headline text-2xl font-bold text-on-surface">Sacred Tools</h2>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <Link href="/analyzer" class="col-span-2 bg-surface-container-low rounded-3xl p-6 relative overflow-hidden group">
            <div class="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
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
          <Link href="/horoscope" class="bg-surface-container-highest rounded-3xl p-5 aspect-square flex flex-col justify-between">
            <span class="material-symbols-outlined text-secondary text-3xl" style="font-variation-settings: 'FILL' 1">auto_awesome</span>
            <h3 class="font-headline text-base font-bold text-on-surface">Daily Horoscope</h3>
          </Link>
          <Link href="/whisper" class="bg-tertiary-fixed rounded-3xl p-5 aspect-square flex flex-col justify-between">
            <span class="material-symbols-outlined text-on-tertiary-fixed text-3xl" style="font-variation-settings: 'FILL' 1">record_voice_over</span>
            <h3 class="font-headline text-base font-bold text-on-surface">Nandi Whisper</h3>
          </Link>
          <Link href="/blog" class="col-span-2 bg-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden group mt-2">
            <div class="relative z-10 flex items-center justify-between">
              <div>
                <h3 class="font-headline text-xl font-bold text-primary mb-1">Knowledge Hub</h3>
                <p class="text-sm text-on-surface-variant leading-relaxed">Spiritual wisdom &amp; sacred item guides</p>
              </div>
              <span class="material-symbols-outlined text-primary text-4xl" style="font-variation-settings: 'FILL' 1">menu_book</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Daily Guidance */}
      <section class="mb-16">
        <div class="px-6 mb-6">
          <h2 class="font-headline text-2xl font-bold text-on-surface">Daily Guidance</h2>
          <p class="text-on-surface-variant font-label text-xs uppercase tracking-widest">Auspicious Insights for Today</p>
        </div>
        <div class="flex overflow-x-auto gap-6 px-6 no-scrollbar snap-x">
          <div class="snap-center min-w-[85%] bg-surface-container rounded-2xl p-8 border border-outline-variant/10">
            <div class="flex items-center gap-3 mb-4">
              <span class="w-8 h-[1px] bg-primary" />
              <span class="text-xs font-bold uppercase tracking-widest text-primary">Today's Tip</span>
            </div>
            <p class="font-headline text-lg italic text-on-surface leading-relaxed">
              "Offer water to the rising sun today to strengthen your inner resolve and clear professional obstacles."
            </p>
          </div>
          <div class="snap-center min-w-[85%] bg-secondary-fixed rounded-2xl p-8 border border-outline-variant/10">
            <div class="flex items-center gap-3 mb-4">
              <span class="w-8 h-[1px] bg-secondary" />
              <span class="text-xs font-bold uppercase tracking-widest text-secondary">Festival</span>
            </div>
            <h3 class="font-headline text-2xl font-bold mb-2">Pradosh Vrat</h3>
            <p class="text-sm text-on-secondary-fixed-variant leading-relaxed">
              A powerful time for seeking Lord Shiva's blessings to dissolve karmic debts.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Devutsav — Your Spiritual Companion',
  meta: [
    {
      name: 'description',
      content: 'Discover sacred tools, daily horoscopes, AI-guided Kundali Dosha analysis, Nandi Whisper, and verified puja listings on Devutsav.',
    },
    { property: 'og:title', content: 'Devutsav — Your Spiritual Companion' },
    { property: 'og:description', content: 'Sacred tools, daily horoscopes, and AI-guided spiritual insights.' },
  ],
};
