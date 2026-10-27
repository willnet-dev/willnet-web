// Antes de publicar: comprueba que existe la clave pública de Web3Forms (variable de entorno o .env).
// Sin ella el formulario saldría «sin conectar». No muestra la clave.
import { existsSync, readFileSync } from "node:fs";

const fromEnv = process.env.PUBLIC_WEB3FORMS_KEY?.trim();
const fromFile = existsSync(".env") && /^PUBLIC_WEB3FORMS_KEY=\S+/m.test(readFileSync(".env", "utf8"));

if (!fromEnv && !fromFile) {
  console.error("Falta PUBLIC_WEB3FORMS_KEY: crea .env a partir de .env.example (ver README) antes de publicar.");
  process.exit(1);
}
console.log("Clave de Web3Forms presente.");
