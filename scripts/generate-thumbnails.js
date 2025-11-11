import fs from "fs";
import path from "path";
import sharp from "sharp";

const originalsDir = path.resolve("foto/originals");
const thumbnailsDir = path.resolve("foto/thumbnails");
const size = 800; // max šířka miniatury v px

async function generateThumbnails() {
  try {
    // vytvoř složku, pokud neexistuje
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    // načti všechny obrázky ve složce originals
    const files = fs.readdirSync(originalsDir).filter(f =>
      /\.(jpe?g|png|webp|avif)$/i.test(f)
    );

    for (const file of files) {
      const inputPath = path.join(originalsDir, file);
      const outputPath = path.join(thumbnailsDir, file);

      // přeskoč, pokud už thumbnail existuje
      if (fs.existsSync(outputPath)) continue;

      // vytvoř miniaturu
      await sharp(inputPath)
        .resize({ width: size, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
    }
  } catch {
    // tichý fallback (žádné console.log ani chyby ven)
  }
}

// spusť hlavní funkci
generateThumbnails();