// Generates PNG and ICO favicons from favicon.svg.
// Usage: node scripts/generate-favicons.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(root, 'favicon.svg'));

// iOS applies its own rounded mask and fills transparency with black,
// so the apple-touch-icon is a full-bleed square without rounded corners.
const squareSvg = Buffer.from(svg.toString().replace(/ rx="\d+"/, ''));

const render = (source, size) =>
  sharp(source, { density: Math.ceil((72 * size) / 64) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();

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

(async () => {
  const outputs = [
    ['favicon-32.png', await render(svg, 32)],
    ['icon-192.png', await render(svg, 192)],
    ['apple-touch-icon.png', await render(squareSvg, 180)],
  ];
  const ico = buildIco([
    { size: 16, data: await render(svg, 16) },
    { size: 32, data: await render(svg, 32) },
    { size: 48, data: await render(svg, 48) },
  ]);
  outputs.push(['favicon.ico', ico]);

  for (const [name, data] of outputs) {
    fs.writeFileSync(path.join(root, name), data);
    console.log(`${name}: ${data.length} B`);
  }
})();
