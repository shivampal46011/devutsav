import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Whisper = () => {
    // Session Tracking
    const [userSessionId, setUserSessionId] = useState('');
    
    // UI States
    const [step, setStep] = useState(1); // 1: Form, 2: Loading/Hearing, 3: Tathastu/Success
    const [isRecording, setIsRecording] = useState(false);
    const [audioDataUrl, setAudioDataUrl] = useState(null);
    const [validationError, setValidationError] = useState('');
    
    // Form States
    const [formData, setFormData] = useState({
        name: '',
        isd_code: '+91',
        phone: '',
        email: '',
        gotra: '',
        wish_text: '',
        sankalp_taken: false
    });
    const [unknownGotra, setUnknownGotra] = useState(false);

    // Audio Refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        let storedId = localStorage.getItem('user_session_id');
        if (!storedId) {
            storedId = 'session_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('user_session_id', storedId);
        }
        setUserSessionId(storedId);

        // Track Page View
        trackClick('Whisper_Init');
    }, []);

    const trackClick = (ctaName) => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/tracking/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_session_id: userSessionId,
                url: window.location.pathname,
                cta: ctaName
            })
        }).catch(() => {}); // silent fail for tracking
    };

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- Audio Recording Logic ---
    const startRecording = async () => {
        try {
            setAudioDataUrl(null);
            audioChunksRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    setAudioDataUrl(reader.result); // Base64 string to simulate S3 upload
                };
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            trackClick('Audio_Record_Start');
        } catch (err) {
            alert('Microphone access denied or not supported.');
            console.error('Audio Record Error:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            trackClick('Audio_Record_Stop');
        }
    };

    // --- Submission Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        // Basic Validation
        if (!formData.name.trim()) return setValidationError("Name is required.");
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) return setValidationError("Invalid 10-digit phone number.");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) return setValidationError("Invalid Email format.");
        if (!formData.wish_text.trim() && !audioDataUrl) return setValidationError("Please write or record your wish.");

        trackClick('Whisper_Submit');
        setStep(2); // Nandi Hearing State

        const payload = {
            user_session_id: userSessionId,
            petitioner_name: formData.name,
            petitioner_phone: formData.phone,
            petitioner_email: formData.email,
            petitioner_gotra: unknownGotra ? 'Kashyap' : formData.gotra,
            wish_text: formData.wish_text,
            wish_audio: audioDataUrl,
            sankalp_taken: formData.sankalp_taken
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/whispers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Submission failed');
            
            // Wait 2 seconds for visual effect "Nandi is hearing"
            setTimeout(() => setStep(3), 2000);
            
        } catch (err) {
            console.error(err);
            setValidationError('Failed to connect to the cosmic oracle. Try again.');
            setStep(1);
        }
    };

    return (
        <main className="pb-32 relative bg-[#FDF9F5] min-h-screen">
            {step === 1 && (
                <>
                    <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
                        <img alt="Sacred Nandi" className="absolute inset-0 w-full h-full object-cover object-top" loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnR6FN-tLR55kZzBGt6Rh3hrntlALyMrZHeKhr8F3FCTMp-fiJzUwH37SqW6IFFk8401bmr7bzTmeqY_b2WUWeJXUUAdDdF-C2TJZfOZPOlz3ujJPPOZFQxhnX17LjK3aagm4FHJPHHF-8snJRDtP6wPnp2qGFqcjr_bq-GEvtafr-xeX6T9V8aI1XDlzudYL7a_ElELohKCIv7nUNulnOqyeLkJYdDCHyG28kzgqut47WT-P5gn8ARh1AnK-NilnD4I0E564y-yF0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF9F5] via-[#FDF9F5]/40 to-transparent"></div>
                        <div className="absolute bottom-10 left-0 right-0 p-6 text-center">
                            <h2 className="font-headline text-4xl md:text-5xl font-black text-on-surface leading-tight mb-2">
                                Nandi Whisper <span className="text-primary italic">Ritual</span>
                            </h2>
                            <p className="font-headline text-lg italic text-on-surface-variant max-w-lg mx-auto">
                                Speak your heart to Nandi, the ultimate carrier of wishes to Lord Shiva.
                            </p>
                        </div>
                    </section>

                    <section className="px-6 -mt-4 relative z-10 max-w-xl mx-auto space-y-8">
                        {validationError && (
                            <div className="bg-error/10 text-error text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">warning</span> {validationError}
                            </div>
                        )}

                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5 border border-primary/10">
                            {/* The Wish */}
                            <div className="mb-8">
                                <h3 className="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">record_voice_over</span>
                                    Your Wish
                                </h3>
                                
                                <div className="space-y-4">
                                    <textarea 
                                        name="wish_text" value={formData.wish_text} onChange={handleInput}
                                        className="w-full bg-surface-container-lowest border-2 border-outline-variant/30 focus:border-primary rounded-xl p-4 text-on-surface outline-none resize-none font-body"
                                        placeholder="Type your pure wish here..." rows="3"
                                    ></textarea>

                                    <div className="flex items-center gap-4">
                                        <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest w-full text-center">OR RECORD AUDIO</div>
                                    </div>

                                    <div className="flex flex-col items-center p-4 bg-tertiary-fixed rounded-xl border border-tertiary/20">
                                        {!isRecording ? (
                                            <button onClick={startRecording} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform text-tertiary hover:bg-tertiary hover:text-white group">
                                                <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>mic</span>
                                            </button>
                                        ) : (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-error/20 rounded-full animate-ping"></div>
                                                <button onClick={stopRecording} className="relative z-10 w-14 h-14 bg-error text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                                                    <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>stop</span>
                                                </button>
                                            </div>
                                        )}
                                        {audioDataUrl && !isRecording && (
                                            <span className="text-xs font-bold text-tertiary mt-3 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">check_circle</span> Audio Attached
                                            </span>
                                        )}
                                        {isRecording && <span className="text-xs font-bold text-error mt-3 animate-pulse">Recording... Click to Stop</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Personal Details */}
                            <div className="space-y-5">
                                <h3 className="font-headline text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                    Petitioner Details
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Name *</label>
                                    <input name="name" value={formData.name} onChange={handleInput} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3" placeholder="Devotee Name" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="flex gap-2">
                                        <div className="w-1/3">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">ISD</label>
                                            <input name="isd_code" value={formData.isd_code} onChange={handleInput} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-3 text-center" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Phone *</label>
                                            <input name="phone" value={formData.phone} onChange={handleInput} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-3" placeholder="10 Digits" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email *</label>
                                        <input name="email" value={formData.email} onChange={handleInput} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3" placeholder="email@example.com" />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Gotra</label>
                                    <input disabled={unknownGotra} name="gotra" value={unknownGotra ? 'Kashyap' : formData.gotra} onChange={handleInput} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 disabled:opacity-60 disabled:bg-surface-container" placeholder="e.g. Bharadwaj" />
                                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                        <input type="checkbox" checked={unknownGotra} onChange={(e) => setUnknownGotra(e.target.checked)} className="w-4 h-4 text-primary rounded border-outline-variant/40 focus:ring-primary" />
                                        <span className="text-sm text-on-surface-variant font-medium">I don't know my Gotra (Defaults to Kashyap)</span>
                                    </label>
                                </div>

                                <div className="pt-4 border-t border-outline-variant/10">
                                    <label className="flex items-start gap-3 cursor-pointer p-4 bg-secondary-fixed rounded-2xl border border-secondary/20">
                                        <input type="checkbox" name="sankalp_taken" checked={formData.sankalp_taken} onChange={handleInput} className="w-5 h-5 mt-0.5 text-secondary rounded border-outline-variant/40 focus:ring-secondary" />
                                        <div>
                                            <span className="text-sm text-on-secondary-fixed font-bold block mb-1">Take Digital Sankalp (Optional)</span>
                                            <span className="text-xs text-on-secondary-fixed/80 leading-relaxed block">A vow to offer gratitude upon fulfillment. Elevates the spiritual sanctity of the ritual.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSubmit} className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg rounded-xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-transform hover:shadow-primary/40">
                            Transmit Wish to Nandi <span className="text-2xl">🐂</span>
                        </button>
                    </section>
                </>
            )}

            {step === 2 && (
                <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
                    <div className="relative w-48 h-48 mb-8 rounded-full overflow-hidden shadow-2xl shadow-primary/20 border-4 border-white">
                        <img alt="Nandi Listening" className="absolute inset-0 w-full h-full object-cover animate-pulse" loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnR6FN-tLR55kZzBGt6Rh3hrntlALyMrZHeKhr8F3FCTMp-fiJzUwH37SqW6IFFk8401bmr7bzTmeqY_b2WUWeJXUUAdDdF-C2TJZfOZPOlz3ujJPPOZFQxhnX17LjK3aagm4FHJPHHF-8snJRDtP6wPnp2qGFqcjr_bq-GEvtafr-xeX6T9V8aI1XDlzudYL7a_ElELohKCIv7nUNulnOqyeLkJYdDCHyG28kzgqut47WT-P5gn8ARh1AnK-NilnD4I0E564y-yF0" />
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
                    </div>
                    <h2 className="font-headline text-3xl font-bold text-primary mb-3">Nandi is listening...</h2>
                    <div className="flex justify-center gap-1.5 mb-8">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></span>
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-100"></span>
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-200"></span>
                    </div>
                    <p className="text-on-surface-variant italic">Transmitting your cosmic desire.</p>
                </section>
            )}

            {step === 3 && (
                <section className="px-6 pt-16 max-w-2xl mx-auto space-y-12 animate-fade-in">
                    <div className="bg-surface-container rounded-3xl p-8 md:p-12 text-center shadow-xl shadow-primary/10 border border-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary to-primary"></div>
                        <h2 className="font-headline text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6">
                            Tathastu!
                        </h2>
                        <p className="font-body text-lg text-on-surface-variant leading-relaxed mb-8">
                            Nandi has accepted your wish. Through his divine grace, it shall reach the cosmos. 
                            <strong> Stay devoted.</strong>
                        </p>

                        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 mb-8 inline-block w-full">
                            <span className="material-symbols-outlined text-4xl text-secondary mb-3">notification_important</span>
                            <h4 className="font-headline text-lg font-bold text-on-surface mb-2">Cosmic Reminder</h4>
                            <p className="text-sm text-on-surface-variant mb-4">
                                When your wish is fulfilled, you must return and share your joy. A grateful heart attracts endless blessings.
                            </p>
                            <button className="w-full py-3 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-xl active:scale-95 transition-transform text-sm">
                                Set Fulfillment Reminder
                            </button>
                        </div>
                    </div>

                    {/* Prominent Temples CTA / DevPunya */}
                    <div className="bg-[#FFF4ED] rounded-3xl p-8 border border-[#FFBA8A] shadow-lg relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/40 rounded-full blur-2xl"></div>
                        <div className="flex-1 z-10 text-center md:text-left">
                            <h3 className="font-headline text-2xl font-bold text-[#A84A00] mb-2">Amplify Your Prayers</h3>
                            <p className="text-[#6D3600] text-sm leading-relaxed mb-6">
                                Offer Chadhawa physically at India's most prominent temples (Kashi Vishwanath, Mahakaleshwar, etc.) via the <strong>DevPunya App</strong>.
                            </p>
                            <a href="https://devpunya.example.com" onClick={() => trackClick('DevPunya_Affiliate')} target="_blank" rel="noopener noreferrer" className="inline-block py-3 px-6 bg-[#A84A00] text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform text-sm uppercase tracking-widest">
                                Download DevPunya
                            </a>
                        </div>
                        <div className="w-24 h-24 md:w-32 md:w-32 shrink-0 bg-white rounded-2xl shadow border border-[#FFBA8A] overflow-hidden flex items-center justify-center p-2 z-10">
                           <img alt="DevPunya Icon" loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDat1XnHmYaIoTuCHH0QDkjeSfeNPq5X-GCFUskPfoVu2tuTIyJie2CzNUW-Jmuzj3rG4XO79zDrjw_XhoKmgoV0j6skPoZT5dr40Qlu5tlLDDs7fKK4NAN4F-wAvCMvritqyv3iq7pplQXjUCD9-MrWA8OkdC5tHZHBxWiWnC-0iFcjIkawJZF7pp2OQdRSGxGcaX8oeFzbVADI9z7qnyJkQ5OUaHDfakuZsClIjg2brBFzBe-MVWglJzwysFh2-0e8cfty4Ue5eTh" className="w-full h-full object-cover rounded-xl" />
                        </div>
                    </div>

                     {/* Prakul's Story Section */}
                     <div className="text-center pt-8 opacity-80">
                        <span className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant block mb-4">The Origin</span>
                        <div className="bg-surface-container-low max-w-xl mx-auto rounded-2xl p-6 text-left border border-outline-variant/20 italic text-sm text-on-surface-variant leading-relaxed">
                            "Before any major milestone in my life, I whispered my deepest desires into the ears of Nandi. That unquestionable faith turned every obstacle into an opportunity. This digital portal is born from my personal journey, aiming to connect every seeker with that exact same divine pipeline." — <strong>Prakul</strong>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
};

export default Whisper;
