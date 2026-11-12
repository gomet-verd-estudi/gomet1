/*
 * Copia de la web para verla publicada en una dirección de pruebas (GitHub Pages) antes del lanzamiento.
 *   node tools/staging.mjs <carpeta de salida> [/prefijo/]
 * Es la web tal cual, con tres ajustes que solo tienen sentido en pruebas:
 *  - 404.html usa rutas desde la raíz del dominio; en Pages la web cuelga de /<repositorio>/, así que se les
 *    antepone el prefijo (el resto de páginas usa rutas relativas y funciona en cualquier carpeta);
 *  - todas las páginas llevan «noindex»: los buscadores no deben indexar la copia de pruebas;
 *  - .nojekyll, para que Pages sirva los archivos sin procesarlos.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out, prefix = '/'] = process.argv.slice(2);
if (!out) { console.error('uso: node tools/staging.mjs <carpeta de salida> [/prefijo/]'); process.exit(1); }
const base = '/' + prefix.split('/').filter(Boolean).join('/');   // '' en la raíz, '/gomet1' en un repositorio
const SKIP = new Set(['.git', '.gitignore', '.DS_Store', 'node_modules', 'tools', 'data', 'README.md']);

rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
for (const f of readdirSync(ROOT)) if (!SKIP.has(f)) cpSync(join(ROOT, f), join(out, f), { recursive: true });

let pages = 0;
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) fix(p); } };
function fix(p) {
  let s = readFileSync(p, 'utf8');
  if (relative(out, p) === '404.html' && base) s = s.replace(/\b(href|src)="\/(?!\/)/g, `$1="${base}/`);
  if (!/<meta name="robots"/.test(s)) s = s.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex">');
  writeFileSync(p, s); pages++;
}
walk(out);
writeFileSync(join(out, '.nojekyll'), '');
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`copia de pruebas en ${out} · ${pages} páginas · prefijo «${base || '/'}»`);
