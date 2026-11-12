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
const spaceFont = (weight: number) =>
  fs.readFileSync(require.resolve(`@fontsource/space-grotesk/files/space-grotesk-latin-${weight}-normal.woff`));
const monoFont = (weight: number) =>
  fs.readFileSync(require.resolve(`@fontsource/geist-mono/files/geist-mono-latin-${weight}-normal.woff`));

const fonts = [
  { name: 'SpaceGrotesk', data: spaceFont(500), weight: 500 as const, style: 'normal' as const },
  { name: 'SpaceGrotesk', data: spaceFont(600), weight: 600 as const, style: 'normal' as const },
  { name: 'GeistMono', data: monoFont(400), weight: 400 as const, style: 'normal' as const },
];

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return [
    { params: { slug: 'site' }, props: { title: siteConfig.headline, kicker: 'AGENTS · EVALS · INFRA · SECURITY' } },
    ...posts.map((p) => ({
      params: { slug: p.id },
      props: { title: p.data.title, kicker: p.data.date.toISOString().slice(0, 10) },
    })),
  ];
}) satisfies GetStaticPaths;

const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({
  type,
  props: { style, children },
});

export const GET: APIRoute = async ({ props }) => {
  const { title, kicker } = props as { title: string; kicker: string };
  const host = new URL(siteConfig.url).host;
  // Padding lives on an inner box: a padded 100%-height root overflows the 630px canvas.
  const tree = el(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      background: '#08080a',
    },
    [
      el(
        'div',
        {
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 84px',
          color: '#fafafa',
          fontFamily: 'SpaceGrotesk',
          borderTop: '1px solid #222228',
        },
        [
          el(
            'div',
            {
              fontSize: 22,
              fontFamily: 'GeistMono',
              letterSpacing: '0.08em',
              color: '#f97316',
              display: 'flex',
            },
            kicker || ' ',
          ),
          el(
            'div',
            {
              fontSize: title.length > 65 ? 54 : 66,
              fontWeight: 600,
              lineHeight: 1.14,
              letterSpacing: '-0.03em',
              color: '#fafafa',
              display: 'flex',
            },
            title,
          ),
          el(
            'div',
            {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '28px',
              borderTop: '1px solid #1e1e24',
              fontSize: 24,
              color: '#8e8e99',
            },
            [
              el('div', { display: 'flex', color: '#fafafa', fontWeight: 600 }, siteConfig.name),
              el('div', { display: 'flex', fontFamily: 'GeistMono', fontSize: 22 }, host),
            ],
          ),
        ],
      ),
      el('div', { height: 6, background: '#f97316', display: 'flex' }),
    ],
  );
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
