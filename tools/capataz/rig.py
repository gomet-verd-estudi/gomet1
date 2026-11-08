# Uso (desde tools/capataz/): tras trace.py, genera rig.json; el build lo junta con motor.js en assets/js/capataz.js.
# Rig del capataz: esqueleto de 15 huesos y pesos de piel (skinning) para cada punto de control del trazado.
# Un solo trazado relleno (el de la ilustración original); los huesos lo deforman sin cortes.
import json, math
import numpy as np
from PIL import Image, ImageDraw

curves = json.load(open('curves.json'))

# ---------- esqueleto (coordenadas de la ilustración, 1254 × 1235) ----------
# nombre: (padre, pivote, punta)
BONES = {
    'root':  (None,    (660, 700), (660, 700)),
    'torso': ('root',  (660, 700), (715, 360)),
    'head':  ('torso', (715, 365), (700, 110)),
    'armB1': ('torso', (575, 410), (285, 440)),
    'armB2': ('armB1', (285, 440), (80, 485)),
    'armF1': ('torso', (850, 420), (985, 355)),
    'armF2': ('armF1', (985, 355), (1130, 235)),
    'legB1': ('root',  (560, 715), (330, 930)),
    'legB2': ('legB1', (330, 930), (215, 915)),
    'legB3': ('legB2', (215, 915), (110, 1140)),
    'legF1': ('root',  (815, 715), (1005, 875)),
    'legF2': ('legF1', (1005, 875), (990, 1035)),
    'legF3': ('legF2', (990, 1035), (1185, 1000)),
}
NAMES = list(BONES)

# ---------- regiones de cada parte (polígonos); el resto es tronco ----------
REG = [
    ('head',  [(470, 0), (905, 0), (905, 285), (850, 300), (842, 352), (720, 378), (600, 352), (470, 340)]),
    ('armF',  [(850, 300), (905, 285), (960, 120), (1254, 40), (1254, 420), (905, 520), (882, 500), (878, 380)]),
    ('armB',  [(0, 360), (320, 290), (600, 300), (585, 375), (548, 470), (510, 548), (430, 566), (230, 640), (0, 640)]),
    ('legF',  [(735, 905), (875, 780), (885, 640), (1254, 640), (1254, 1235), (860, 1235), (870, 1060)]),
    ('legB',  [(0, 640), (230, 640), (430, 645), (470, 760), (600, 880), (735, 905), (870, 1060), (860, 1235), (0, 1235)]),
]
CHAIN = {'head': ['head'], 'armF': ['armF1', 'armF2'], 'armB': ['armB1', 'armB2'], 'legF': ['legF1', 'legF2', 'legF3'], 'legB': ['legB1', 'legB2', 'legB3'], 'torso': ['torso']}

def inside(p, poly):
    x, y = p; c = False
    for i in range(len(poly)):
        x1, y1 = poly[i]; x2, y2 = poly[(i + 1) % len(poly)]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c

def seg_d(p, a, b):
    ax, ay = a; bx, by = b; px, py = p
    dx, dy = bx - ax, by - ay; L = dx * dx + dy * dy or 1
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L))
    return math.hypot(px - ax - t * dx, py - ay - t * dy), t

def part_of(p):
    for name, poly in REG:
        if inside(p, poly): return name
    return 'torso'

# ---------- puntos de control: cada curva = inicio + puntos de cada segmento ----------
pts, tmpl = [], []
for c in curves:
    tmpl.append(['M', len(pts)]); pts.append(tuple(c['s']))
    for g in c['g']:
        if g[0] == 'L':
            tmpl.append(['L', len(pts)]); pts.append((g[1], g[2]))
            tmpl.append(['L', len(pts)]); pts.append((g[3], g[4]))
        else:
            tmpl.append(['C', len(pts)]); pts += [(g[1], g[2]), (g[3], g[4]), (g[5], g[6])]
    tmpl.append(['Z'])

R = 70  # radio de fusión en las articulaciones
def smooth(x): x = max(0, min(1, x)); return x * x * (3 - 2 * x)

