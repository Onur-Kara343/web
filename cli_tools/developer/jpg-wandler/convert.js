// Bilder in JPG umwandeln
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const inputDir = path.join(__dirname, 'images');
const outputDir = path.join(__dirname, 'convert');

async function convertImages() {
    await fs.mkdir(outputDir, { recursive: true });

    const files = await fs.readdir(inputDir);

    // erlaubte Bildformate
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.gif'];

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();

        if (!validExtensions.includes(ext)) {
            console.log(`⏭️ Übersprungen (kein Bild): ${file}`);
            continue;
        }

        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(
            outputDir,
            path.parse(file).name + '.jpg'
        );

        try {
            await sharp(inputPath)
                .jpeg({ quality: 85 })
                .toFile(outputPath);

            console.log(`✅ ${file} → JPG`);
        } catch (err) {
            console.error(`❌ Fehler bei ${file}:`, err);
        }
    }

    console.log("🎉 Alle Bilder konvertiert");
}

convertImages();