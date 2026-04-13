/**
 * Production Express server for Qwik City (Docker / Node hosting).
 * https://qwik.dev/docs/deployments/node/
 */
import {
  createQwikCity,
  type PlatformNode,
} from '@builder.io/qwik-city/middleware/node';
import 'dotenv/config';
import qwikCityPlan from '@qwik-city-plan';
import render from './entry.ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

declare global {
  type QwikCityPlatform = PlatformNode;
}

const distDir = join(fileURLToPath(import.meta.url), '..', '..', 'dist');
const buildDir = join(distDir, 'build');
const assetsDir = join(distDir, 'assets');

const PORT = Number(process.env.PORT ?? 3000);

const { router, notFound } = createQwikCity({
  render,
  qwikCityPlan,
  getOrigin(req) {
    const protocol = (req.headers['x-forwarded-proto'] as string) ?? 'http';
    const host =
      (req.headers['x-forwarded-host'] as string) ?? req.headers.host ?? 'localhost';
    return `${protocol}://${host}`;
  },
});

const app = express();
app.set('trust proxy', 1);

app.use('/build', express.static(buildDir, { immutable: true, maxAge: '1y' }));
app.use('/assets', express.static(assetsDir, { immutable: true, maxAge: '1y' }));
app.use(express.static(distDir, { redirect: false }));

app.use(router);
app.use(notFound);

app.listen(PORT, () => {
  console.log(`Qwik server listening on http://0.0.0.0:${PORT}/`);
});
