// Prepara el modelo para la web: sin la textura que no se usa, sin datos sobrantes y con la geometría cuantizada
// (KHR_mesh_quantization, que GLTFLoader lee sin decodificadores).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, quantize, dedup } from '@gltf-transform/functions';
const [src, dst] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
for (const m of doc.getRoot().listMaterials()) { m.setNormalTexture(null); m.setBaseColorTexture(null); }
for (const t of doc.getRoot().listTextures()) t.dispose();
await doc.transform(dedup(), prune({ keepAttributes: true }), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 14, quantizeWeight: 10 }));
await io.write(dst, doc);
