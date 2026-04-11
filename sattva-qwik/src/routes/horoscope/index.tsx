import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

const ZODIAC_SIGNS = [
  { name: 'Aries', emoji: '♈️' }, { name: 'Taurus', emoji: '♉️' }, { name: 'Gemini', emoji: '♊️' },
  { name: 'Cancer', emoji: '♋️' }, { name: 'Leo', emoji: '♌️' }, { name: 'Virgo', emoji: '♍️' },
  { name: 'Libra', emoji: '♎️' }, { name: 'Scorpio', emoji: '♏️' }, { name: 'Sagittarius', emoji: '♐️' },
  { name: 'Capricorn', emoji: '♑️' }, { name: 'Aquarius', emoji: '♒️' }, { name: 'Pisces', emoji: '♓️' },
];

export default component$(() => {
  const activeSign = useSignal('Aries');
  const timeframe = useSignal('daily');
  const horoscopeContent = useSignal<string>('');
  const isLoading = useSignal(false);
  const showModal = useSignal(false);
  const validationError = useSignal('');
  const form = useStore({ name: '', phone: '', dob_y: '', dob_m: '', dob_d: '' });

  const fetchHoroscope = $(async (sign: string, time: string) => {
    isLoading.value = true;
    try {
      const apiBase = import.meta.env.PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiBase}/api/horoscope?zodiac=${sign}&timeframe=${time}`);
      const data = await res.json();
      
      if (typeof data.content === 'string') {
        horoscopeContent.value = data.content.trim();
      } else {
        horoscopeContent.value = '';
      }
    } catch (e) { console.error(e); } finally { isLoading.value = false; }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const done = localStorage.getItem('horo_profile_done');
    const saved = localStorage.getItem('horo_zodiac_sign') || 'Aries';
    activeSign.value = saved;
    if (!done) { showModal.value = true; }
    else { await fetchHoroscope(saved, 'daily'); }
  });

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('love') || c.includes('relation')) return 'favorite';
    if (c.includes('job') || c.includes('career')) return 'work';
    if (c.includes('money') || c.includes('finance')) return 'monetization_on';
    if (c.includes('health')) return 'health_and_safety';
    return 'auto_awesome';
  };

  return (
    <main class="pb-32 relative bg-[#FDF9F5] min-h-screen">
      <div class="bg-surface-container sticky top-0 z-40 shadow-sm border-b border-outline-variant/20 pt-16 pb-4">
        <div class="max-w-4xl mx-auto">
          <div class="flex justify-center mb-6 px-4">
            <div class="flex bg-surface-container-highest rounded-2xl p-1 max-w-sm w-full shadow-inner">
              {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                <button
                  key={t}
                  onClick$={async () => { timeframe.value = t; await fetchHoroscope(activeSign.value, t); }}
                  class={`flex-1 py-2 text-sm font-bold capitalize rounded-xl transition-all ${timeframe.value === t ? 'bg-white text-primary shadow shadow-primary/10' : 'text-on-surface-variant hover:text-on-surface'}`}
                >{t}</button>
              ))}
            </div>
          </div>
          <div class="flex overflow-x-auto no-scrollbar gap-3 px-6 pb-2 snap-x">
            {ZODIAC_SIGNS.map((sign) => (
              <button
                key={sign.name}
                onClick$={async () => { activeSign.value = sign.name; await fetchHoroscope(sign.name, timeframe.value); }}
                class={`snap-center shrink-0 flex flex-col items-center justify-center w-[72px] h-[80px] rounded-2xl border-2 transition-all ${activeSign.value === sign.name ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'}`}
              >
                <span class="text-2xl mb-1">{sign.emoji}</span>
                <span class={`text-[10px] font-bold uppercase tracking-wider ${activeSign.value === sign.name ? 'text-primary' : 'text-on-surface-variant'}`}>{sign.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <section class="px-6 py-10 max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-10 border-b border-outline-variant/30 pb-6">
          <div class="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl shadow-inner">
            {ZODIAC_SIGNS.find((s) => s.name === activeSign.value)?.emoji || '♈️'}
          </div>
          <div>
            <h2 class="font-headline text-3xl font-black text-on-surface uppercase tracking-tight">{activeSign.value}</h2>
            <p class="text-sm font-bold text-primary tracking-widest uppercase">{timeframe.value} Forecast</p>
          </div>
        </div>

        {isLoading.value ? (
          <div class="flex flex-col items-center justify-center py-20 space-y-4">
            <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p class="text-on-surface-variant font-medium animate-pulse">Reading the cosmic alignments...</p>
          </div>
        ) : (
          <div class="mt-2">
            {!horoscopeContent.value ? (
              <div class="text-center py-10 text-on-surface-variant text-lg font-medium">No predictions available at this moment.</div>
            ) : (
              <div class="text-on-surface-variant leading-relaxed text-lg md:text-xl whitespace-pre-wrap">
                {horoscopeContent.value}
              </div>
            )}
          </div>
        )}
      </section>

      {showModal.value && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-highest/80 backdrop-blur-sm">
          <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
            <h3 class="font-headline text-2xl font-black text-on-surface mb-2">Personalize Your Stars</h3>
            <p class="text-sm text-on-surface-variant mb-6">Connect your cosmic blueprint permanently to your profile.</p>
            {validationError.value && <p class="text-xs font-bold text-error bg-error/10 p-2 rounded-lg mb-4">{validationError.value}</p>}
            <div class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Name</label>
                <input value={form.name} onInput$={(e) => (form.name = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm" placeholder="e.g. Rahul" />
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Phone</label>
                <input type="tel" value={form.phone} onInput$={(e) => (form.phone = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm" placeholder="10 Digits" />
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Date of Birth (Year, Month, Date)</label>
                <div class="flex gap-2">
                  <input type="number" placeholder="YYYY" value={form.dob_y} onInput$={(e) => (form.dob_y = (e.target as HTMLInputElement).value)} class="w-1/3 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm text-center" />
                  <input type="number" placeholder="MM" value={form.dob_m} onInput$={(e) => (form.dob_m = (e.target as HTMLInputElement).value)} class="w-1/3 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm text-center" />
                  <input type="number" placeholder="DD" value={form.dob_d} onInput$={(e) => (form.dob_d = (e.target as HTMLInputElement).value)} class="w-1/3 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm text-center" />
                </div>
              </div>
              <div class="pt-4 flex flex-col gap-3">
                <button
                  onClick$={async () => {
                    if (!form.name || !form.phone || !form.dob_y || !form.dob_m || !form.dob_d) { validationError.value = 'All fields are required.'; return; }
                    const y = parseInt(form.dob_y, 10);
                    const m = parseInt(form.dob_m, 10);
                    const d = parseInt(form.dob_d, 10);
                    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) { validationError.value = 'Please enter a valid date.'; return; }
                    
                    const entries = [
                      [1,20,'Aquarius'],[2,19,'Pisces'],[3,21,'Aries'],[4,20,'Taurus'],
                      [5,21,'Gemini'],[6,21,'Cancer'],[7,23,'Leo'],[8,23,'Virgo'],
                      [9,23,'Libra'],[10,23,'Scorpio'],[11,22,'Sagittarius'],[12,22,'Capricorn']
                    ] as [number,number,string][];
                    const sign = entries.find(([em, ed]) => m < em || (m === em && d <= ed))?.[2] || 'Capricorn';
                    activeSign.value = sign;
                    localStorage.setItem('horo_zodiac_sign', sign);
                    localStorage.setItem('horo_profile_done', 'true');
                    showModal.value = false;
                    await fetchHoroscope(sign, timeframe.value);
                  }}
                  class="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl active:scale-95 transition-transform text-sm shadow-lg shadow-primary/20"
                >Reveal My Horoscope</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Daily Horoscope — Devutsav',
  meta: [
    { name: 'description', content: 'Get your daily, weekly, and monthly horoscope predictions for all zodiac signs. AI-powered spiritual insights on Devutsav.' },
    { property: 'og:title', content: 'Daily Horoscope — Devutsav' },
  ],
};
