import React from 'react';

const TopBar = () => {
    return (
        <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#fff8f3]/80 dark:bg-[#211b10]/80 backdrop-blur-xl z-50 shadow-[0_20px_40px_rgba(85,67,54,0.08)]">
            <div className="flex items-center gap-4">
                <button className="text-[#8f4e00] dark:text-[#ff9933] hover:opacity-80 transition-opacity active:scale-95 active:duration-150">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <h1 className="font-['Noto_Serif'] text-2xl tracking-[0.2em] font-bold text-[#8f4e00] dark:text-[#ff9933]">DEVUTSAV</h1>
            </div>
            <div className="flex items-center gap-6">
                <nav className="hidden md:flex gap-8">
                    <a className="font-['Noto_Serif'] tracking-widest uppercase text-sm font-bold text-[#8f4e00] hover:opacity-80 transition-opacity" href="/">Home</a>
                    <a className="font-['Noto_Serif'] tracking-widest uppercase text-sm font-bold text-[#8f4e00] hover:opacity-80 transition-opacity" href="/market">Catalog</a>
                    <a className="font-['Noto_Serif'] tracking-widest uppercase text-sm font-bold text-[#b6171e]" href="/ritual-guide">Rituals</a>
                </nav>
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User profile" loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzCDG9EpauELmUPiq-WZDuqALVHRRWvqwMJ8gD_VGDc_QvtHxd_HNIbtU7AaHpU-gyncSn_RmP11sEYzkLb3CjGG91UQReRX2KummPQpdDs0MjNT6-JdK18XVy1vH416FGvXj8QiMM3IMqB9Cpb_q-3qKSFQ0qjBBRP4RQWGF9SWbaSDxxSUkR4m9drQGm_48Nribw_8PhB6XrEPiDiFPF71upm8_C1pvPjVQGt6ALq6AVd5XfXTs8Fih6jFlnvSFgi2DNo0pDIg7K" />
                </div>
            </div>
        </header>
    );
};

export default TopBar;
