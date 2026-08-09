const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgContent = fs.readFileSync(path.join(__dirname, '..', 'create-a-premium-vector-logo-for-a-modern-saas-pla.svg'), 'utf8');

// Remove: gray background, and the #BCBDBE border/grid lines
let svgClean = svgContent
  // Remove gray background
  .replace(/<path fill="#ECEDEE" d="M0 0L1024 0L1024 1024L0 1024L0 0Z"\/>/g, '')
  // Remove all #BCBDBE paths (grid lines/dividers)
  .replace(/<path fill="#BCBDBE"[^/]*\/>/g, '')
  // Remove all #9D9D9F paths (small gray dots on grid)
  .replace(/<path fill="#9D9D9F"[^/]*\/>/g, '');

function makeSvg(viewBox, w, h) {
  return svgClean.replace(
    /<\?xml[^?]*\?>\s*<svg[^>]*>/,
    `<?xml version="1.0" encoding="utf-8" ?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${viewBox}">`
  );
}

const brandDir = path.join(__dirname, '..', 'public', 'branding');
const pubDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(brandDir, { recursive: true });

async function run() {
  // ══════════════════════════════════════════════════════════
  // 1. ICON ONLY — the S mark from the top-left panel
  //    The blue+green S icon sits roughly at x:120-225, y:340-470
  // ══════════════════════════════════════════════════════════
  const iconSvg = makeSvg("118 335 115 145", 230, 290);
  fs.writeFileSync(path.join(brandDir, 'logo-icon.svg'), iconSvg);
  // Render test
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(path.join(brandDir, 'logo-icon.png'));
  console.log("✅ logo-icon");

  // ══════════════════════════════════════════════════════════
  // 2. HORIZONTAL LOGO — icon + "SajiloTools" text inline
  //    Top of center column: ~x:340-660, y:235-305
  // ══════════════════════════════════════════════════════════
  const horizSvg = makeSvg("340 232 318 80", 636, 160);
  fs.writeFileSync(path.join(brandDir, 'logo-horizontal.svg'), horizSvg);
  await sharp(Buffer.from(horizSvg))
    .resize(800, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(path.join(brandDir, 'logo-horizontal.png'));
  console.log("✅ logo-horizontal");

  // ══════════════════════════════════════════════════════════
  // 3. VERTICAL LOGO — large icon stacked above text
  //    Center column middle: icon ~x:420-585, y:345-475, text ~y:520-585
  // ══════════════════════════════════════════════════════════
  const vertSvg = makeSvg("390 340 230 260", 460, 520);
  fs.writeFileSync(path.join(brandDir, 'logo-vertical.svg'), vertSvg);
  await sharp(Buffer.from(vertSvg))
    .resize(480, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(path.join(brandDir, 'logo-vertical.png'));
  console.log("✅ logo-vertical");

  // ══════════════════════════════════════════════════════════
  // 4. RIGHT PANEL — Vertical + mono icons
  //    Large centered logo: ~x:710-930, y:260-470, text ~y:520-580
  //    Black icon: ~x:710-780, y:540-615
  //    White icon: ~x:850-920, y:540-615
  // ══════════════════════════════════════════════════════════
  // Black mono icon
  const blackSvg = makeSvg("698 530 100 90", 200, 180);
  fs.writeFileSync(path.join(brandDir, 'logo-black.svg'), blackSvg);
  console.log("✅ logo-black");

  // White mono icon
  const whiteSvg = makeSvg("835 530 100 90", 200, 180);
  fs.writeFileSync(path.join(brandDir, 'logo-white.svg'), whiteSvg);
  console.log("✅ logo-white");

  // ══════════════════════════════════════════════════════════
  // 5. APP ICON — cyan/blue app icon from bottom center
  //    ~x:375-510, y:780-920
  // ══════════════════════════════════════════════════════════
  const appSvg = makeSvg("370 770 150 160", 300, 320);
  fs.writeFileSync(path.join(brandDir, 'app-icon.svg'), appSvg);
  await sharp(Buffer.from(appSvg))
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(path.join(brandDir, 'app-icon.png'));
  console.log("✅ app-icon");

  // ══════════════════════════════════════════════════════════
  // 6. PRIMARY LOGO — for website use (= horizontal)
  // ══════════════════════════════════════════════════════════
  fs.copyFileSync(path.join(brandDir, 'logo-horizontal.svg'), path.join(brandDir, 'logo.svg'));
  fs.copyFileSync(path.join(brandDir, 'logo-horizontal.svg'), path.join(pubDir, 'logo.svg'));
  fs.copyFileSync(path.join(brandDir, 'logo-icon.svg'), path.join(pubDir, 'icon.svg'));
  console.log("✅ logo.svg + icon.svg (public root)");

  // ══════════════════════════════════════════════════════════
  // 7. FAVICONS from icon
  // ══════════════════════════════════════════════════════════
  const iconBuf = fs.readFileSync(path.join(brandDir, 'logo-icon.svg'));
  for (const [sz, name] of [
    [16, 'favicon-16x16.png'],
    [32, 'favicon-32x32.png'],
    [180, 'apple-touch-icon.png'],
    [192, 'android-chrome-192x192.png'],
    [512, 'android-chrome-512x512.png'],
  ]) {
    await sharp(iconBuf)
      .resize(sz, sz, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toFile(path.join(pubDir, name));
    console.log(`  ✅ ${name}`);
  }

  console.log("\n🎉 All branding assets extracted & generated!");
}

run().catch(console.error);
