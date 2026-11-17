// Generates the site favicons from the client's emblem (images/favicon-source.png):
// black line art on white, recolored to the site palette — gold lines on a dark disc.
// Usage: node scripts/generate-favicons.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const SOURCE = path.join(root, 'images', 'favicon-source.png');
const GOLD = '#c3a174'; // sampled from images/logo.webp
const DARK = '#1a1008';

// Line art -> alpha mask (dark lines become opaque). `thicken` (blur sigma in
// source pixels) spreads and re-saturates the strokes, so thin lines survive
// downscaling to tiny sizes.
async function lineMask(size, thicken = 0) {
  let { data: mask, info } = await sharp(SOURCE)
    .greyscale()
    .negate()
    .linear(1.6, -40)
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const raw = { raw: { width: info.width, height: info.height, channels: 1 } };
  if (thicken > 0) {
    mask = await sharp(mask, raw).blur(thicken).linear(4, 0).toColourspace('b-w').raw().toBuffer();
  }
  return sharp(mask, raw)
    .resize(size, size, { kernel: 'lanczos3' })
    .toColourspace('b-w')
    .raw()
    .toBuffer();
}

async function render(size, { shape = 'circle', thicken = 0 } = {}) {
  const background =
    shape === 'circle'
      ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${DARK}"/>`
      : `<rect width="${size}" height="${size}" fill="${DARK}"/>`;
  const base = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${background}</svg>`
  );

  const mask = await lineMask(size, thicken);
  const gold = await sharp({ create: { width: size, height: size, channels: 3, background: GOLD } })
    .joinChannel(mask, { raw: { width: size, height: size, channels: 1 } })
    .png()
    .toBuffer();

  return sharp(base).composite([{ input: gold }]).png({ compressionLevel: 9 }).toBuffer();
}

// ICO container with embedded PNG images (supported by all modern browsers).
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

module.exports = { render };

if (require.main === module) {
  (async () => {
    const outputs = [
      ['favicon-32.png', await render(32, { thicken: 6 })],
      ['icon-192.png', await render(192)],
      // iOS applies its own rounded mask and fills transparency with black,
      // so the apple-touch-icon uses a full-bleed square background.
      ['apple-touch-icon.png', await render(180, { shape: 'square' })],
    ];
    const ico = buildIco([
      { size: 16, data: await render(16, { thicken: 8 }) },
      { size: 32, data: await render(32, { thicken: 6 }) },
      { size: 48, data: await render(48, { thicken: 4 }) },
    ]);
    outputs.push(['favicon.ico', ico]);

    for (const [name, data] of outputs) {
      fs.writeFileSync(path.join(root, name), data);
      console.log(`${name}: ${data.length} B`);
    }
  })();
}
