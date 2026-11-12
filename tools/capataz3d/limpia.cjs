// node limpia.cjs entrada.png salida.png  (rutas relativas a web/)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const D = '/tmp/claude-0/-home-user/4d61fb76-d589-5f2f-bba2-89221db77b9b/scratchpad/m3d/web/';
  const [src, dst] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8790/limpia.html?tex=./' + src); await p.waitForFunction(() => window.DONE, null, { timeout: 900000 }).catch(() => errs.push('timeout'));
  if (errs.length) { console.log(errs.join(' | ')); process.exit(1); }
  const o = await p.evaluate(() => window.OUT);
  fs.writeFileSync(D + dst, Buffer.from(o.png.split(',')[1], 'base64'));
  console.log(dst, 'motas', o.spots, 'texels', o.fixed, 'vistas', o.views); await b.close();
})();
