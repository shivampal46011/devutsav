import React, { useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const SPIRITUAL_REMEDIES = [
    {
        emoji: '🔥',
        title: 'Recommended Puja',
        subtitle: 'Online Puja via Verified Pandits',
        note: 'Puja Video Proof received with Name-Gotra',
        badge: 'Recommended',
        badgeClass: 'bg-green-50 text-green-600 border-green-200',
        cta: 'Book Puja',
        ctaClass: 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600',
        link: 'https://devpunya.com/online-puja?utm_content=DevUtsav&affiliate_id=34180'
    },
    {
        emoji: '🪔',
        title: 'Recommended Chadhawa',
        subtitle: 'Sacred Offerings at Temple',
        note: 'Chadhawa Video Proof received with Name-Gotra',
        badge: 'Recommended',
        badgeClass: 'bg-green-50 text-green-600 border-green-200',
        cta: 'Book Chadhawa',
        ctaClass: 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600',
        link: 'https://devpunya.com/chadhaava?affiliate_id=34180'
    },
    {
        emoji: '🐄',
        title: 'Gau Seva & Service',
        subtitle: 'Feed & Serve Sacred Cows',
        note: 'An act of deep compassion and karmic healing',
        badge: 'Offer',
        badgeClass: 'bg-amber-50 text-amber-600 border-amber-200',
        cta: 'Offer Now',
        ctaClass: 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500',
        link: 'https://devpunya.com/chadhaava/v2/15?utm_content=DevUtsav&affiliate_id=34180'
    }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getSeverityMeta = (pct) => {
    if (pct <= 30) return { label: 'Low', ringColor: '#22c55e', badgeCls: 'bg-green-50 text-green-700 border-green-200', borderCls: 'border-green-200', barCls: 'bg-green-400' };
    if (pct <= 70) return { label: 'Medium', ringColor: '#f59e0b', badgeCls: 'bg-amber-50 text-amber-700 border-amber-200', borderCls: 'border-amber-200', barCls: 'bg-amber-400' };
    return { label: 'High', ringColor: '#ef4444', badgeCls: 'bg-red-50 text-red-700 border-red-200', borderCls: 'border-red-200', barCls: 'bg-red-400' };
};

const SvgRing = ({ pct, color }) => {
    const r = 20;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r={r} stroke="#f3f4f6" strokeWidth="3.5" fill="none" />
                <circle cx="24" cy="24" r={r} stroke={color} strokeWidth="3.5" fill="none"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-gray-700">{pct}%</span>
        </div>
    );
};

const Chevron = ({ open }) => (
    <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ─── Dosha Summary Chip ───────────────────────────────────────────────────────
const DoshaChip = ({ dosha, active, onClick }) => {
    const { label, badgeCls } = getSeverityMeta(dosha.severity_percentage);
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all duration-150 ${
                active ? 'ring-2 ring-orange-400 border-orange-300 bg-orange-50/60' : 'border-gray-200 bg-white hover:border-orange-200'
            }`}
        >
            <span className="text-lg leading-none">🪐</span>
            <div className="min-w-0">
                <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">{dosha.name}</p>
                <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-full uppercase tracking-wide ${badgeCls}`}>{label}</span>
            </div>
        </button>
    );
};

// ─── Accordion ────────────────────────────────────────────────────────────────
const Block = ({ title, children, defaultOpen }) => {
    const [open, setOpen] = useState(defaultOpen ?? false);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm mb-3">
            <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 gap-2">
                <span className="text-orange-600 font-bold text-[15px] text-left">{title}</span>
                <span className="text-orange-400 shrink-0"><Chevron open={open} /></span>
            </button>
            {open && <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{children}</div>}
        </div>
    );
};

