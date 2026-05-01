import { staticAdapter } from '@builder.io/qwik-city/adapters/static/vite';
import { extendConfig } from '@builder.io/qwik-city/vite';
import baseConfig from '../../vite.config';

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      outDir: 'server-ssg',
      emptyOutDir: false,
      rollupOptions: {
        input: ['@qwik-city-plan'],
      },
      minify: false,
    },
    plugins: [
      staticAdapter({
        origin: process.env.PUBLIC_ORIGIN || 'https://devutsav.com',
        // Skip routes that need live data or auth.
        // The express server will SSR these on demand.
        exclude: [
          '/admin/*',
          '/horoscope/*',
          '/puja/',
          '/sitemap.xml',
        ],
      }),
    ],
  };
});
