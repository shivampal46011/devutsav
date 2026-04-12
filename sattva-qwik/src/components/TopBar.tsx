import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <header class="fixed top-0 w-full flex justify-center items-center px-6 h-16 bg-[#fff8f3]/80 dark:bg-[#211b10]/80 backdrop-blur-xl z-50 shadow-[0_20px_40px_rgba(85,67,54,0.08)]">
      <Link href="/" class="font-['Noto_Serif'] text-2xl tracking-[0.2em] font-bold text-[#8f4e00] dark:text-[#ff9933]">
        DEVUTSAV
      </Link>
    </header>
  );
});
