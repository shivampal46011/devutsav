import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { initTracker } from '~/lib/track';
import { initFirebase } from '~/lib/firebase';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (location.pathname.startsWith('/admin')) return;
    await initFirebase();
    initTracker();
  });
  return null;
});
