/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for Qwik City when building for production.
 * https://qwik.dev/qwikcity/adapters/overview/
 *
 */
import { createQwikCity } from '@builder.io/qwik-city/middleware/node';
import qwikCityPlan from '@qwik-city-plan';
import { manifest } from '@qwik-client-manifest';
import render from './entry.ssr';

export const { router, notFound, staticFile } = createQwikCity({
  render,
  qwikCityPlan,
  manifest,
});
