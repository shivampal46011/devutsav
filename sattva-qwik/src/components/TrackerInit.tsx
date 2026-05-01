import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { initTracker } from '~/lib/track';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (location.pathname.startsWith('/admin')) return;
    initTracker();
  });
  return null;
});
