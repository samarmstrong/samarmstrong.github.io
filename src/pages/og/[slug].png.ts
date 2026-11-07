// Build-time share images (1200x630 PNG) for link previews on X, LinkedIn, Slack, etc.
// One per post at /og/<post-id>.png, plus /og/site.png for every other page.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getPosts } from '../../lib/posts';
import { siteConfig } from '../../site.config';

const require = createRequire(import.meta.url);
const font = (weight: number) =>
  fs.readFileSync(require.resolve(`@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-${weight}-normal.woff`));
const fonts = [
  { name: 'Plex', data: font(400), weight: 400 as const, style: 'normal' as const },
  { name: 'Plex', data: font(600), weight: 600 as const, style: 'normal' as const },
];

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return [
    { params: { slug: 'site' }, props: { title: siteConfig.name, kicker: '' } },
    ...posts.map((p) => ({
      params: { slug: p.id },
      props: { title: p.data.title, kicker: p.data.date.toISOString().slice(0, 10) },
    })),
  ];
}) satisfies GetStaticPaths;

const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const { title, kicker } = props as { title: string; kicker: string };
  const host = new URL(siteConfig.url).host;
  // Padding lives on an inner box: a padded 100%-height root overflows the 630px canvas.
  const tree = el(
    'div',
    { width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: '#111111' },
    [
      el(
        'div',
        {
          flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '72px 80px', color: '#e8e8e8', fontFamily: 'Plex',
        },
        [
          el('div', { fontSize: 28, color: '#a0a0a0', display: 'flex' }, kicker || ' '),
          el('div', { fontSize: title.length > 60 ? 56 : 68, fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.02em', display: 'flex' }, title),
          el('div', { display: 'flex', justifyContent: 'space-between', fontSize: 28, color: '#a0a0a0' }, [
            el('div', { display: 'flex', color: '#e8e8e8', fontWeight: 600 }, siteConfig.name),
            el('div', { display: 'flex' }, host),
          ]),
        ],
      ),
      el('div', { height: 12, background: '#f97316', display: 'flex' }),
    ],
  );
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
