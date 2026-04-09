import { component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const step = useSignal(1);
  const isRecording = useSignal(false);
  const audioDataUrl = useSignal<string | null>(null);
  const validationError = useSignal('');
  const unknownGotra = useSignal(false);
  const sessionId = useSignal('');
  const mediaRecorderRef = useSignal<MediaRecorder | null>(null);
  const audioChunks = useSignal<Blob[]>([]);

  const form = useStore({
    name: '', isd_code: '+91', phone: '', email: '',
    gotra: '', wish_text: '', sankalp_taken: false,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    let id = localStorage.getItem('user_session_id');
    if (!id) { id = 'session_' + Math.random().toString(36).substring(2, 15); localStorage.setItem('user_session_id', id); }
    sessionId.value = id;
  });

  return (
    <main class="pb-32 relative bg-[#FDF9F5] min-h-screen">
      {step.value === 1 && (
        <>
          <section class="relative h-[400px] md:h-[500px] w-full overflow-hidden">
            <img alt="Sacred Nandi" class="absolute inset-0 w-full h-full object-cover object-top" width={800} height={500} loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnR6FN-tLR55kZzBGt6Rh3hrntlALyMrZHeKhr8F3FCTMp-fiJzUwH37SqW6IFFk8401bmr7bzTmeqY_b2WUWeJXUUAdDdF-C2TJZfOZPOlz3ujJPPOZFQxhnX17LjK3aagm4FHJPHHF-8snJRDtP6wPnp2qGFqcjr_bq-GEvtafr-xeX6T9V8aI1XDlzudYL7a_ElELohKCIv7nUNulnOqyeLkJYdDCHyG28kzgqut47WT-P5gn8ARh1AnK-NilnD4I0E564y-yF0" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#FDF9F5] via-[#FDF9F5]/40 to-transparent" />
            <div class="absolute bottom-10 left-0 right-0 p-6 text-center">
              <h1 class="font-headline text-4xl md:text-5xl font-black text-on-surface leading-tight mb-2">
                Nandi Whisper <span class="text-primary italic">Ritual</span>
              </h1>
              <p class="font-headline text-lg italic text-on-surface-variant max-w-lg mx-auto">
                Speak your heart to Nandi, the ultimate carrier of wishes to Lord Shiva.
              </p>
            </div>
          </section>

          <section class="px-6 -mt-4 relative z-10 max-w-xl mx-auto space-y-8">
            {validationError.value && (
              <div class="bg-error/10 text-error text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">warning</span> {validationError.value}
              </div>
            )}

            <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5 border border-primary/10">
              {/* Wish */}
              <div class="mb-8">
                <h2 class="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">record_voice_over</span> Your Wish
                </h2>
                <div class="space-y-4">
                  <textarea
                    value={form.wish_text}
                    onInput$={(e) => (form.wish_text = (e.target as HTMLTextAreaElement).value)}
                    class="w-full bg-surface-container-lowest border-2 border-outline-variant/30 focus:border-primary rounded-xl p-4 text-on-surface outline-none resize-none font-body"
                    placeholder="Type your pure wish here..." rows={3}
                  />
                  <div class="text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center">OR RECORD AUDIO</div>
                  <div class="flex flex-col items-center p-4 bg-tertiary-fixed rounded-xl border border-tertiary/20">
                    {!isRecording.value ? (
                      <button
                        onClick$={async () => {
                          audioDataUrl.value = null; audioChunks.value = [];
                          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                          const recorder = new MediaRecorder(stream);
                          const chunks: Blob[] = [];
                          recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
                          recorder.onstop = () => {
                            const blob = new Blob(chunks, { type: 'audio/webm' });
                            const reader = new FileReader();
                            reader.readAsDataURL(blob);
                            reader.onloadend = () => { audioDataUrl.value = reader.result as string; };
                            stream.getTracks().forEach(t => t.stop());
                          };
                          recorder.start();
                          mediaRecorderRef.value = recorder;
                          audioChunks.value = chunks;
                          isRecording.value = true;
                        }}
                        class="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform text-tertiary hover:bg-tertiary hover:text-white"
                      >
                        <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1">mic</span>
                      </button>
                    ) : (
                      <div class="relative">
                        <div class="absolute inset-0 bg-error/20 rounded-full animate-ping" />
                        <button
                          onClick$={() => { mediaRecorderRef.value?.stop(); isRecording.value = false; }}
                          class="relative z-10 w-14 h-14 bg-error text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                        >
                          <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1">stop</span>
                        </button>
                      </div>
                    )}
                    {audioDataUrl.value && !isRecording.value && (
                      <span class="text-xs font-bold text-tertiary mt-3 flex items-center gap-1">
                        <span class="material-symbols-outlined text-xs">check_circle</span> Audio Attached
                      </span>
                    )}
                    {isRecording.value && <span class="text-xs font-bold text-error mt-3 animate-pulse">Recording... Click to Stop</span>}
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div class="space-y-5">
                <h2 class="font-headline text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">person</span> Petitioner Details
                </h2>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Name *</label>
                  <input value={form.name} onInput$={(e) => (form.name = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3" placeholder="Devotee Name" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="flex gap-2">
                    <div class="w-1/3">
                      <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">ISD</label>
                      <input value={form.isd_code} onInput$={(e) => (form.isd_code = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-3 text-center" />
                    </div>
                    <div class="flex-1">
                      <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Phone *</label>
                      <input value={form.phone} onInput$={(e) => (form.phone = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-3" placeholder="10 Digits" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email *</label>
                    <input value={form.email} onInput$={(e) => (form.email = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3" placeholder="email@example.com" />
                  </div>
                </div>
                <div class="pt-2">
                  <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Gotra</label>
                  <input disabled={unknownGotra.value} value={unknownGotra.value ? 'Kashyap' : form.gotra} onInput$={(e) => (form.gotra = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 disabled:opacity-60 disabled:bg-surface-container" placeholder="e.g. Bharadwaj" />
                  <label class="flex items-center gap-2 mt-3 cursor-pointer">
                    <input type="checkbox" checked={unknownGotra.value} onChange$={() => (unknownGotra.value = !unknownGotra.value)} class="w-4 h-4 text-primary rounded" />
                    <span class="text-sm text-on-surface-variant font-medium">I don't know my Gotra (Defaults to Kashyap)</span>
                  </label>
                </div>
                <div class="pt-4 border-t border-outline-variant/10">
                  <label class="flex items-start gap-3 cursor-pointer p-4 bg-secondary-fixed rounded-2xl border border-secondary/20">
                    <input type="checkbox" checked={form.sankalp_taken} onChange$={() => (form.sankalp_taken = !form.sankalp_taken)} class="w-5 h-5 mt-0.5 text-secondary rounded" />
                    <div>
                      <span class="text-sm text-on-secondary-fixed font-bold block mb-1">Take Digital Sankalp (Optional)</span>
                      <span class="text-xs text-on-secondary-fixed/80 leading-relaxed block">A vow to offer gratitude upon fulfillment. Elevates the spiritual sanctity of the ritual.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick$={async () => {
                validationError.value = '';
                if (!form.name.trim()) { validationError.value = 'Name is required.'; return; }
                if (!/^[0-9]{10}$/.test(form.phone)) { validationError.value = 'Invalid 10-digit phone number.'; return; }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { validationError.value = 'Invalid Email format.'; return; }
                if (!form.wish_text.trim() && !audioDataUrl.value) { validationError.value = 'Please write or record your wish.'; return; }
                step.value = 2;
                try {
                  const api = import.meta.env.PUBLIC_API_URL || 'http://localhost:5001';
                  const res = await fetch(`${api}/api/whispers`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_session_id: sessionId.value, petitioner_name: form.name, petitioner_phone: form.phone, petitioner_email: form.email, petitioner_gotra: unknownGotra.value ? 'Kashyap' : form.gotra, wish_text: form.wish_text, wish_audio: audioDataUrl.value, sankalp_taken: form.sankalp_taken }),
                  });
                  if (!res.ok) throw new Error('Submission failed');
                  setTimeout(() => (step.value = 3), 2000);
                } catch {
                  validationError.value = 'Failed to connect to the cosmic oracle. Try again.';
                  step.value = 1;
                }
              }}
              class="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg rounded-xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              Transmit Wish to Nandi <span class="text-2xl">🐂</span>
            </button>
          </section>
        </>
      )}

      {step.value === 2 && (
        <section class="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <div class="relative w-48 h-48 mb-8 rounded-full overflow-hidden shadow-2xl shadow-primary/20 border-4 border-white">
            <img alt="Nandi Listening" class="absolute inset-0 w-full h-full object-cover animate-pulse" width={192} height={192} loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnR6FN-tLR55kZzBGt6Rh3hrntlALyMrZHeKhr8F3FCTMp-fiJzUwH37SqW6IFFk8401bmr7bzTmeqY_b2WUWeJXUUAdDdF-C2TJZfOZPOlz3ujJPPOZFQxhnX17LjK3aagm4FHJPHHF-8snJRDtP6wPnp2qGFqcjr_bq-GEvtafr-xeX6T9V8aI1XDlzudYL7a_ElELohKCIv7nUNulnOqyeLkJYdDCHyG28kzgqut47WT-P5gn8ARh1AnK-NilnD4I0E564y-yF0" />
            <div class="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
          </div>
          <h2 class="font-headline text-3xl font-bold text-primary mb-3">Nandi is listening...</h2>
          <div class="flex justify-center gap-1.5 mb-8">
            <span class="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
            <span class="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-100" />
            <span class="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-200" />
          </div>
          <p class="text-on-surface-variant italic">Transmitting your cosmic desire.</p>
        </section>
      )}

      {step.value === 3 && (
        <section class="px-6 pt-16 max-w-2xl mx-auto space-y-12">
          <div class="bg-surface-container rounded-3xl p-8 md:p-12 text-center shadow-xl shadow-primary/10 border border-primary/20 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary to-primary" />
            <h2 class="font-headline text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6">Tathastu!</h2>
            <p class="font-body text-lg text-on-surface-variant leading-relaxed mb-8">
              Nandi has accepted your wish. Through his divine grace, it shall reach the cosmos. <strong>Stay devoted.</strong>
            </p>
            <div class="bg-white p-6 rounded-2xl border border-outline-variant/20 mb-8 inline-block w-full">
              <span class="material-symbols-outlined text-4xl text-secondary mb-3">notification_important</span>
              <h3 class="font-headline text-lg font-bold text-on-surface mb-2">Cosmic Reminder</h3>
              <p class="text-sm text-on-surface-variant mb-4">When your wish is fulfilled, you must return and share your joy. A grateful heart attracts endless blessings.</p>
              <button class="w-full py-3 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-xl active:scale-95 transition-transform text-sm">Set Fulfillment Reminder</button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Nandi Whisper Ritual — Devutsav',
  meta: [
    { name: 'description', content: 'Transmit your deepest wishes to Lord Shiva through the sacred Nandi Whisper ritual. Record or type your prayer on Devutsav.' },
    { property: 'og:title', content: 'Nandi Whisper Ritual — Devutsav' },
  ],
};