// ─── What You Can Do Section ─────────────────────────────────────────────────
const WhatYouCanDo = ({ daily_actions }) => {
    if (!daily_actions?.points?.length) return null;
    return (
        <div className="mt-4 mb-2">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black text-gray-900">{daily_actions.title ?? 'What You Can Do'}</h3>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50/60 rounded-2xl border border-orange-100 p-5 space-y-3">
                {daily_actions.points.map((pt, i) => (
                    <div key={i} className="flex gap-3 items-start">
                        <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-gray-700 leading-relaxed">{pt}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Spiritual Remedies Section ───────────────────────────────────────────────
const SpiritualRemedies = () => {
    const [open, setOpen] = useState(true);
    return (
        <div className="mt-6">
            <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between mb-4 px-1">
                <h3 className="text-lg font-black text-gray-900">Spiritual Remedies</h3>
                <span className="text-gray-400"><Chevron open={open} /></span>
            </button>
            {open && (
                <div className="space-y-3">
                    {SPIRITUAL_REMEDIES.map((r, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-2xl leading-none shrink-0">{r.emoji}</span>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 text-[15px] leading-tight">{r.title}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{r.subtitle}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 ${r.badgeClass}`}>{r.badge}</span>
                            </div>

                            {/* Note */}
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
                                <svg className="w-3.5 h-3.5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                {r.note}
                            </div>

                            <a
                                href={r.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block w-full text-center text-white font-bold py-3 rounded-xl text-sm shadow-md transition-transform active:scale-95 ${r.ctaClass}`}
                            >
                                {r.cta}
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const DoshaResults = ({ report }) => {
    const [activeIdx, setActiveIdx] = useState(0);

    if (!report || !report.doshas || report.doshas.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm border border-gray-100 max-w-md mx-auto">
                <span className="material-symbols-outlined text-5xl text-green-500 mb-3">verified</span>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Cosmic Harmony Detected</h3>
                <p className="text-gray-500 text-sm">No doshas found in your chart. Your planetary alignment is balanced.</p>
            </div>
        );
    }

    const { summary, doshas } = report;
    const active = doshas[activeIdx];
    const meta = getSeverityMeta(active.severity_percentage);

    const overallSev = summary?.overall_severity ?? 'low';
    const overallColor = overallSev === 'high' ? 'text-red-500' : overallSev === 'medium' ? 'text-amber-500' : 'text-green-500';

    return (
        <div className="w-full max-w-lg mx-auto">
            {/* ── Header ── */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm px-6 py-5 mb-5">
                <div className="flex justify-center mb-4">
                    <span className="bg-orange-50 border border-orange-200 text-orange-600 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Analysis Completed
                    </span>
                </div>
                <h2 className="text-[26px] font-black text-center text-gray-900 mb-5">Your Dosha Report</h2>

                {/* Summary Stats */}
                <div className="flex justify-center gap-10 text-center mb-5">
                    <div>
                        <p className="text-3xl font-black text-gray-900">{summary?.total_doshas ?? doshas.length}</p>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Doshas Found</p>
                    </div>
                    <div className="w-px bg-gray-100" />
                    <div>
                        <p className={`text-3xl font-black capitalize ${overallColor}`}>{overallSev}</p>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Overall Severity</p>
                    </div>
                </div>

                {/* Dosha Chips — scroll horizontally if many */}
                {doshas.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                        {doshas.map((d, i) => (
                            <DoshaChip key={i} dosha={d} active={i === activeIdx} onClick={() => setActiveIdx(i)} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Active Dosha Detail ── */}
            <div className="bg-white rounded-[1.5rem] border shadow-sm overflow-hidden mb-4" style={{ borderColor: meta.ringColor + '33' }}>
                {/* Top accent bar */}
                <div className={`h-1 w-full ${meta.barCls}`} />

                <div className="px-6 pt-5 pb-2">
                    {/* Name + Ring */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-inner bg-gradient-to-br from-orange-100 to-red-50 shrink-0">
                                🪐
                            </div>
                            <div>
                                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">Detected Dosh</p>
                                <h3 className="text-xl font-black text-gray-900 leading-tight">{active.name}</h3>
                            </div>
                        </div>
                        <SvgRing pct={active.severity_percentage} color={meta.ringColor} />
                    </div>

                    <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full uppercase tracking-wider ${meta.badgeCls}`}>
                        {meta.label} Severity
                    </span>

                    <p className="text-sm text-gray-600 leading-relaxed mt-3 mb-5">{active.short_description}</p>
                </div>

                {/* Accordions */}
                <div className="px-4 pb-5">
                    <Block title={active.explanation?.title ?? "What does this mean?"} defaultOpen>
                        <p>{active.explanation?.description}</p>
                    </Block>

                    <Block title={active.awareness?.title ?? "What to be aware of?"} defaultOpen>
                        <ul className="space-y-2">
                            {active.awareness?.points?.map((pt, i) => (
                                <li key={i} className="flex gap-2 items-start">
                                    <span className="text-orange-400 shrink-0 mt-0.5">•</span>
                                    <span>{pt}</span>
                                </li>
                            ))}
                        </ul>
                    </Block>

                    {/* Insights Chips */}
                    {active.insights && (
                        <div className="flex flex-wrap gap-2 mt-1 px-1">
                            <span className={`text-[11px] font-semibold border px-2.5 py-1 rounded-full ${meta.badgeCls} flex items-center gap-1`}>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Risk: {active.insights.risk_level}
                            </span>
                            {active.insights.focus_areas?.map((a, i) => (
                                <span key={i} className="text-[11px] border border-gray-200 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full capitalize">{a}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── What You Can Do + Spiritual Remedies ── */}
            <WhatYouCanDo daily_actions={active.daily_actions} />
            <SpiritualRemedies />
        </div>
    );
};

export default DoshaResults;
