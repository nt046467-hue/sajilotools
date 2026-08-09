import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const logoPath = join(process.cwd(), "public", "branding", "logo.svg");
const sizes = [16, 32, 180, 192, 512];
const outputDir = join(process.cwd(), "public");

async function generateFavicons() {
  try {
    const svgBuffer = readFileSync(logoPath);

    for (const size of sizes) {
      const outputPath = join(
        outputDir,
        size === 16 ? "favicon-16x16.png" :
        size === 32 ? "favicon-32x32.png" :
        size === 180 ? "apple-touch-icon.png" :
        size === 192 ? "android-chrome-192x192.png" :
        "android-chrome-512x512.png"
      );

      await sharp(svgBuffer)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`Generated: ${outputPath}`);
    }

    console.log("Favicon generation complete!");
  } catch (error) {
    console.error("Error generating favicons:", error);
    process.exit(1);
  }
}

generateFavicons();
