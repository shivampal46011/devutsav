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
      </head>
      <body lang="en" class="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
