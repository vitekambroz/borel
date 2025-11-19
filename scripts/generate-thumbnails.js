import fs from "fs";
import path from "path";
import sharp from "sharp"; // npm install sharp

const originalsDir  = path.resolve("public/foto/originals");
const thumbnailsDir = path.resolve("public/foto/thumbnails");
const size = 800;

// zajisti, že výstupní složka existuje
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

const files = fs
  .readdirSync(originalsDir)
  .filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f));

if (files.length === 0) {
  console.log("❌ Ve složce 'foto/originals' nebyly nalezeny žádné obrázky.");
  process.exit(0);
}

let created = 0;
let skipped = 0;
console.log(`🖼️  Nalezeno ${files.length} originálních fotek.\n`);

const start = Date.now();

for (const file of files) {
  const inputPath = path.join(originalsDir, file);
  const outputPath = path.join(thumbnailsDir, file);

  if (fs.existsSync(outputPath)) {
    skipped++;
    continue;
  }

  try {
    await sharp(inputPath)
      .rotate() // ✅ respektuje EXIF rotaci
      .resize({ width: size, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    created++;
    console.log(`📸 Vygenerováno: ${file}`);
  } catch (err) {
    console.error(`❌ Chyba při zpracování ${file}:`, err.message);
  }
}

const duration = ((Date.now() - start) / 1000).toFixed(1);
console.log(`\n✅ Hotovo! ${created} nových miniatur, ${skipped} přeskočeno. ⏱️ ${duration}s`);