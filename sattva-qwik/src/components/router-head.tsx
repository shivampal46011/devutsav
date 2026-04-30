import { component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

const SITE_NAME = 'Devutsav';
const SITE_URL = 'https://devutsav.com';
const DEFAULT_TITLE = 'Devutsav — Sacred Tools, Horoscopes & Spiritual Guidance';
const DEFAULT_DESC =
  'Discover Devutsav: AI-powered Kundali Dosha analysis, daily horoscopes for all zodiac signs, Nandi Whisper ritual, verified pujas & chadhawa offerings, and a curated knowledge hub of Hindu spiritual guides.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.svg`;

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();
  const gaId = import.meta.env.PUBLIC_GA_MEASUREMENT_ID as string | undefined;
  const fbPixel = import.meta.env.PUBLIC_FB_PIXEL_ID as string | undefined;

  const title = head.title || DEFAULT_TITLE;
  const metaMap = new Map<string, { key?: string; [k: string]: any }>();
  for (const m of head.meta) {
    const k = (m as any).name || (m as any).property;
    if (k) metaMap.set(k, m as any);
  }
  const description =
    (metaMap.get('description') as any)?.content ||
    (metaMap.get('og:description') as any)?.content ||
    DEFAULT_DESC;
  const ogTitle = (metaMap.get('og:title') as any)?.content || title;
  const ogImage = (metaMap.get('og:image') as any)?.content || DEFAULT_OG_IMAGE;
  const isAdmin = loc.url.pathname.startsWith('/admin');
  const robots = (metaMap.get('robots') as any)?.content || (isAdmin ? 'noindex,nofollow' : 'index,follow');

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: DEFAULT_DESC,
    sameAs: [],
  };
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <title>{title}</title>

      {/* Core */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta name="theme-color" content="#fff8f3" />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />

      <link rel="canonical" href={loc.url.href} />

      {/* Favicons */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/favicon.svg" />
      <link rel="mask-icon" href="/favicon.svg" {...({ color: '#8f4e00' } as any)} />
      <link rel="manifest" href="/manifest.webmanifest" />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={loc.url.pathname.startsWith('/blog/') ? 'article' : 'website'} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:url" content={loc.url.href} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Preconnect: eliminate DNS+TLS latency for external origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="preconnect" href="https://lh3.googleusercontent.com" />

      {/* Fonts — only request weights actually used */}
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
        rel="stylesheet"
      />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={JSON.stringify(orgJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={JSON.stringify(websiteJsonLd)} />

      {/* Google Analytics 4 (gtag.js) — only when configured */}
      {gaId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script
            dangerouslySetInnerHTML={`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{send_page_view:true});`}
          />
        </>
      )}

      {/* Meta Pixel — only when configured */}
      {fbPixel && (
        <>
          <script
            dangerouslySetInnerHTML={`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbPixel}');fbq('track','PageView');`}
          />
          <noscript dangerouslySetInnerHTML={`<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${fbPixel}&ev=PageView&noscript=1" />`} />
        </>
      )}

      {head.meta
        .filter((m) => {
          const k = (m as any).name || (m as any).property;
          return k !== 'description' && k !== 'robots';
        })
        .map((m) => (
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
