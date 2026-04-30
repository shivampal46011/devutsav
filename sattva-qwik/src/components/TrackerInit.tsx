import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { initTracker } from '~/lib/track';

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    initTracker();
  });
  return null;
});
