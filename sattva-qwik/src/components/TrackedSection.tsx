import { component$, Slot, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { observeSection } from '~/lib/track';

interface Props {
  id: string;
  class?: string;
}

/**
 * Wrap any region of UI to record impressions + 2s engagement.
 * Usage: <TrackedSection id="home_hero">...content...</TrackedSection>
 */
export const TrackedSection = component$<Props>(({ id, class: cls }) => {
  const ref = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (!ref.value) return;
    const dispose = observeSection(ref.value, id);
    cleanup(() => dispose());
  });

  return (
    <div ref={ref} data-section-id={id} class={cls}>
      <Slot />
    </div>
  );
});

export default TrackedSection;
