const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [fbx, out] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 200)); });
  await p.goto('http://localhost:8790/convierte.html?fbx=' + fbx); await p.waitForFunction(() => window.DONE, null, { timeout: 300000 }).catch(() => errs.push('timeout'));
  if (errs.length) console.log(errs.slice(0, 12).join('\n'));
  const o = await p.evaluate(() => window.OUT); if (!o) process.exit(1);
  fs.writeFileSync(out, Buffer.from(o.glb, 'base64'));
  console.log(JSON.stringify(o.info, null, 1), 'bytes', o.bytes); await b.close();
})();
