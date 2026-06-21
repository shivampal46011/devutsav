import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { track } from '~/lib/track';
import { onlyDigits, sanitizeIsdInput, normalizeIsd, validateName, validatePhone, validateEmail, phoneMaxLen } from '~/lib/formValidation';

const STORAGE_KEY = 'du_guidance_unlocked_v1';
const PAYLOAD_KEY = 'du_guidance_today';

interface Tip { date: string; title: string; body: string; }

const fakeTitle = 'Today\'s Tip';
const fakeBody = '"Offer water to the rising sun today to strengthen your inner resolve and clear professional obstacles."';

export default component$(() => {
  const isUnlocked = useSignal(false);
  const modalOpen = useSignal(false);
  const submitting = useSignal(false);
  const validationError = useSignal('');
  const tip = useSignal<Tip | null>(null);

  const form = useStore({
    name: '', email: '', isd_code: '+91', phone: '',
    pob: '', dob: '', tob: '',
    pob_lat: null as number | null, pob_lon: null as number | null,
    pob_city: '', pob_state: '', pob_country: '', pob_place_id: '',
    tob_unknown: true, email_subscribe: true,
  });
  const errors = useStore({ name: '', phone: '', email: '', pob: '' });

  const pobSuggestions = useSignal<{ description: string; place_id: string }[]>([]);
  const isSearchingPob = useSignal(false);

  const fetchPobSuggestions = $(async (val: string) => {
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
    form.pob_place_id = placeId;
    pobSuggestions.value = [];
    isSearchingPob.value = true;
    try {
      const res = await fetch(`${getApiBase()}/api/location/details?place_id=${placeId}`);
      const d = await res.json();
      if (d?.lat) {
        form.pob_lat = d.lat;
        form.pob_lon = d.lng;
        form.pob_city = d.city || '';
        form.pob_state = d.state || '';
        form.pob_country = d.country || '';
      }
    } catch {}
    finally { isSearchingPob.value = false; }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    let stored: Tip | null = null;
    try {
      const flag = localStorage.getItem(STORAGE_KEY);
      const cached = localStorage.getItem(PAYLOAD_KEY);
      if (cached) stored = JSON.parse(cached) as Tip;
      if (flag === '1') isUnlocked.value = true;
    } catch {}

    track('section_view', { section_id: 'home_daily_guidance' });
    if (!isUnlocked.value) {
      track('section_view', { section_id: 'guidance_locked_view' });
      return;
    }

    // Refresh today's tip if cache is stale or absent.
    const today = new Date().toISOString().slice(0, 10);
    if (!stored || stored.date !== today) {
      try {
        const res = await fetch(`${getApiBase()}/api/guidance/today`);
        if (res.ok) {
          const fresh = (await res.json()) as Tip;
          tip.value = fresh;
          try { localStorage.setItem(PAYLOAD_KEY, JSON.stringify(fresh)); } catch {}
        } else if (stored) {
          tip.value = stored;
        }
      } catch {
        if (stored) tip.value = stored;
      }
    } else {
      tip.value = stored;
    }
  });

  const openModal = $(() => {
    modalOpen.value = true;
    track('section_click', { section_id: 'guidance_unlock_open' });
  });

  const submit = $(async () => {
    validationError.value = '';
    errors.name = validateName(form.name);
    errors.phone = validatePhone(form.phone, form.isd_code);
    errors.email = validateEmail(form.email);
    errors.pob = (!form.pob.trim() || !form.pob_lat || !form.pob_lon)
      ? 'Pick your place of birth from the suggestions.' : '';
    if (errors.name || errors.phone || errors.email || errors.pob) {
      validationError.value = 'Please fix the highlighted fields.';
      return;
    }
    const phoneClean = onlyDigits(form.phone);

    submitting.value = true;
    try {
      let session_id = '';
      try { session_id = localStorage.getItem('du_session_id') || ''; } catch {}
      const isdClean = normalizeIsd(form.isd_code);
      const res = await fetch(`${getApiBase()}/api/guidance/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          isd_code: isdClean,
          phone: phoneClean,
          pob: form.pob.trim(),
          pob_lat: form.pob_lat ?? undefined,
          pob_lon: form.pob_lon ?? undefined,
          pob_city: form.pob_city || undefined,
          pob_state: form.pob_state || undefined,
          pob_country: form.pob_country || undefined,
          pob_place_id: form.pob_place_id || undefined,
          dob: form.dob.trim() || undefined,
          tob: form.tob_unknown ? undefined : form.tob.trim() || undefined,
          email_subscribe: form.email_subscribe && Boolean(form.email.trim()),
          user_session_id: session_id || undefined,
        }),
      });
      if (!res.ok) throw new Error('submit_failed');
      const data = (await res.json()) as Tip & { ok: boolean; user?: { id: string; name: string; email?: string; phone: string; isd_code: string } };
      const todayTip: Tip = { date: data.date, title: data.title, body: data.body };
      tip.value = todayTip;
      try {
        localStorage.setItem(STORAGE_KEY, '1');
        localStorage.setItem(PAYLOAD_KEY, JSON.stringify(todayTip));
        if (data.user) {
          localStorage.setItem('du_user', JSON.stringify(data.user));
          localStorage.setItem('du_user_id', data.user.id);
        }
      } catch {}
      isUnlocked.value = true;
      modalOpen.value = false;
      track('section_click', { section_id: 'guidance_unlock_submit' });
      if (form.email_subscribe && form.email.trim()) {
        track('section_click', { section_id: 'guidance_email_subscribe' });
      }
      if (form.tob_unknown) {
        track('section_click', { section_id: 'guidance_unlock_skip_tob' });
      }
    } catch (err: any) {
      validationError.value = 'Could not unlock right now. Please try again.';
    } finally {
      submitting.value = false;
    }
  });

  const showTitle = isUnlocked.value && tip.value ? tip.value.title : fakeTitle;
  const showBody = isUnlocked.value && tip.value ? tip.value.body : fakeBody;

  return (
    <>
      <div class="w-full bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/10 relative overflow-hidden min-h-[180px] md:min-h-[220px]">
        <div class={isUnlocked.value ? '' : 'blur-[6px] select-none pointer-events-none'}>
          <div class="flex items-center gap-3 mb-4">
            <span class="w-8 h-[1px] bg-primary" />
            <span class="text-xs font-bold uppercase tracking-widest text-primary">{isUnlocked.value ? 'Today\'s Guidance' : 'Today\'s Tip'}</span>
          </div>
          <h3 class="font-headline text-xl font-bold text-on-surface mb-2 leading-tight">{showTitle}</h3>
          <p class="font-headline text-base md:text-lg italic text-on-surface leading-relaxed">{showBody}</p>
        </div>

        {!isUnlocked.value && (
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-surface-container/30 to-surface-container/80 backdrop-blur-[1px] p-6 text-center">
            <span class="material-symbols-outlined text-primary text-3xl mb-2" style="font-variation-settings: 'FILL' 1">lock</span>
            <p class="text-sm text-on-surface-variant mb-4 max-w-xs">
              Today's guidance is sealed. Unlock it to receive this morning's spiritual whisper.
            </p>
            <button
              onClick$={openModal}
              class="px-5 py-3 bg-primary text-on-primary font-bold text-sm rounded-xl shadow-lg active:scale-95 transition-transform inline-flex items-center gap-2 uppercase tracking-widest"
            >
              <span class="material-symbols-outlined text-base">lock_open</span>
              Unlock Daily Guidance
            </button>
            <p class="text-[10px] text-on-surface-variant/60 mt-3">Free · 30 seconds · no payment</p>
          </div>
        )}
      </div>

      {modalOpen.value && (
        <div class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick$={() => { modalOpen.value = false; track('section_click', { section_id: 'guidance_unlock_close' }); }}
              class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high"
              aria-label="Close"
            >
              <span class="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary rounded-t-3xl" />

            <h3 class="font-headline text-2xl font-black text-on-surface mb-1">Unlock Today's Guidance</h3>
            <p class="text-sm text-on-surface-variant mb-6">A few details about you so the guidance carries your name. We never share your info.</p>

            {validationError.value && (
              <p class="text-xs font-bold text-error bg-error/10 p-3 rounded-lg mb-4">{validationError.value}</p>
            )}

            <div class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Name *</label>
                <input
                  value={form.name}
                  onInput$={(e) => { form.name = (e.target as HTMLInputElement).value; if (errors.name) errors.name = ''; }}
                  onBlur$={() => (errors.name = validateName(form.name))}
                  class={`w-full bg-surface-container-low border rounded-xl px-4 py-3 outline-none text-sm focus:border-primary ${errors.name ? 'border-error' : 'border-outline-variant/30'}`}
                  placeholder="Your name"
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && <p class="text-[11px] font-semibold text-error mt-1">{errors.name}</p>}
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Phone *</label>
                <div class="flex gap-2">
                  <input
                    type="tel"
                    value={form.isd_code}
                    onInput$={(e) => (form.isd_code = sanitizeIsdInput((e.target as HTMLInputElement).value))}
                    class="w-20 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-3 py-3 outline-none text-sm text-center font-bold"
                    placeholder="+91"
                    aria-label="Country code"
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={phoneMaxLen(form.isd_code)}
                    value={form.phone}
                    onInput$={(e) => { form.phone = onlyDigits((e.target as HTMLInputElement).value).slice(0, phoneMaxLen(form.isd_code)); if (errors.phone) errors.phone = ''; }}
                    onBlur$={() => (errors.phone = validatePhone(form.phone, form.isd_code))}
                    class={`flex-1 bg-surface-container-low border rounded-xl px-4 py-3 outline-none text-sm focus:border-primary ${errors.phone ? 'border-error' : 'border-outline-variant/30'}`}
                    placeholder="10-digit phone"
                    aria-invalid={errors.phone ? 'true' : 'false'}
                  />
                </div>
                {errors.phone && <p class="text-[11px] font-semibold text-error mt-1">{errors.phone}</p>}
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
                      form.pob = v;
                      form.pob_lat = null;
                      form.pob_lon = null;
                      form.pob_city = '';
                      form.pob_state = '';
                      form.pob_country = '';
                      form.pob_place_id = '';
                      if (errors.pob) errors.pob = '';
                      fetchPobSuggestions(v);
                    }}
                    class={`w-full bg-surface-container-low border rounded-xl px-4 py-3 outline-none text-sm focus:border-primary ${errors.pob ? 'border-error' : 'border-outline-variant/30'}`}
                    aria-invalid={errors.pob ? 'true' : 'false'}
                  />
                  {isSearchingPob.value && (
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  )}
                </div>
                {errors.pob
                  ? <p class="text-[11px] font-semibold text-error mt-1">{errors.pob}</p>
                  : <p class="text-[10px] text-on-surface-variant/60 mt-1">Pick the matching city from the list</p>}
                {pobSuggestions.value.length > 0 && (
                  <div class="absolute top-[68px] left-0 right-0 bg-white border border-outline-variant/30 rounded-xl shadow-2xl z-30 overflow-hidden max-h-52 overflow-y-auto">
                    {pobSuggestions.value.map((place, idx) => (
                      <div
                        key={idx}
                        class="px-4 py-3 hover:bg-surface-variant border-b border-outline-variant/10 cursor-pointer text-sm font-medium transition-colors text-on-surface"
                        onClick$={() => selectPob(place.description, place.place_id)}
                      >
                        {place.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onInput$={(e) => { form.email = (e.target as HTMLInputElement).value; if (errors.email) errors.email = ''; }}
                  onBlur$={() => (errors.email = validateEmail(form.email))}
                  class={`w-full bg-surface-container-low border rounded-xl px-4 py-3 outline-none text-sm focus:border-primary ${errors.email ? 'border-error' : 'border-outline-variant/30'}`}
                  placeholder="you@example.com"
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && <p class="text-[11px] font-semibold text-error mt-1">{errors.email}</p>}
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Date of Birth (optional)</label>
                <input
                  type="date"
                  value={form.dob}
                  max={new Date().toISOString().slice(0, 10)}
                  min="1900-01-01"
                  onInput$={(e) => (form.dob = (e.target as HTMLInputElement).value)}
                  class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm appearance-none"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Time of Birth (optional)</label>
                  <label class="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant cursor-pointer">
                    <input type="checkbox" checked={form.tob_unknown} onChange$={() => { form.tob_unknown = !form.tob_unknown; if (form.tob_unknown) form.tob = ''; }} class="w-3.5 h-3.5 rounded border-outline-variant/30" />
                    <span>I don't know</span>
                  </label>
                </div>
                <input
                  type="time"
                  step={60}
                  disabled={form.tob_unknown}
                  value={form.tob}
                  onInput$={(e) => (form.tob = (e.target as HTMLInputElement).value)}
                  class="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-3 outline-none text-sm appearance-none disabled:opacity-50"
                />
              </div>

              <label class="flex items-start gap-2 cursor-pointer pt-2 border-t border-outline-variant/20">
                <input type="checkbox" checked={form.email_subscribe} onChange$={() => { form.email_subscribe = !form.email_subscribe; }} class="mt-1 w-4 h-4 rounded border-outline-variant/30" />
                <span class="text-xs text-on-surface-variant leading-relaxed">
                  Send today's guidance to my email each morning. <span class="text-on-surface-variant/60">(needs your email)</span>
                </span>
              </label>

              <button
                onClick$={submit}
                disabled={submitting.value}
                class="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl active:scale-95 transition-transform text-sm uppercase tracking-widest disabled:opacity-60"
              >
                {submitting.value ? 'Unlocking…' : 'Unlock my Guidance'}
              </button>
              <p class="text-[10px] text-on-surface-variant/60 text-center">Free · One-time form · No payment ever asked</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
