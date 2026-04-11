import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
    const linkClass = () => ({isActive}) => `flex flex-col items-center justify-center rounded-xl px-2 py-2 transition-transform duration-300 ease-out active:scale-90 ${isActive ? 'bg-[#ff9933]/10 dark:bg-[#ff9933]/20 text-[#8f4e00] dark:text-[#ff9933]' : 'text-[#554336] dark:text-[#dbc2b0] hover:text-[#8f4e00] dark:hover:text-[#ff9933]'}`;

    return (
        <nav className="bg-[#fff8f3]/80 dark:bg-[#211b10]/80 backdrop-blur-xl fixed bottom-0 w-full z-50 rounded-t-[2rem] border-t-[0.5px] border-[#dbc2b0]/15 shadow-[0_-10px_30px_rgba(85,67,54,0.05)] left-0 flex justify-around items-center px-1 pb-6 pt-3 md:hidden">
            <NavLink to="/" className={linkClass()}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_max</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1">Home</span>
            </NavLink>
            <NavLink to="/analyzer" className={linkClass()}>
                <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1">Tools</span>
            </NavLink>
            <NavLink to="/puja" className={linkClass()}>
                <span className="material-symbols-outlined text-[20px]">temple_hindu</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1">Puja</span>
            </NavLink>
            <NavLink to="/chadhawa" className={linkClass()}>
                <span className="material-symbols-outlined text-[20px]">local_florist</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1">chadhawa</span>
            </NavLink>
            <NavLink to="/whisper" className={linkClass()}>
                <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1">Whisper</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