weights = []
for p in pts:
    part = part_of(p)
    chain = CHAIN[part]
    # hueso principal: el segmento de la cadena más cercano
    best = min(chain, key=lambda b: seg_d(p, BONES[b][1], BONES[b][2])[0])
    w = {best: 1.0}
    # fusión con el padre cerca de la articulación (y del padre con el hijo, simétrico)
    par = BONES[best][0]
    if par:
        d = math.hypot(p[0] - BONES[best][1][0], p[1] - BONES[best][1][1])
        k = 0.5 * (1 - smooth(d / R))
        if k > 0: w[best] -= k; w[par] = w.get(par, 0) + k
    for ch, (pp, piv, tip) in BONES.items():
        if pp == best:
            d = math.hypot(p[0] - piv[0], p[1] - piv[1])
            k = 0.5 * (1 - smooth(d / R))
            if k > 0.01:
                w[best] -= k; w[ch] = w.get(ch, 0) + k
    s = sum(w.values()); w = {b: v / s for b, v in w.items() if v > 0.001}
    weights.append([[NAMES.index(b), round(v, 3)] for b, v in w.items()])

# ---------- suavizado espacial de los pesos ----------
# Los dos bordes de cada trazo (y los trazos que se tocan) deben moverse juntos: se promedian los pesos de los
# puntos vecinos con una gaussiana. Así no hay desgarros donde una región se encuentra con otra.
NB = len(NAMES)
Wd = np.zeros((len(pts), NB))
for i, w in enumerate(weights):
    for b, v in w: Wd[i, b] = v
PA = np.array(pts)
D2 = ((PA[:, None, :] - PA[None, :, :]) ** 2).sum(-1)
K = np.exp(-D2 / (2 * 22.0 ** 2)); K[D2 > 60.0 ** 2] = 0
K /= K.sum(1, keepdims=True)
for _ in range(3): Wd = K @ Wd
weights = []
for i in range(len(pts)):
    idx = np.argsort(-Wd[i])[:4]; v = Wd[i, idx]; keep = v > 0.02; idx, v = idx[keep], v[keep]; v = v / v.sum()
    weights.append([[int(b), round(float(x), 3)] for b, x in zip(idx, v)])

rig = {
    'bones': [{'n': n, 'p': NAMES.index(BONES[n][0]) if BONES[n][0] else -1, 'x': BONES[n][1][0], 'y': BONES[n][1][1]} for n in NAMES],
    'pts': [[round(x, 1), round(y, 1)] for x, y in pts],
    'w': weights, 't': tmpl, 'vb': [0, 0, 1254, 1235]
}
json.dump(rig, open('rig.json', 'w'), separators=(',', ':'))
print('puntos', len(pts), 'huesos', len(NAMES), 'bytes', len(json.dumps(rig, separators=(',', ':'))))

# ---------- comprobación visual: puntos coloreados por hueso principal y esqueleto ----------
COL = {'root': (120, 120, 120), 'torso': (90, 90, 90), 'head': (220, 40, 40), 'armB1': (40, 90, 220), 'armB2': (0, 170, 230), 'armF1': (230, 120, 0), 'armF2': (240, 190, 0),
       'legB1': (150, 40, 200), 'legB2': (220, 80, 200), 'legB3': (120, 0, 120), 'legF1': (0, 150, 90), 'legF2': (80, 200, 120), 'legF3': (0, 100, 60)}
im = Image.open('trace.png').convert('RGB').resize((1254, 1235))
im = Image.blend(im, Image.new('RGB', im.size, (255, 255, 255)), 0.55)
d = ImageDraw.Draw(im)
for name, poly in REG: d.polygon(poly, outline=(200, 200, 200))
for p, w in zip(pts, weights):
    b = max(w, key=lambda x: x[1])[0]; c = COL[NAMES[b]]
    mixed = len(w) > 1
    d.ellipse([p[0] - 5, p[1] - 5, p[0] + 5, p[1] + 5], fill=c, outline=(0, 0, 0) if mixed else None)
for n, (par, piv, tip) in BONES.items():
    d.line([piv, tip], fill=(0, 0, 0), width=5); d.ellipse([piv[0] - 9, piv[1] - 9, piv[0] + 9, piv[1] + 9], outline=(0, 0, 0), width=3)
    d.text((piv[0] + 10, piv[1] - 14), n, fill=(0, 0, 0))
im.save('rigdebug.png')
