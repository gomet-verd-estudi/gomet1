// node cara.cjs [query]  →  web/nuevo/plana-parpadeo.png y plana-habla.png
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const D = require('path').join(__dirname, 'nuevo') + '/';   // la carpeta de trabajo que se sirve en :8790
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8790/cara.html?' + (process.argv[2] || '')); await p.waitForFunction(() => window.DONE, null, { timeout: 600000 }).catch(() => errs.push('timeout'));
  if (errs.length) { console.log(errs.join(' | ')); process.exit(1); }
  const o = await p.evaluate(() => window.OUT);
  fs.writeFileSync(D + 'plana-parpadeo.png', Buffer.from(o.shut.split(',')[1], 'base64'));
  fs.writeFileSync(D + 'plana-habla.png', Buffer.from(o.talk.split(',')[1], 'base64'));
  console.log('ok'); await b.close();
})();
