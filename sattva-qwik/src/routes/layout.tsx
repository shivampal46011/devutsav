import { component$, Slot } from '@builder.io/qwik';
import TopBar from '~/components/TopBar';
import BottomNav from '~/components/BottomNav';

export default component$(() => {
  return (
    <div class="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <div class="fixed inset-0 grainy-bg z-[100] pointer-events-none" />
      <TopBar />
      <div class="pt-24 pb-32">
        <Slot />
      </div>
      <BottomNav />
    </div>
  );
});
