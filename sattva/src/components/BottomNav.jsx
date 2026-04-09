import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
    return (
        <nav className="bg-[#fff8f3]/80 dark:bg-[#211b10]/80 backdrop-blur-xl fixed bottom-0 w-full z-50 rounded-t-[2rem] border-t-[0.5px] border-[#dbc2b0]/15 shadow-[0_-10px_30px_rgba(85,67,54,0.05)] left-0 flex justify-around items-center px-4 pb-6 pt-3 md:hidden">
            <NavLink to="/" className={({isActive}) => `flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-transform duration-300 ease-out active:scale-90 ${isActive ? 'bg-[#ff9933]/10 dark:bg-[#ff9933]/20 text-[#8f4e00] dark:text-[#ff9933]' : 'text-[#554336] dark:text-[#dbc2b0] hover:text-[#8f4e00] dark:hover:text-[#ff9933]'}`}>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>home_max</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-semibold tracking-tight">Home</span>
            </NavLink>
            <NavLink to="/analyzer" className={({isActive}) => `flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-transform duration-300 ease-out active:scale-90 ${isActive ? 'bg-[#ff9933]/10 dark:bg-[#ff9933]/20 text-[#8f4e00] dark:text-[#ff9933]' : 'text-[#554336] dark:text-[#dbc2b0] hover:text-[#8f4e00] dark:hover:text-[#ff9933]'}`}>
                <span className="material-symbols-outlined">psychology_alt</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-semibold tracking-tight">Tools</span>
            </NavLink>
            <NavLink to="/market" className={({isActive}) => `flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-transform duration-300 ease-out active:scale-90 ${isActive ? 'bg-[#ff9933]/10 dark:bg-[#ff9933]/20 text-[#8f4e00] dark:text-[#ff9933]' : 'text-[#554336] dark:text-[#dbc2b0] hover:text-[#8f4e00] dark:hover:text-[#ff9933]'}`}>
                <span className="material-symbols-outlined">temple_hindu</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-semibold tracking-tight">Market</span>
            </NavLink>
            <NavLink to="/whisper" className={({isActive}) => `flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-transform duration-300 ease-out active:scale-90 ${isActive ? 'bg-[#ff9933]/10 dark:bg-[#ff9933]/20 text-[#8f4e00] dark:text-[#ff9933]' : 'text-[#554336] dark:text-[#dbc2b0] hover:text-[#8f4e00] dark:hover:text-[#ff9933]'}`}>
                <span className="material-symbols-outlined">record_voice_over</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-semibold tracking-tight">Whisper</span>
            </NavLink>
            {/* <NavLink to="/community" className={({isActive}) => `flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-transform duration-300 ease-out active:scale-90 ${isActive ? 'bg-[#ff9933]/10 dark:bg-[#ff9933]/20 text-[#8f4e00] dark:text-[#ff9933]' : 'text-[#554336] dark:text-[#dbc2b0] hover:text-[#8f4e00] dark:hover:text-[#ff9933]'}`}>
                <span className="material-symbols-outlined">diversity_3</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-semibold tracking-tight">Hub</span>
            </NavLink> */}
        </nav>
    );
};

export default BottomNav;
