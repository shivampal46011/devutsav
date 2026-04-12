import { component$ } from '@builder.io/qwik';
import { useLocation, Link } from '@builder.io/qwik-city';

const BottomNav = component$(() => {
  const loc = useLocation();
  const path = loc.url.pathname;

  const linkClass = (href: string) => {
    const exact = href === '/' ? path === '/' : path.startsWith(href);
    return `flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-transform duration-300 ease-out active:scale-90 ${
      exact
        ? 'bg-[#ff9933]/10 dark:bg-[#ff9933]/20 text-[#8f4e00] dark:text-[#ff9933]'
        : 'text-[#554336] dark:text-[#dbc2b0] hover:text-[#8f4e00] dark:hover:text-[#ff9933]'
    }`;
  };

  return (
    <nav class="bg-[#fff8f3]/80 dark:bg-[#211b10]/80 backdrop-blur-xl fixed bottom-0 w-full z-50 rounded-t-[2rem] border-t-[0.5px] border-[#dbc2b0]/15 shadow-[0_-10px_30px_rgba(85,67,54,0.05)] left-0 flex justify-around items-center px-0.5 pb-6 pt-3 md:hidden gap-0">
      <Link href="/" class={linkClass('/')}>
        <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1">home_max</span>
        <span class="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1">Home</span>
      </Link>
      <Link href="/analyzer" class={linkClass('/analyzer')}>
        <span class="material-symbols-outlined text-[20px]">psychology_alt</span>
        <span class="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1">Tools</span>
      </Link>
      <Link href="/puja" class={linkClass('/puja')}>
        <span class="material-symbols-outlined text-[20px]">temple_hindu</span>
        <span class="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1">Puja</span>
      </Link>
      <Link href="/chadhawa" class={linkClass('/chadhawa')}>
        <span class="material-symbols-outlined text-[20px]">local_florist</span>
        <span class="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1">Chadhawa</span>
      </Link>
      <Link href="/whisper" class={linkClass('/whisper')}>
        <span class="material-symbols-outlined text-[20px]">record_voice_over</span>
        <span class="font-['Plus_Jakarta_Sans'] text-[9px] font-semibold tracking-tight mt-1">Whisper</span>
      </Link>
      <Link href="/admin" class={linkClass('/admin')}>
        <span class="material-symbols-outlined text-[20px]">edit_note</span>
        <span class="font-['Plus_Jakarta_Sans'] text-[8px] font-semibold tracking-tight mt-1">Admin</span>
      </Link>
    </nav>
  );
});

export default BottomNav;
