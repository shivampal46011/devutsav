import { component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{head.title}</title>

      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#fff8f3" />

      {/* Preconnect: eliminate DNS+TLS latency for external origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="preconnect" href="https://lh3.googleusercontent.com" />

      {/* Preload LCP hero image — fetched during HTML parse, not after hydration */}
      <link
        rel="preload"
        as="image"
        fetchPriority="high"
        href="https://lh3.googleusercontent.com/aida-public/AB6AXuC6m6CVg0u7pbLG3B1wW4Dm7l9CWT56CWaYpE9aPMNMmGvKlLV_KktgdRX0d4-7xN8CSetlqNez5myg0jSFrCgXFcl0_yaVs_WNysNviVa_qxLtAx8pVR4543-d5hagasUL-4bo2BOtcsTV5HC5KjipbcfksiYi_CAPQWkEan2mrbr54j7LgjdNp6zUso1haxVjABbBv3t4YO6HfJm1yxVuF4mdT9twx5dZ0IRcn4DflGdRlTysm1D-f89bStlRfrMnSJOfBEha_Ajj"
      />

      {/* Fonts — only request weights actually used */}
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      {/* Material Symbols: only wght 400, FILL 0+1 — reduces from 3.8MB to ~100KB */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
        rel="stylesheet"
      />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style key={s.key} {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}

      {head.scripts.map((s) => (
        <script key={s.key} {...s.props} dangerouslySetInnerHTML={s.script} />
      ))}
    </>
  );
});
