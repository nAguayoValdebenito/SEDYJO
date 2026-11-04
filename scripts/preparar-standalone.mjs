// Después de `next build`: copia public/ y .next/static dentro de .next/standalone
// para que esa carpeta se pueda subir por FTP y ejecutar con Setup Node.js App (cPanel).
import { cp, access } from "node:fs/promises";

const salida = ".next/standalone";

try {
  await access(salida);
} catch {
  console.error(`No existe ${salida}. Ejecuta primero "next build" con output: "standalone".`);
  process.exit(1);
}

await cp("public", `${salida}/public`, { recursive: true });
await cp(".next/static", `${salida}/.next/static`, { recursive: true });
console.log(`Listo: sube el contenido de ${salida} al hosting y apunta cPanel a server.js`);
