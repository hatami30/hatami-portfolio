// Regenerates public/favicon.ico and public/apple-touch-icon.png from public/favicon.svg.
// Run `pnpm icons` after you replace favicon.svg with your own logo, then commit the results.
//
// Why: crawlers still request /favicon.ico by default, and iOS wants a PNG touch icon.
// favicon.svg stays the primary icon for modern browsers.

import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const svg = readFileSync('public/favicon.svg');
const BACKGROUND = '#4338ca'; // iOS fills transparent corners with black, so the touch icon is opaque

const png = (size) => sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();

// apple-touch-icon.png: 180x180, opaque
await sharp(svg, { density: 512 })
  .resize(180, 180)
  .flatten({ background: BACKGROUND })
  .png()
  .toFile('public/apple-touch-icon.png');

// favicon.ico: an ICO container holding PNG images (supported by every current browser)
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);

let offset = 6 + 16 * sizes.length;
const entries = images.map((image, index) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[index], 0); // width
  entry.writeUInt8(sizes[index], 1); // height
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += image.length;
  return entry;
});

writeFileSync('public/favicon.ico', Buffer.concat([header, ...entries, ...images]));
console.log('icons: wrote public/favicon.ico and public/apple-touch-icon.png');
