import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const pujas = useSignal<any[]>([]);
  const isLoading = useSignal(true);
  const activeTab = useSignal('Pujas');

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const apiBase = import.meta.env.PUBLIC_API_URL || 'http://localhost:5001';
      const [pujaRes, chadhawaRes] = await Promise.all([
        fetch(`${apiBase}/api/market/pujas`),
        fetch(`${apiBase}/api/market/chadhawas`),
      ]);
      const pujaData = await pujaRes.json();
      const chadhawaData = await chadhawaRes.json();
      const pList = pujaData?.results?.data || pujaData?.results || pujaData || [];
      pujas.value = Array.isArray(pList) ? pList : [];
    } catch (err) {
      console.error('Failed to load market data:', err);
    } finally {
      isLoading.value = false;
    }
  });

  return (
    <>
      <main class="px-4 md:px-0 max-w-5xl mx-auto relative pt-8 pb-32 min-h-screen bg-[#FDF9F5]">
        <section class="px-4 md:px-6 mb-8 text-center bg-gradient-to-b from-primary/10 to-transparent pt-12 pb-8 rounded-3xl mx-2 shadow-inner border border-primary/10">
          <h1 class="font-headline text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-tight mb-4">
            DevPunya <br /><span class="text-primary italic font-serif tracking-normal">Marketplace</span>
          </h1>
          <p class="text-on-surface-variant font-medium max-w-lg mx-auto mb-8">
            Discover verified Pujas and Chadhawa offerings performed by renowned Pandas across India's most prominent temples.
          </p>
          <div class="flex justify-center">
            <div class="bg-surface-container-highest p-1.5 rounded-full inline-flex shadow-inner">
              {(['Pujas'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick$={() => (activeTab.value = tab)}
                  class={`px-8 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${activeTab.value === tab ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section class="px-4 md:px-6">
          {isLoading.value ? (
            <div class="flex flex-col items-center py-20">
              <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p class="text-sm font-bold text-primary animate-pulse tracking-widest uppercase">Fetching Live Listings...</p>
            </div>
          ) : (
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pujas.value.length === 0 && (
                <div class="col-span-full py-16 text-center text-on-surface-variant bg-surface-container rounded-3xl border border-dashed border-outline-variant/50">
                  <span class="material-symbols-outlined text-5xl mb-3 opacity-50">search_off</span>
                  <p class="font-bold">No Pujas found at this moment.</p>
                </div>
              )}
              {pujas.value.map((item: any) => {
                const id = item.id;
                const title = item.name || 'Sacred Ritual';
                const image = item.images?.[0] || item.png_default_image || item.image_url || 'https://images.unsplash.com/photo-1604068545831-7e8717a03009?auto=format&fit=crop&q=80&w=800';
                let price = item.price || null;
                if (item.packages && Array.isArray(item.packages) && item.packages.length > 0) {
                  price = Math.min(...item.packages.map((p: any) => p.price));
                }
                const mandirName = item.mandir_name;
                const fullLocation = [mandirName, item.location].filter(Boolean).join(', ') || 'Remote / Online';
                const isVip = !!item.vip;
                const benefits = item.benefits ? item.benefits.split(',').map((b: string) => b.trim()).filter(Boolean) : [];
                const startingAtDate = item.startingAt
                  ? new Date(item.startingAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : null;

                return (
                  <div
                    key={id}
                    class="bg-white rounded-2xl overflow-hidden shadow-lg shadow-primary/5 flex flex-col border border-outline-variant/20 hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer group"
                    onClick$={() => window.open(`https://devpunya.com/pooja/v2/${id}?utm_content=devutsav&affiliate_id=34180`, '_blank')}
                  >
                    <div class="h-56 relative bg-white flex items-center justify-center p-2 border-b border-outline-variant/20">
                      <img alt={title} class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl" src={image} />
                      <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm border border-primary/10">Live Puja</div>
                      {isVip && (
                        <div class="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md flex items-center gap-1">
                          <span class="material-symbols-outlined text-[12px]">workspace_premium</span>VIP
                        </div>
                      )}
                    </div>
                    <div class="p-5 flex flex-col flex-1 gap-2">
                      <h3 class="font-headline text-lg font-bold text-on-surface leading-snug">{title}</h3>
                      {item.tithi && <div class="inline-block bg-primary/5 border border-primary/20 px-2 py-0.5 rounded text-[11px] uppercase font-bold tracking-wider text-primary self-start">{item.tithi}</div>}
                      {startingAtDate && (
                        <div class="flex items-center gap-1.5 text-on-surface-variant mt-1">
                          <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                          <span class="text-xs font-bold">{startingAtDate}</span>
                        </div>
                      )}
                      <div class="flex items-start gap-1.5 text-on-surface-variant">
                        <span class="material-symbols-outlined text-[16px] mt-0.5">location_on</span>
                        <span class="text-xs font-semibold leading-relaxed">{fullLocation}</span>
                      </div>
                      {benefits.length > 0 && (
                        <div class="mt-2 text-xs text-on-surface-variant leading-relaxed">
                          <span class="font-bold text-on-surface">Benefits: </span>
                          <ul class="list-disc list-inside mt-1 space-y-0.5">
                            {benefits.slice(0, 3).map((b: string, idx: number) => <li key={idx} class="line-clamp-1">{b}</li>)}
                          </ul>
                        </div>
                      )}
                      <div class="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/30">
                        <div>
                          <span class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-0.5">Packages From</span>
                          {price ? <span class="font-black text-[17px] text-primary">₹{price}</span> : <span class="font-bold text-sm text-primary">Explore Options</span>}
                        </div>
                        <button class="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-xl text-sm font-bold shadow-sm">View Details</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
});

export const head: DocumentHead = {
  title: 'DevPunya Marketplace — Devutsav',
  meta: [
    { name: 'description', content: 'Book verified Pujas and Chadhawa offerings at India\'s most prominent temples via DevPunya. Performed by renowned Pandas.' },
    { property: 'og:title', content: 'DevPunya Marketplace — Sacred Pujas & Chadhawas' },
  ],
};
