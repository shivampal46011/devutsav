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
        // Sitemap is emitted as a Qwik server endpoint — handled by a build-time
        // generator that writes a static sitemap.xml into dist/.
        exclude: ['/sitemap.xml'],
      }),
    ],
  };
});
