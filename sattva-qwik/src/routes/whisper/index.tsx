import { component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const step = useSignal(1);
  const isRecording = useSignal(false);
  const audioDataUrl = useSignal<string | null>(null);
  const validationError = useSignal('');
  const sessionId = useSignal('');
  const mediaRecorderRef = useSignal<MediaRecorder | null>(null);
  const audioChunks = useSignal<Blob[]>([]);

  const form = useStore({
    name: '', isd_code: '+91', phone: '', wish_text: '',
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

          <section class="max-w-6xl mx-auto w-full mt-8 px-6 pb-24 relative z-10 space-y-12">
            {/* Personal Details */}
            <div>
              <h2 class="font-headline text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">person</span> Petitioner Details
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                  <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3">Name *</label>
                  <input value={form.name} onInput$={(e) => (form.name = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow" placeholder="Devotee Name" />
                </div>
                <div class="flex gap-4">
                  <div class="w-[30%]">
                    <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3">ISD</label>
                    <input value={form.isd_code} onInput$={(e) => (form.isd_code = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow" />
                  </div>
                  <div class="flex-1">
                    <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3">Phone *</label>
                    <input value={form.phone} onInput$={(e) => (form.phone = (e.target as HTMLInputElement).value)} class="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-6 py-5 text-on-surface text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-shadow" placeholder="10 Digits" />
                  </div>
                </div>
              </div>
            </div>

            {/* Wish */}
            <div class="pt-8 border-t border-outline-variant/20">
              <h2 class="font-headline text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">record_voice_over</span> Your Wish
              </h2>
              <div class="space-y-8">
                <textarea
                  value={form.wish_text}
                  onInput$={(e) => (form.wish_text = (e.target as HTMLTextAreaElement).value)}
                  class="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/50 rounded-2xl p-6 text-on-surface text-lg outline-none resize-none font-body transition-shadow shadow-sm"
                  placeholder="Type your pure wish here..." rows={4}
                />
                <div class="flex items-center justify-center gap-4">
                  <div class="h-px bg-outline-variant/30 flex-1"></div>
                  <div class="text-sm font-bold text-on-surface-variant uppercase tracking-widest">OR RECORD AUDIO</div>
                  <div class="h-px bg-outline-variant/30 flex-1"></div>
                </div>
                <div class="flex flex-col items-center justify-center p-8 bg-surface-container-low rounded-[2rem] border border-outline-variant/20 w-full shadow-sm">
                  {!isRecording.value ? (
                    <button
                      onClick$={async () => {
                        audioDataUrl.value = null; audioChunks.value = [];
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const options = { audioBitsPerSecond: 16000 };
                        let recorder: MediaRecorder;
                        try { recorder = new MediaRecorder(stream, options); }
                        catch (e) { recorder = new MediaRecorder(stream); }

                        const chunks: Blob[] = [];
                        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
                        recorder.onstop = () => {
                          const blob = new Blob(chunks, { type: 'audio/webm' });
                          const reader = new FileReader();
                          reader.readAsDataURL(blob);
                          reader.onloadend = () => { audioDataUrl.value = reader.result as string; };
                          stream.getTracks().forEach(t => t.stop());
                          // State sync in case of auto-timeout
                          isRecording.value = false;
                        };
                        recorder.start();
                        mediaRecorderRef.value = recorder;
                        audioChunks.value = chunks;
                        isRecording.value = true;

                        // 2 minutes auto-stop limit
                        setTimeout(() => {
                          if (recorder && recorder.state === 'recording') {
                            recorder.stop();
                          }
                        }, 120000);
                      }}
                      class="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform text-white hover:opacity-90"
                    >
                      <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1">mic</span>
                    </button>
                  ) : (
                    <div class="relative">
                      <div class="absolute inset-0 bg-error/20 rounded-full animate-ping" />
                      <button
                        onClick$={() => { mediaRecorderRef.value?.stop(); isRecording.value = false; }}
                        class="relative z-10 w-20 h-20 bg-error text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                      >
                        <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1">stop</span>
                      </button>
                    </div>
                  )}
                  {audioDataUrl.value && !isRecording.value && (
                    <span class="text-sm font-bold text-primary mt-6 flex items-center gap-2 bg-primary/10 px-6 py-2 rounded-full shadow-sm">
                      <span class="material-symbols-outlined text-sm">check_circle</span> Audio Attached
                    </span>
                  )}
                  {isRecording.value && <span class="text-sm font-bold text-error mt-6 animate-pulse">Recording... Click to Stop</span>}
                </div>
              </div>
            </div>

            <div class="pt-8 flex justify-end w-full border-t border-outline-variant/20 mt-12">
              <button
                onClick$={async () => {
                  validationError.value = '';
                  if (!form.name.trim()) { validationError.value = 'Name is required.'; setTimeout(() => validationError.value = '', 4000); return; }
                  if (!/^[0-9]{10}$/.test(form.phone)) { validationError.value = 'Invalid 10-digit phone number.'; setTimeout(() => validationError.value = '', 4000); return; }
                  if (!form.wish_text.trim() && !audioDataUrl.value) { validationError.value = 'Please write or record your wish.'; setTimeout(() => validationError.value = '', 4000); return; }
                  step.value = 2;
                  try {
                    const api = import.meta.env.PUBLIC_API_URL || 'http://localhost:5001';
                    const res = await fetch(`${api}/api/whispers`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ user_session_id: sessionId.value, petitioner_name: form.name, petitioner_phone: form.phone, wish_text: form.wish_text, wish_audio: audioDataUrl.value }),
                    });
                    if (!res.ok) throw new Error('Submission failed');
                    setTimeout(() => (step.value = 3), 2000);
                  } catch {
                    validationError.value = 'Failed to connect to the cosmic oracle. Try again.';
                    setTimeout(() => validationError.value = '', 4000);
                    step.value = 1;
                  }
                }}
                class="px-12 py-5 bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                Transmit Wish to Nandi <span class="text-2xl">🐂</span>
              </button>
            </div>
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
        <section class="max-w-5xl mx-auto w-full mt-10 px-6 pb-24 space-y-12">
          {/* Main Hero Success */}
          <div class="text-center space-y-4 mb-16 pt-4">
            <div class="w-full max-w-5xl h-[300px] md:h-[450px] mx-auto mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 border border-outline-variant/30 relative bg-surface-container-highest">
              <video 
                src={`${import.meta.env.PUBLIC_API_URL || 'http://localhost:5001'}/public/Video_Caption_Removal_Service_Final.mp4`}
                autoPlay 
                loop 
                muted 
                playsInline 
                class="w-full h-full object-cover absolute inset-0"
              />
            </div>
            <h2 class="font-headline text-4xl md:text-5xl font-black text-on-surface">Your Wish Has Been Received</h2>
            <p class="font-body text-xl text-on-surface-variant italic max-w-2xl mx-auto mt-4">
              Nandi is carrying your prayer to Shiva. Trust the process.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-stretch">
            {/* INFO Section */}
            <div class="flex flex-col h-full border-b md:border-b-0 md:border-r border-outline-variant/20 pb-12 md:pb-0 md:pr-16">
              <div class="flex items-center gap-3 mb-6">
                <span class="material-symbols-outlined text-4xl text-secondary">psychology</span>
                <h3 class="font-headline text-3xl font-bold text-on-surface">What Happens Now?</h3>
              </div>
              <div class="space-y-6 text-on-surface-variant leading-relaxed text-lg mb-10">
                <p>Your wish has become a <strong class="text-primary font-bold">Sankalp</strong> — a focused intention.</p>
                <p>With faith and right action, it begins to shape your path.</p>
                <div class="bg-secondary/10 px-6 py-5 rounded-2xl italic font-medium text-secondary-fixed-dim border border-secondary/10">
                  Stay calm. Stay aligned. Keep taking real-world steps.
                </div>
              </div>

              {/* WHAT YOU SHOULD DO */}
              <div class="mt-auto">
                <div class="flex items-center gap-3 mb-6">
                  <span class="material-symbols-outlined text-4xl text-primary">self_improvement</span>
                  <h3 class="font-headline text-3xl font-bold text-on-surface">What You Should Do</h3>
                </div>
                <div class="bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm">
                  <p class="text-on-surface-variant font-bold mb-4 uppercase tracking-widest text-sm text-center flex items-center justify-center gap-2"><span class="w-8 h-px bg-outline-variant/30"></span> Chant Mantra <span class="w-8 h-px bg-outline-variant/30"></span></p>
                  <ul class="space-y-3 font-medium text-lg text-primary">
                    <li class="flex justify-between items-center bg-surface-container-lowest px-5 py-4 rounded-2xl border border-outline-variant/10 shadow-sm">
                      <span class="font-['Noto_Serif'] italic tracking-wide">Om Nandaye Namaha</span>
                      <span class="bg-primary/10 text-primary px-3 py-1 rounded-xl text-sm font-black tracking-widest">x1</span>
                    </li>
                    <li class="flex justify-between items-center bg-surface-container-lowest px-5 py-4 rounded-2xl border border-outline-variant/10 shadow-sm">
                      <span class="font-['Noto_Serif'] italic tracking-wide">Om Namah Shivay</span>
                      <span class="bg-primary/10 text-primary px-3 py-1 rounded-xl text-sm font-black tracking-widest">x5</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* STRENGTHENING HOOK Section */}
            <div class="flex flex-col h-full">
              <div class="flex items-center gap-3 mb-6">
                <span class="material-symbols-outlined text-4xl text-tertiary">local_florist</span>
                <h3 class="font-headline text-3xl font-bold text-on-surface">Strengthen Your Wish</h3>
              </div>
              <p class="text-on-surface-variant leading-relaxed text-lg mb-8">
                Devotees believe that giving back after asking increases the power of your prayer.
              </p>
              
              {/* Gau Seva Offer Box */}
              <div class="mt-auto bg-gradient-to-br from-tertiary/10 to-primary/5 rounded-3xl p-8 border border-tertiary/20 relative overflow-hidden">
                <div class="absolute -right-4 -top-4 opacity-10 pointer-events-none">
                  <span class="text-9xl">🐄</span>
                </div>
                <h4 class="font-headline text-2xl font-black text-tertiary mb-6 flex items-center gap-2 relative z-10">
                  <span>🐄</span> Complete Your Ritual with Gau Seva
                </h4>
                <ul class="space-y-4 mb-8 relative z-10">
                  <li class="flex items-start gap-3 text-lg text-on-surface-variant font-medium">
                    <span class="material-symbols-outlined text-tertiary mt-0.5">verified</span> Feed sacred cows on your behalf
                  </li>
                  <li class="flex items-start gap-3 text-lg text-on-surface-variant font-medium">
                    <span class="material-symbols-outlined text-tertiary mt-0.5">verified</span> Done with proper devotion
                  </li>
                  <li class="flex items-start gap-3 text-lg text-on-surface-variant font-medium">
                    <span class="material-symbols-outlined text-tertiary mt-0.5">verified</span> Supports your wish intention
                  </li>
                </ul>

                <div class="relative z-10 pt-4">
                  <a href="https://devpunya.com/chadhaava/v2/15?utm_content=DevUtsav&affiliate_id=34180" target="_blank" rel="noopener noreferrer" class="block w-full text-center py-5 bg-gradient-to-r from-tertiary to-tertiary-container text-white font-bold text-xl rounded-2xl shadow-xl hover:-translate-y-1 active:scale-95 transition-transform uppercase tracking-widest">
                    👉 Complete My Ritual
                  </a>
                  <p class="text-center text-sm text-tertiary font-bold mt-5 flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-base">videocam</span> Receive video proof with your name
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Toast Notification */}
      {validationError.value && (
        <div class="fixed bottom-[100px] md:bottom-12 left-1/2 -translate-x-1/2 bg-error text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(182,23,30,0.3)] flex items-center gap-3 z-50">
          <span class="material-symbols-outlined text-xl">error</span>
          <span class="font-bold text-sm tracking-wide">{validationError.value}</span>
          <button onClick$={() => validationError.value = ''} class="ml-2 flex items-center hover:bg-white/20 p-1 rounded-full transition-colors">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
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
