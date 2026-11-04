// Uso: node scripts/optimizar-imagen.mjs <origen> <destino.webp> [ancho]
// Pre-optimiza fotos a WebP antes de subirlas por FTP.
import sharp from "sharp";

const [origen, destino, ancho = "800"] = process.argv.slice(2);
if (!origen || !destino) {
  console.error("Uso: node scripts/optimizar-imagen.mjs <origen> <destino.webp> [ancho]");
  process.exit(1);
}

await sharp(origen)
  .resize({ width: Number(ancho), withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(destino);
console.log(`OK ${destino}`);
