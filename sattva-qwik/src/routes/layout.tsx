import { component$, Slot, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import TopBar from '~/components/TopBar';
import BottomNav from '~/components/BottomNav';
import TrackerInit from '~/components/TrackerInit';
import { initClientLogs } from '~/lib/clientLogs';

export default component$(() => {
  const loc = useLocation();
  const isAdmin = loc.url.pathname.startsWith('/admin');

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => { initClientLogs(); });

  if (isAdmin) {
    return (
      <div class="bg-black text-[#e6e6e6] min-h-screen">
        <Slot />
      </div>
    );
  }

  return (
    <div class="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <div class="fixed inset-0 grainy-bg z-[100] pointer-events-none" />
      <TopBar />
      <div class="pt-16 pb-24 md:pb-8">
        <Slot />
      </div>
      <BottomNav />
      <TrackerInit />
    </div>
  );
});
