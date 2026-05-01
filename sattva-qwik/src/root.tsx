import { component$ } from '@builder.io/qwik';
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head';
import './global.css';

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <RouterHead />
        <ServiceWorkerRegister />
        <script
          dangerouslySetInnerHTML={`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NFV4P9PW');`}
        />
      </head>
      <body lang="en" class="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NFV4P9PW"
            height={0}
            width={0}
            style="display:none;visibility:hidden"
          />
        </noscript>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
