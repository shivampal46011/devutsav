import { component$, Slot, useVisibleTask$ } from '@builder.io/qwik';
import TopBar from '~/components/TopBar';
import BottomNav from '~/components/BottomNav';

export default component$(() => {
  // Defer PostHog to after page is visible — dynamic import keeps it out of SSR bundle
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const key = import.meta.env.PUBLIC_POSTHOG_KEY;
    if (key) {
      import('posthog-js').then(({ default: posthog }) => {
        posthog.init(key, {
          api_host: import.meta.env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          person_profiles: 'identified_only',
        });
      });
    }
  });

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
