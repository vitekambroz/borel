import fs from "fs";
import path from "path";
import sharp from "sharp"; // npm i sharp

const originalsDir = path.resolve("foto/originals");
const thumbnailsDir = path.resolve("foto/thumbnails");
const size = 800; // max šířka miniatury v px

// zajisti, že výstupní složka existuje
if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

// projdi všechny obrázky
const files = fs.readdirSync(originalsDir).filter(f =>
  /\.(jpe?g|png|webp|avif)$/i.test(f)
);

for (const file of files) {
  const inputPath = path.join(originalsDir, file);
  const outputPath = path.join(thumbnailsDir, file);

  if (fs.existsSync(outputPath)) {
    console.log(`✅ Přeskočeno: ${file} (thumbnail už existuje)`);
    continue;
  }

  await sharp(inputPath)
    .resize({ width: size, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  console.log(`📸 Vygenerováno: ${file}`);
}

console.log("\n✨ Hotovo! Všechny nové miniatury jsou připravené.");