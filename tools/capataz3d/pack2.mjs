// Prepara el modelo nuevo (GLB salido del FBX) para la web: une vértices repetidos (el FBX viene sin índices),
// quita lo que sobra y cuantiza la geometría (KHR_mesh_quantization, que GLTFLoader lee sin decodificadores).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, quantize, dedup, weld } from '@gltf-transform/functions';
const [src, dst] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
for (const m of doc.getRoot().listMaterials()) { m.setNormalTexture(null); m.setBaseColorTexture(null); m.setEmissiveTexture(null); m.setOcclusionTexture(null); m.setMetallicRoughnessTexture(null); }
for (const t of doc.getRoot().listTextures()) t.dispose();
await doc.transform(weld(), dedup(), prune({ keepAttributes: true }), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 14, quantizeWeight: 10 }));
const r = doc.getRoot();
console.log('mallas', r.listMeshes().length, 'vértices', r.listMeshes().map((m) => m.listPrimitives().map((p) => p.getAttribute('POSITION').getCount())).flat(), 'pieles', r.listSkins().length, 'huesos', r.listSkins().map((s) => s.listJoints().length), 'nodos', r.listNodes().length);
await io.write(dst, doc);
