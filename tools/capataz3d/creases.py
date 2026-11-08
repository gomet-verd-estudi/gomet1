# Mapa de líneas finas en el espacio UV: pliegues y detalles del relieve, limpios y con grosor uniforme.
import sys, json, struct, io
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
SP = sys.argv[1]; T = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5; MINLEN = int(sys.argv[3]) if len(sys.argv) > 3 else 40
b = open(SP + '/in-glb/model.glb', 'rb').read(); off = 12; ch = []
while off < len(b):
    l, t = struct.unpack('<I4s', b[off:off + 8]); ch.append(b[off + 8:off + 8 + l]); off += 8 + l
J = json.loads(ch[0]); BIN = ch[1]
def acc(i):
    a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]; dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
    stride = bv.get('byteStride', 0)
    if stride and stride != n * np.dtype(dt).itemsize:
        raw = np.frombuffer(BIN, np.uint8, a['count'] * stride, o).reshape(a['count'], stride)
        return np.frombuffer(raw[:, :n * np.dtype(dt).itemsize].tobytes(), dt).reshape(a['count'], n)
    return np.frombuffer(BIN, dt, a['count'] * n, o).reshape(a['count'], n)
pr = J['meshes'][0]['primitives'][0]
uv = acc(pr['attributes']['TEXCOORD_0']); idx = acc(pr['indices']).reshape(-1, 3)
S = 2048
cov = Image.new('L', (S, S), 0); d = ImageDraw.Draw(cov)
for tri in idx: d.polygon([(uv[k, 0] * S, uv[k, 1] * S) for k in tri], fill=255)
cov = np.asarray(cov) > 0
inner = ndimage.binary_erosion(cov, iterations=5)
rel = np.asarray(Image.open(SP + '/web/relief.png').convert('RGB')).astype(np.float32) / 127.5 - 1
rel = np.stack([ndimage.gaussian_filter(rel[..., k], 1.2) for k in range(3)], -1)
g = np.zeros(rel.shape[:2], np.float32)
for k in range(3): g += np.hypot(ndimage.sobel(rel[..., k], 0), ndimage.sobel(rel[..., k], 1))
g /= 8
edge = (g > T) & inner
# limpiar: quitar manchas cortas, adelgazar a una línea central y redibujar con grosor uniforme
lab, n = ndimage.label(edge, np.ones((3, 3)))
sizes = ndimage.sum(edge, lab, range(1, n + 1))
keep = np.isin(lab, np.nonzero(sizes >= MINLEN)[0] + 1)
def thin(img):
    img = img.astype(np.uint8).copy()
    while True:
        changed = False
        for step in (0, 1):
            P = np.pad(img, 1)
            p2, p3, p4, p5 = P[:-2, 1:-1], P[:-2, 2:], P[1:-1, 2:], P[2:, 2:]
            p6, p7, p8, p9 = P[2:, 1:-1], P[2:, :-2], P[1:-1, :-2], P[:-2, :-2]
            Bn = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9
            seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
            A = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(np.uint8) for i in range(8))
            c1, c2 = (p2 * p4 * p6, p4 * p6 * p8) if step == 0 else (p2 * p4 * p8, p2 * p6 * p8)
            m = (img == 1) & (Bn >= 2) & (Bn <= 6) & (A == 1) & (c1 == 0) & (c2 == 0)
            if m.any(): img[m] = 0; changed = True
        if not changed: return img > 0
sk = thin(keep)
lab, n = ndimage.label(sk, np.ones((3, 3))); sizes = ndimage.sum(sk, lab, range(1, n + 1))
sk = np.isin(lab, np.nonzero(sizes >= MINLEN * 0.4)[0] + 1)
line = ndimage.binary_dilation(sk, structure=ndimage.generate_binary_structure(2, 1), iterations=2)
Image.fromarray((line * 255).astype(np.uint8)).save(SP + '/web/creases.png', optimize=True)
print('T', T, 'componentes', n, 'px línea', int(line.sum()))
