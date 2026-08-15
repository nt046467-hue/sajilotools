import fs from "fs";
import path from "path";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve("public");
const BRANDING_ICON = path.join(PUBLIC_DIR, "branding", "logo-icon.svg");
const BACKUP_PNG = path.join(PUBLIC_DIR, "android-chrome-512x512.png");

// Source image: SVG if available, fallback to 512x512 PNG
const sourceImage = fs.existsSync(BRANDING_ICON) ? BRANDING_ICON : BACKUP_PNG;

/**
 * Builds a multi-frame ICO file from an array of PNG buffers.
 * @param {Array<{ width: number, height: number, buffer: Buffer }>} images
 * @returns {Buffer}
 */
function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(images.length, 4); // Number of images

  const dirEntryLength = 16;
  const dirLength = dirEntryLength * images.length;
  let currentOffset = 6 + dirLength;

  const dirEntries = [];
  const imageBuffers = [];

  for (const img of images) {
    const entry = Buffer.alloc(dirEntryLength);
    const w = img.width >= 256 ? 0 : img.width;
    const h = img.height >= 256 ? 0 : img.height;

    entry.writeUInt8(w, 0);
    entry.writeUInt8(h, 1);
    entry.writeUInt8(0, 2); // Colors (0 = no palette)
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Size
    entry.writeUInt32LE(currentOffset, 12); // Offset

    dirEntries.push(entry);
    imageBuffers.push(img.buffer);
    currentOffset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

async function main() {
  console.log("Generating valid binary favicon and brand assets...");

  const png16 = await sharp(sourceImage).resize(16, 16).png().toBuffer();
  const png32 = await sharp(sourceImage).resize(32, 32).png().toBuffer();
  const png48 = await sharp(sourceImage).resize(48, 48).png().toBuffer();
  const png180 = await sharp(sourceImage).resize(180, 180).png().toBuffer();
  const png192 = await sharp(sourceImage).resize(192, 192).png().toBuffer();
  const png512 = await sharp(sourceImage).resize(512, 512).png().toBuffer();

  // Write PNG assets
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-16x16.png"), png16);
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-32x32.png"), png32);
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-48x48.png"), png48);
  fs.writeFileSync(path.join(PUBLIC_DIR, "apple-touch-icon.png"), png180);
  fs.writeFileSync(path.join(PUBLIC_DIR, "android-chrome-192x192.png"), png192);
  fs.writeFileSync(path.join(PUBLIC_DIR, "android-chrome-512x512.png"), png512);

  // Generate multi-frame valid binary ICO (16x16, 32x32, 48x48)
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);

  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.ico"), icoBuffer);
  console.log("favicon.ico written successfully! Size:", icoBuffer.length, "bytes");

  // Create proper 1200x630 OG image
  const ogImgPath = path.join(PUBLIC_DIR, "images", "og-default.png");
  if (fs.existsSync(ogImgPath)) {
    // Generate a crisp 1200x630 image with centered brand icon and background
    const bgSvg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0C0F1E"/>
            <stop offset="100%" stop-color="#141829"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#bg)"/>
        <text x="600" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="54" font-weight="bold" fill="#F4F4F5" text-anchor="middle">SajiloTools</text>
        <text x="600" y="500" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#9CA3AF" text-anchor="middle">Free Online Tools Made Simple for Nepal</text>
      </svg>
    `;

    const icon200 = await sharp(sourceImage).resize(180, 180).png().toBuffer();

    const ogDefault = await sharp(Buffer.from(bgSvg))
      .composite([{ input: icon200, top: 160, left: 510 }])
      .png()
      .toBuffer();

    fs.writeFileSync(ogImgPath, ogDefault);
    console.log("og-default.png written as 1200x630 PNG! Size:", ogDefault.length, "bytes");
  }

  console.log("Asset generation complete.");
}

main().catch((err) => {
  console.error("Failed to generate favicon assets:", err);
  process.exit(1);
});
