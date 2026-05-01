import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { getApiBase } from '~/lib/apiBase';

interface StoredUser {
  id: string; name?: string; email?: string; phone?: string; isd_code?: string;
  dob?: string; tob?: string;
  pob?: string; pob_lat?: number; pob_lon?: number;
}

export default component$(() => {
  const loading = useSignal(true);
  const submitting = useSignal(false);
  const error = useSignal('');
  const pdfUrl = useSignal<string | null>(null);
  const userId = useSignal<string | null>(null);
  const hasProfile = useSignal(false);

  const form = useStore({
    name: '',
    isd_code: '+91', phone: '', email: '',
    dob: '', tob: '', tob_unknown: false,
    pob: '', pob_lat: null as number | null, pob_lon: null as number | null,
    gender: 'male' as 'male' | 'female',
  });

  const pobSuggestions = useSignal<{ description: string; place_id: string }[]>([]);
  const isSearchingPob = useSignal(false);

  const fetchPob = $(async (val: string) => {
    if (val.length < 3) { pobSuggestions.value = []; return; }
    isSearchingPob.value = true;
    try {
      const res = await fetch(`${getApiBase()}/api/location/autocomplete?input=${encodeURIComponent(val)}`);
      pobSuggestions.value = await res.json();
    } catch { pobSuggestions.value = []; }
    finally { isSearchingPob.value = false; }
  });

  const selectPob = $(async (description: string, placeId: string) => {
    form.pob = description;
    pobSuggestions.value = [];
    isSearchingPob.value = true;
    try {
      const res = await fetch(`${getApiBase()}/api/location/details?place_id=${placeId}`);
      const d = await res.json();
      if (d?.lat) { form.pob_lat = d.lat; form.pob_lon = d.lng; }
    } catch {}
    finally { isSearchingPob.value = false; }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    let uid = '';
    try { uid = localStorage.getItem('du_user_id') || ''; } catch {}
    if (!uid) { loading.value = false; return; }
    userId.value = uid;
    try {
      const res = await fetch(`${getApiBase()}/api/users/profile/${uid}`);
      if (res.ok) {
        const u: StoredUser & { dob?: string } = await res.json();
        if (u.name) form.name = u.name;
        if (u.phone) form.phone = u.phone;
        if (u.isd_code) form.isd_code = u.isd_code;
        if (u.email) form.email = u.email;
        if (u.dob) form.dob = String(u.dob).slice(0, 10);
        if (u.tob && u.tob !== 'Unknown') form.tob = u.tob;
        else if (u.tob === 'Unknown') form.tob_unknown = true;
        if (u.pob) form.pob = u.pob;
        if (typeof u.pob_lat === 'number') form.pob_lat = u.pob_lat;
        if (typeof u.pob_lon === 'number') form.pob_lon = u.pob_lon;
        hasProfile.value = !!(u.name && u.pob);
      }
    } catch {}
    finally { loading.value = false; }
  });

  const submit = $(async () => {
    error.value = '';
    if (!form.name.trim()) { error.value = 'Name is required.'; return; }
    const phoneClean = form.phone.replace(/\D/g, '');
    if (phoneClean.length < 6) { error.value = 'A valid phone number is required.'; return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      error.value = 'Please enter a valid email or leave it blank.'; return;
    }
    if (!form.dob) { error.value = 'Date of birth is required.'; return; }
    if (!form.pob.trim() || form.pob_lat == null || form.pob_lon == null) {
      error.value = 'Please pick your place of birth from the suggestions.';
      return;
    }
    const isdClean = (() => {
      const digits = form.isd_code.replace(/\D/g, '');
      return digits ? `+${digits.slice(0, 4)}` : '+91';
    })();
    submitting.value = true;
    try {
      let session_id = '';
      try { session_id = localStorage.getItem('du_session_id') || localStorage.getItem('user_session_id') || ''; } catch {}

      let uid = userId.value || '';
      try {
        const userRes = await fetch(`${getApiBase()}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_session_id: session_id || undefined,
            source: 'KUNDALI_GENERATOR',
            name: form.name.trim(),
            isd_code: isdClean,
            phone: phoneClean,
            email: form.email.trim() || undefined,
            dob: form.dob,
            tob: form.tob_unknown ? 'Unknown' : (form.tob || undefined),
            pob: form.pob.trim(),
            pob_lat: form.pob_lat,
            pob_lon: form.pob_lon,
          }),
        });
        const userData = await userRes.json();
        if (userData?.user?._id) {
          uid = userData.user._id;
          userId.value = uid;
          try {
            localStorage.setItem('du_user_id', uid);
            localStorage.setItem('du_user', JSON.stringify({
              id: uid, name: form.name.trim(), email: form.email.trim() || undefined,
              phone: phoneClean, isd_code: isdClean,
            }));
          } catch {}
        }
      } catch {}

      const res = await fetch(`${getApiBase()}/api/kundali/basic-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: uid || undefined,
          name: form.name.trim(),
          dob: form.dob,
          tob: form.tob_unknown ? undefined : (form.tob || undefined),
          pob: form.pob.trim(),
          pob_lat: form.pob_lat,
          pob_lon: form.pob_lon,
          gender: form.gender,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to generate');
      if (data.pdf_url) pdfUrl.value = data.pdf_url;
      else throw new Error('No PDF returned');
    } catch (e: any) {
      error.value = e?.message || 'Could not generate your Kundali. Please try again.';
    } finally {
      submitting.value = false;
    }
  });

  return (
    <main class="px-4 md:px-0 max-w-3xl mx-auto pt-6 pb-24">
      <section class="px-2 md:px-6 mb-8 text-center">
        <h1 class="font-headline text-3xl md:text-4xl font-black text-on-surface mb-3">
          Generate Your <span class="text-secondary italic">Kundali</span>
        </h1>
        <p class="text-on-surface-variant text-base max-w-xl mx-auto">
          Receive a complete Vedic birth-chart PDF, prepared from your exact birth details.
        </p>
      </section>

      {loading.value && (
        <div class="flex items-center justify-center py-16">
          <div class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!loading.value && pdfUrl.value && (
        <section class="bg-surface-container rounded-3xl p-8 text-center border border-primary/20 shadow-xl">
          <span class="material-symbols-outlined text-primary text-5xl mb-3" style="font-variation-settings: 'FILL' 1">task_alt</span>
          <h2 class="font-headline text-2xl font-bold mb-2">Your Kundali is ready</h2>
          <p class="text-on-surface-variant mb-6">Open it below to view or download your personalised birth-chart PDF.</p>
          <a
            href={pdfUrl.value}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-sm rounded-xl uppercase tracking-widest"
          >
            <span class="material-symbols-outlined text-base">picture_as_pdf</span>
            Open Kundali PDF
          </a>
        </section>
      )}

      {!loading.value && !pdfUrl.value && (
        <section class="bg-surface-container rounded-3xl p-6 md:p-8 border border-outline-variant/10">
          {hasProfile.value && (
            <p class="text-xs font-bold uppercase tracking-widest text-primary mb-4">
              We've pre-filled what we know about you — confirm or edit below.
            </p>
          )}

          {error.value && (
            <div class="bg-error/10 text-error text-sm font-bold px-4 py-3 rounded-xl mb-4">{error.value}</div>
          )}

          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Name *</label>
              <input value={form.name} onInput$={(e) => (form.name = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm" placeholder="Your full name" />
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Phone *</label>
              <div class="flex gap-2">
                <input
                  type="tel"
                  value={form.isd_code}
                  onInput$={(e) => {
                    let v = (e.target as HTMLInputElement).value.replace(/[^\d+]/g, '');
                    if (!v.startsWith('+')) v = '+' + v.replace(/\+/g, '');
                    form.isd_code = v.slice(0, 5);
                  }}
                  class="w-20 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-3 py-3 outline-none text-sm text-center font-bold"
                  placeholder="+91"
                  aria-label="Country code"
                />
                <input
                  type="tel"
                  value={form.phone}
                  onInput$={(e) => (form.phone = (e.target as HTMLInputElement).value)}
                  class="flex-1 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm"
                  placeholder="10-digit phone"
                />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Email <span class="text-on-surface-variant/60 normal-case font-normal">(optional)</span></label>
              <input
                type="email"
                value={form.email}
                onInput$={(e) => (form.email = (e.target as HTMLInputElement).value)}
                class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={form.dob}
                  max={new Date().toISOString().slice(0, 10)}
                  min="1900-01-01"
                  onInput$={(e) => (form.dob = (e.target as HTMLInputElement).value)}
                  class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm"
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Gender</label>
                <select value={form.gender} onChange$={(e) => (form.gender = (e.target as HTMLSelectElement).value as any)} class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Time of Birth</label>
                <label class="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant cursor-pointer">
                  <input type="checkbox" checked={form.tob_unknown} onChange$={() => { form.tob_unknown = !form.tob_unknown; if (form.tob_unknown) form.tob = ''; }} class="w-3.5 h-3.5 rounded" />
                  <span>I don't know</span>
                </label>
              </div>
              <input
                type="time"
                disabled={form.tob_unknown}
                value={form.tob}
                onInput$={(e) => (form.tob = (e.target as HTMLInputElement).value)}
                class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm disabled:opacity-50"
              />
            </div>

            <div class="relative">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Place of Birth *</label>
              <div class="relative">
                <input
                  type="text"
                  value={form.pob}
                  placeholder="e.g. Varanasi, India"
                  autoComplete="off"
                  onInput$={(e) => {
                    const v = (e.target as HTMLInputElement).value;
                    form.pob = v; form.pob_lat = null; form.pob_lon = null;
                    fetchPob(v);
                  }}
                  class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm"
                />
                {isSearchingPob.value && (
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                )}
              </div>
              <p class="text-[10px] text-on-surface-variant/60 mt-1">Pick the matching city from the list</p>
              {pobSuggestions.value.length > 0 && (
                <div class="absolute top-[68px] left-0 right-0 bg-white border border-outline-variant/30 rounded-xl shadow-2xl z-30 overflow-hidden max-h-52 overflow-y-auto">
                  {pobSuggestions.value.map((p, idx) => (
                    <div key={idx} class="px-4 py-3 hover:bg-surface-variant border-b border-outline-variant/10 cursor-pointer text-sm font-medium text-on-surface" onClick$={() => selectPob(p.description, p.place_id)}>
                      {p.description}
                    </div>
                  ))}
                </div>
              )}
              {hasProfile.value && form.pob_lat == null && form.pob && (
                <p class="text-[10px] text-error mt-1">Please reselect your city from the suggestions to confirm coordinates.</p>
              )}
            </div>

            <button
              onClick$={submit}
              disabled={submitting.value}
              class="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl active:scale-95 transition-transform text-sm uppercase tracking-widest disabled:opacity-60"
            >
              {submitting.value ? 'Generating your Kundali…' : 'Generate Kundali PDF'}
            </button>
            <p class="text-[10px] text-on-surface-variant/60 text-center">Free · Delivered as a PDF you can save</p>
          </div>
        </section>
      )}
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Generate Your Kundali — Devutsav',
  meta: [
    { name: 'description', content: 'Generate a personalised Vedic Kundali PDF from your birth details — instantly delivered on Devutsav.' },
    { property: 'og:title', content: 'Generate Your Kundali — Devutsav' },
  ],
};
