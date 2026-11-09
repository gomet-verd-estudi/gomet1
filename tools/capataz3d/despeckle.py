# Limpia la textura de color: las islas diminutas de un color (restos de bordes suavizados, motas) pasan al color que
# las rodea. Se respetan los brillos de los ojos (blanco rodeado de negro). Uso: despeckle.py entrada salida [umbral]
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]; T = int(sys.argv[3]) if len(sys.argv) > 3 else 48
PAL = [(255, 255, 255), (255, 203, 43), (244, 194, 164), (46, 166, 72), (31, 99, 214), (20, 110, 60), (58, 58, 58), (27, 25, 25)]
im = np.array(Image.open(src).convert('RGB')).astype(int)
d = np.stack([np.abs(im - c).sum(2) for c in PAL]); idx = d.argmin(0)
k8 = np.ones((3, 3), bool); total = 0
# antes: el gris (y el verde oscuro) que bordea los rasgos de la cara es el borde suavizado del negro (bigote, ojos,
# patillas) cuantizado; pegado a la piel, pasa a negro (si no, sale como una línea de puntos alrededor de los rasgos)
skin = idx == 2
nearskin = ndimage.binary_dilation(skin, structure=k8, iterations=4)
for c in (6, 5):
    m = (idx == c) & nearskin
    total += int(m.sum()); idx[m] = 7
for it in range(3):
    changed = 0
    for i in range(len(PAL)):
        lab, n = ndimage.label(idx == i, structure=k8)
        if not n: continue
        sizes = np.bincount(lab.ravel()); objs = ndimage.find_objects(lab)
        for j in range(1, n + 1):
            if sizes[j] >= T: continue
            sl = objs[j - 1]; y0, y1 = max(0, sl[0].start - 2), sl[0].stop + 2; x0, x1 = max(0, sl[1].start - 2), sl[1].stop + 2
            m = lab[y0:y1, x0:x1] == j
            ring = ndimage.binary_dilation(m, structure=k8) & ~m
            around = idx[y0:y1, x0:x1][ring]
            if not around.size: continue
            cnt = np.bincount(around, minlength=len(PAL))
            if i == 0 and cnt[7] >= 0.6 * around.size: continue  # brillo del ojo
            idx[y0:y1, x0:x1][m] = cnt.argmax(); changed += int(m.sum())
    total += changed
    if not changed: break
out = np.array(PAL, np.uint8)[idx]
Image.fromarray(out).save(dst)
print('texels cambiados', total)
