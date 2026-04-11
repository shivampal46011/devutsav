import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

const LOADING_MSGS = [
  'Fetching Kundali...', 'Aligning cosmic coordinates...',
  'Analyzing planetary positions...', 'Finding deep-rooted Doshas...', 'Compiling spiritual remedies...',
];

export default component$(() => {
  const step = useSignal(1);
  const tobUnknown = useSignal(false);
  const isAnalyzing = useSignal(false);
  const validationError = useSignal('');
  const loadingMsgIdx = useSignal(0);
  const report = useSignal<any>(null);
  const kundaliLink = useSignal<string | null>(null);
  const sessionId = useSignal('');

  const pobSuggestions = useSignal<any[]>([]);
  const isSearchingPob = useSignal(false);

  const form = useStore({
    name: '', phone: '', isd_code: '+91', email: '',
    dob_y: '', dob_m: '', dob_d: '', tob_h: '', tob_m: '', pob: '', pob_lat: null as number | null, pob_lon: null as number | null,
    pob_city: '', pob_state: '', pob_country: '', place_id: '',
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    let id = localStorage.getItem('user_session_id');
    if (!id) { id = 'session_' + Math.random().toString(36).substring(2, 15); localStorage.setItem('user_session_id', id); }
    sessionId.value = id;

    const cached = localStorage.getItem('dosha_report_cache');
    if (cached) {
      try {
        const { timestamp, reportData, link } = JSON.parse(cached);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp < sevenDays) {
          report.value = reportData;
          if (link) kundaliLink.value = link;
          step.value = 4;
        } else {
          localStorage.removeItem('dosha_report_cache');
        }
      } catch (e) {}
    }
  });

  const fetchSuggestions = $(async (val: string) => {
    if (val.length < 3) { pobSuggestions.value = []; return; }
    isSearchingPob.value = true;
    try {
      const api = import.meta.env.PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${api}/api/location/autocomplete?input=${encodeURIComponent(val)}`);
      pobSuggestions.value = await res.json();
    } catch { pobSuggestions.value = []; } finally { isSearchingPob.value = false; }
  });

  const selectPob = $(async (description: string, placeId: string) => {
    form.pob = description; form.place_id = placeId;
    pobSuggestions.value = [];
    isSearchingPob.value = true;
    try {
      const api = import.meta.env.PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${api}/api/location/details?place_id=${placeId}`);
      const d = await res.json();
      if (d?.lat) { form.pob_lat = d.lat; form.pob_lon = d.lng; form.pob_city = d.city; form.pob_state = d.state; form.pob_country = d.country; }
    } catch { } finally { isSearchingPob.value = false; }
  });

  return (
    <main class="px-4 md:px-0 max-w-5xl mx-auto relative pt-12 pb-24">
      {step.value < 3 && (
        <section class="px-6 mb-10 text-center">
          <h1 class="font-headline text-4xl md:text-5xl font-black text-on-surface leading-tight tracking-tight mb-4">
            Kundali Dosha <span class="text-secondary italic">Calculator</span>
          </h1>
          <p class="text-on-surface-variant font-body text-lg max-w-xl mx-auto">
            Enter your precise birth details. Our AI will analyze your planetary alignments.
          </p>
        </section>
      )}

      {/* Step 1 */}
      {step.value === 1 && (
        <section class="w-full mt-8">
          <div class="w-full">
            <div class="flex items-center justify-between mb-8">
              <span class="font-label text-sm uppercase tracking-widest text-primary font-bold">Step 1 of 2</span>
              <span class="text-base font-bold text-on-surface-variant">Personal Info</span>
            </div>
            {validationError.value && (
              <div class="bg-error/10 text-error text-sm font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">error</span>{validationError.value}
              </div>
            )}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div>
                <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3">Full Name *</label>
                <input value={form.name} onInput$={(e) => (form.name = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow" placeholder="e.g. Rahul Sharma" />
              </div>
              <div class="flex gap-4">
                <div class="w-[30%]">
                  <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3">ISD</label>
                  <input value={form.isd_code} onInput$={(e) => (form.isd_code = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow" />
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3">Phone *</label>
                  <input type="tel" value={form.phone} onInput$={(e) => (form.phone = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow" placeholder="10 Digits" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3">Email (Optional)</label>
                <input type="email" value={form.email} onInput$={(e) => (form.email = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow" placeholder="rahul@example.com" />
              </div>
            </div>
            <div class="mt-12 flex justify-end">
              <button
                onClick$={async () => {
                  validationError.value = '';
                  if (!form.name.trim()) { validationError.value = 'Name is required.'; return; }
                  if (!/^[0-9]{10}$/.test(form.phone)) { validationError.value = 'Invalid 10-digit phone number.'; return; }
                  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { validationError.value = 'Invalid Email.'; return; }
                  try {
                    const api = import.meta.env.PUBLIC_API_URL || 'http://localhost:5001';
                    await fetch(`${api}/api/market/auth/devpunya`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isdCode: form.isd_code, phone: form.phone, fullname: form.name, email: form.email || undefined, platform: 'web' }) });
                  } catch { }
                  step.value = 2;
                }}
                class="px-12 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase flex items-center"
              >
                Continue <span class="material-symbols-outlined text-sm ml-2">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 2 */}
      {step.value === 2 && (
        <section class="max-w-6xl mx-auto w-full mt-8">
          <div class="w-full">
            <div class="flex items-center justify-between mb-8">
              <button onClick$={() => (step.value = 1)} class="text-on-surface-variant hover:text-primary transition-colors flex items-center bg-surface-container px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest shadow-sm">
                <span class="material-symbols-outlined text-sm mr-1">arrow_back</span> Back
              </button>
              <span class="text-base font-bold text-on-surface-variant">Birth Details</span>
            </div>
            {validationError.value && (
              <div class="bg-error/10 text-error text-sm font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">error</span>{validationError.value}
              </div>
            )}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3">Date of Birth (Year, Month, Date) *</label>
                <div class="flex gap-2">
                  <input type="number" placeholder="YYYY" value={form.dob_y} onInput$={(e) => (form.dob_y = (e.target as HTMLInputElement).value)} class="w-[40%] bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-5 text-on-surface text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow" />
                  <input type="number" placeholder="MM" value={form.dob_m} onInput$={(e) => (form.dob_m = (e.target as HTMLInputElement).value)} class="w-[30%] bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-5 text-on-surface text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow" />
                  <input type="number" placeholder="DD" value={form.dob_d} onInput$={(e) => (form.dob_d = (e.target as HTMLInputElement).value)} class="w-[30%] bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-5 text-on-surface text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow" />
                </div>
              </div>
              
              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">Time of Birth (24Hr)</label>
                  <label class="flex items-center gap-2 text-xs font-bold text-on-surface-variant cursor-pointer">
                    <input type="checkbox" checked={tobUnknown.value} onChange$={() => {
                      tobUnknown.value = !tobUnknown.value;
                      if (tobUnknown.value) { form.tob_h = ''; form.tob_m = ''; }
                    }} class="w-4 h-4 rounded border-outline-variant/30 text-primary cursor-pointer focus:ring-primary/50" />
                    <span>I don't know</span>
                  </label>
                </div>
                <div class="flex gap-2 relative group">
                  <select disabled={tobUnknown.value} value={form.tob_h} onChange$={(e) => (form.tob_h = (e.target as HTMLSelectElement).value)} class="w-1/2 bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-5 text-on-surface text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm disabled:opacity-50 appearance-none">
                    <option value="" disabled selected>Hour (00)</option>
                    {Array.from({length: 24}).map((_, i) => <option value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
                  </select>
                  <div class="absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-3 pointer-events-none text-on-surface-variant group-hover:text-primary"><span class="material-symbols-outlined text-sm">expand_more</span></div>

                  <select disabled={tobUnknown.value} value={form.tob_m} onChange$={(e) => (form.tob_m = (e.target as HTMLSelectElement).value)} class="w-1/2 bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-5 text-on-surface text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm disabled:opacity-50 appearance-none">
                    <option value="" disabled selected>Min (00)</option>
                    {Array.from({length: 60}).map((_, i) => <option value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
                  </select>
                  <div class="absolute right-[calc(25%-12px)] top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant group-hover:text-primary"><span class="material-symbols-outlined text-sm">expand_more</span></div>
                </div>
              </div>

              <div class="relative">
                <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3">Place of Birth *</label>
                <div class="relative">
                  <input
                    type="text" value={form.pob} placeholder="e.g. New Delhi, India" autoComplete="off"
                    onInput$={(e) => {
                      const v = (e.target as HTMLInputElement).value;
                      form.pob = v; form.pob_lat = null; form.pob_lon = null;
                      form.pob_city = ''; form.pob_state = ''; form.pob_country = ''; form.place_id = '';
                      fetchSuggestions(v);
                    }}
                    class="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow"
                  />
                  {isSearchingPob.value && <div class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                </div>
                <span class="text-xs text-on-surface-variant/60 mt-3 block pl-2">Select matched city from dropdown!</span>
                {pobSuggestions.value.length > 0 && (
                  <div class="absolute top-[85px] w-full bg-white border border-outline-variant/30 rounded-2xl shadow-2xl z-20 overflow-hidden max-h-56 overflow-y-auto">
                    {pobSuggestions.value.map((place: any, idx: number) => (
                      <div key={idx} class="px-5 py-4 hover:bg-surface-variant border-b border-outline-variant/10 cursor-pointer text-base font-medium transition-colors text-on-surface" onClick$={() => selectPob(place.description, place.place_id)}>
                        {place.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div class="mt-12 flex justify-end">
              <button
                onClick$={async () => {
                  validationError.value = '';
                  // Validate birth fields inline
                  if (!form.dob_y || !form.dob_m || !form.dob_d) { validationError.value = 'Detailed Date of Birth is required.'; return; }
                  
                  const y = parseInt(form.dob_y, 10);
                  const m = parseInt(form.dob_m, 10);
                  const d = parseInt(form.dob_d, 10);
                  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) { validationError.value = 'Please enter a valid date.'; return; }
                  const dobParsed = `${form.dob_y}-${form.dob_m.padStart(2, '0')}-${form.dob_d.padStart(2, '0')}`;

                  if (!tobUnknown.value && (!form.tob_h || !form.tob_m)) { validationError.value = "Time of Birth components required or check 'I don't know'."; return; }
                  const tobParsed = tobUnknown.value ? null : `${form.tob_h}:${form.tob_m}`;

                  if (!form.pob.trim() || !form.pob_lat) { validationError.value = 'Please select a valid Place of Birth from suggestions.'; return; }
                  isAnalyzing.value = true;
                  step.value = 3;
                  const interval = setInterval(() => { loadingMsgIdx.value = (loadingMsgIdx.value + 1) % LOADING_MSGS.length; }, 800);
                  try {
                    const api = import.meta.env.PUBLIC_API_URL || 'http://localhost:5001';
                    const userRes = await fetch(`${api}/api/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_session_id: sessionId.value, ...form }) });
                    const userData = await userRes.json();
                    const uId = userData?.user?._id;
                    const [kundaliRes] = await Promise.all([
                      fetch(`${api}/api/kundali/analyze-dosha`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: uId, user_session_id: sessionId.value, dob: dobParsed, tob: tobParsed, tob_unknown: tobUnknown.value, pob: form.pob, pob_lat: form.pob_lat, pob_lon: form.pob_lon }) }),
                      new Promise(r => setTimeout(r, 3000)),
                    ]);
                    const kData = await kundaliRes.json();
                    if (kData.report) report.value = kData.report;
                    if (kData.kundali_link) kundaliLink.value = kData.kundali_link;

                    localStorage.setItem('dosha_report_cache', JSON.stringify({
                      timestamp: Date.now(),
                      reportData: kData.report,
                      link: kData.kundali_link
                    }));

                    step.value = 4;
                  } catch {
                    validationError.value = 'Connection issue with the cosmic oracle. Please try again.';
                    step.value = 2;
                  } finally { isAnalyzing.value = false; clearInterval(interval); }
                }}
                class="px-8 md:px-12 py-4 bg-gradient-to-r from-secondary to-tertiary text-white font-bold rounded-2xl shadow-lg shadow-secondary/20 active:scale-95 transition-all text-sm tracking-widest uppercase flex justify-center items-center gap-2"
              >
                <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1">auto_awesome</span>
                Analyze My Kundali Dosha
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 3 — Loading */}
      {step.value === 3 && (
        <section class="px-6 flex flex-col items-center justify-center min-h-[40vh]">
          <div class="relative w-32 h-32 mb-8">
            <div class="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div class="absolute inset-[3px] rounded-full border-b-4 border-l-4 border-primary animate-[spin_2s_linear_infinite]" />
            <div class="absolute inset-[8px] rounded-full border-t-4 border-r-4 border-secondary animate-[spin_3s_linear_infinite_reverse]" />
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="material-symbols-outlined text-5xl text-primary animate-pulse" style="font-variation-settings: 'FILL' 1">stars</span>
            </div>
          </div>
          <h3 class="font-headline text-2xl font-bold text-on-surface mb-3 min-h-[32px]">{LOADING_MSGS[loadingMsgIdx.value]}</h3>
          <div class="w-48 bg-surface-variant rounded-full h-1.5 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-primary to-secondary animate-pulse" style={`width: ${((loadingMsgIdx.value + 1) / LOADING_MSGS.length) * 100}%; transition: width 0.8s ease`} />
          </div>
        </section>
      )}

      {/* Step 4 — Results */}
      {step.value === 4 && report.value && (
        <section class="px-6 max-w-3xl mx-auto space-y-12">
          <div class="bg-surface-container rounded-3xl p-8 shadow-xl shadow-primary/10 border border-primary/20">
            <h2 class="font-headline text-3xl font-black text-on-surface mb-6">Your Dosha Report</h2>
            {kundaliLink.value && (
              <a href={kundaliLink.value} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors">
                <span class="material-symbols-outlined text-sm">open_in_new</span> View Full Kundali Chart
              </a>
            )}
            <pre class="whitespace-pre-wrap text-on-surface-variant leading-relaxed text-sm">{JSON.stringify(report.value, null, 2)}</pre>
          </div>
        </section>
      )}
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Kundali Dosha Calculator — Devutsav',
  meta: [
    { name: 'description', content: 'Analyze your Kundali and identify hidden Doshas using AI-powered astrological analysis. Get personalized spiritual insights on Devutsav.' },
    { property: 'og:title', content: 'Kundali Dosha Calculator — Devutsav' },
  ],
};
