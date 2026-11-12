# Tintas planas para el modelo nuevo: cada texel de la textura (que trae sombreado suave) pasa al color plano de su
# zona. Uso: planas.py entrada.png salida.png [lado]
import sys
import numpy as np
from PIL import Image, ImageFilter
src, dst = sys.argv[1], sys.argv[2]; N = int(sys.argv[3]) if len(sys.argv) > 3 else 2048
# colores de la textura (centros medidos) → tinta plana que les toca
FLAT = {'piel': (200, 170, 155), 'azul': (35, 103, 199), 'negro': (21, 19, 19), 'amarillo': (201, 181, 92), 'verde': (66, 166, 69), 'castaño': (74, 21, 11), 'blanco': (244, 244, 242)}
SRC = [((196, 166, 150), 'piel'), ((198, 175, 161), 'piel'), ((35, 103, 199), 'azul'), ((64, 120, 203), 'azul'), ((20, 18, 18), 'negro'), ((2, 1, 1), 'negro'), ((14, 10, 9), 'negro'), ((40, 39, 39), 'negro'),
       ((197, 179, 91), 'amarillo'), ((66, 166, 69), 'verde'), ((90, 173, 97), 'verde'), ((74, 21, 11), 'castaño'), ((123, 87, 74), 'castaño'), ((166, 176, 189), 'blanco'), ((225, 228, 232), 'blanco')]
names = list(FLAT); im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.int32); H, W = a.shape[:2]
idx = np.zeros((H, W), np.uint8)
for y0 in range(0, H, 512):   # por franjas, para no gastar memoria
    blk = a[y0:y0 + 512]; d = np.stack([((blk - np.array(c)) ** 2).sum(2) for c, _ in SRC]); k = np.array([names.index(n) for _, n in SRC], np.uint8)[d.argmin(0)]
    # el castaño del pelo es rojizo de verdad (mucho más rojo que verde); los tonos pardos apagados son el borde suavizado
    # entre lo negro y la piel, y van a uno de los dos
    r, g = blk[..., 0], blk[..., 1]; hair = (r > 1.9 * g) & (r > 30)
    d2 = np.stack([((blk - np.array(c)) ** 2).sum(2) for c, n in SRC if n != 'castaño']); k2 = np.array([names.index(n) for _, n in SRC if n != 'castaño'], np.uint8)[d2.argmin(0)]
    idx[y0:y0 + 512] = np.where(hair, names.index('castaño'), k2)
# bordes limpios: mayoría 5 × 5 a tamaño completo y luego a su tamaño final
m = Image.fromarray(idx, 'L').filter(ImageFilter.ModeFilter(5))
if N != W: m = m.resize((N, N), Image.NEAREST).filter(ImageFilter.ModeFilter(3))
out = Image.fromarray(np.array([FLAT[n] for n in names], np.uint8)[np.asarray(m)])
out.save(dst); cnt = np.bincount(np.asarray(m).ravel(), minlength=len(names))
print({n: round(float(c) / cnt.sum() * 100, 1) for n, c in zip(names, cnt)})
