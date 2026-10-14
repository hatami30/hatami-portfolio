/**
 * Build-time Open Graph images (1200x630 PNG) rendered with satori + resvg.
 * Only runs inside `astro build` / `astro dev` (Node), never in the browser.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

const FONT_DIR = join(process.cwd(), 'node_modules', '@fontsource', 'inter', 'files');

let fontsPromise: Promise<[Buffer, Buffer]> | undefined;
function loadFonts() {
  // satori needs static .woff/.ttf files (not .woff2 and not variable fonts).
  fontsPromise ??= Promise.all([
    readFile(join(FONT_DIR, 'inter-latin-400-normal.woff')),
    readFile(join(FONT_DIR, 'inter-latin-700-normal.woff')),
  ]);
  return fontsPromise;
}

type Style = Record<string, string | number>;
type OgNode = { type: 'div'; props: { style: Style; children: OgNode | OgNode[] | string } };

const box = (style: Style, children: OgNode | OgNode[] | string): OgNode => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

export interface OgOptions {
  title: string;
  kicker: string;
  footer: string;
}

export async function renderOgImage({ title, kicker, footer }: OgOptions): Promise<Uint8Array> {
  const [regular, bold] = await loadFonts();
  const clipped = title.length > 90 ? `${title.slice(0, 87)}…` : title;

  const tree = box(
    {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 72,
      background: '#0f1013',
      color: '#ececea',
      fontFamily: 'Inter',
      borderLeft: '16px solid #a5b4fc',
    },
    [
      box({ fontSize: 30, color: '#a5b4fc', fontWeight: 700 }, kicker),
      box({ fontSize: 68, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1 }, clipped),
      box({ fontSize: 28, color: '#a1a19b' }, footer),
    ],
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' },
    ],
  });

  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
