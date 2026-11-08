# Uso (desde tools/capataz/): extraer la máscara verde de capataz-original.png en mask.npy y ejecutar este script.
# Genera curves.json (el trazado de potrace) que lee rig.py.
import numpy as np, json, time, potrace
from PIL import Image
mask = np.load('mask.npy')
X0, Y0 = 326, 662
m = mask[Y0:Y0 + 1235, X0:X0 + 1254]
t = time.time()
bm = potrace.Bitmap(~m)  # potrace rellena lo «oscuro» (0): la tinta
pl = bm.trace(turdsize=20, alphamax=1.0, opticurve=True, opttolerance=0.25)
print('trazado en', round(time.time() - t, 1), 's; curvas', len(pl))
curves = []
for c in pl:
    segs = []
    for s in c.segments:
        if s.is_corner: segs.append(['L', s.c.x, s.c.y, s.end_point.x, s.end_point.y])
        else: segs.append(['C', s.c1.x, s.c1.y, s.c2.x, s.c2.y, s.end_point.x, s.end_point.y])
    curves.append({'s': [c.start_point.x, c.start_point.y], 'g': segs})
json.dump(curves, open('curves.json', 'w'))
def d(c):
    o = f"M{c['s'][0]:.1f} {c['s'][1]:.1f}"
    for g in c['g']:
        if g[0] == 'L': o += f"L{g[1]:.1f} {g[2]:.1f}L{g[3]:.1f} {g[4]:.1f}"
        else: o += 'C' + ' '.join(f'{v:.1f}' for v in g[1:])
    return o + 'Z'
D = ''.join(d(c) for c in curves)
print('segmentos', sum(len(c['g']) for c in curves), 'bytes', len(D))
open('trace.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1235" width="627" height="618"><rect width="1254" height="1235" fill="#F4EFE6"/><path d="{D}" fill="#0A9651" fill-rule="evenodd"/></svg>')
