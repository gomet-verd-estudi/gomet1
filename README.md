# gometverdestudi.com

Web de **Gomet Verd Estudi**, estudio independiente de branding y dirección de arte entre Valencia y Barcelona.

La web entera es un manual de montaje: el folleto que viene dentro de la cápsula de un huevo sorpresa, dibujado como unas instrucciones japonesas. Papel fino, tinta negra, trama de puntos y una sola tinta plana, el verde del gomet.

Es una web estática: sin servidor, sin base de datos y sin dependencias.

## Recorrido

| Ruta | Qué es |
|---|---|
| `index.html` | **La tapa**: al hacer scroll el huevo se abre (gira, se abre por la línea, sale la cápsula, se abre y se despliegan las instrucciones). Dentro: *Gracias por abrir este huevo* y los avisos (A) la serie completa de modelos, «¡Colecciónalos todos!»; (B) las piezas sueltas (servicios) en una matriz de maqueta; (C) el método en ocho iconos: una marca se construye como un edificio; (D) la hoja de gomets, que se despegan y se pegan por la página; (E) la hoja de pedido |
| `about/` | **Manual del estudio**: quiénes somos, especificaciones y precauciones. Después, **el método Gomet** en láminas con la estética de la presentación «Método» de Figma: una marca se construye como un edificio. La fachada primero (lo que suele pasar), el edificio explotado que se monta capa a capa al hacer scroll, las ocho fases (workshop, estrategia, concepto, sistema, aplicaciones, artes finales, entrega y mantenimiento), fases y validaciones, criterio (la viga de celosía entre técnica y creatividad), curaduría, evidencia, ALWAYS WIPing, resultado, quién construye, preguntas frecuentes y el primer paso. Cada validación es un gomet verde |
| `modelos/<slug>/` | **Hoja de montaje** de cada proyecto: contenido de la cápsula (servicios), herramientas (equipo), figura 1 (modelo terminado), los pasos (galería con visor) y «¡Modelo terminado!» |
| `404.html` | «Falta una pieza» |

## Cambiar contenido

1. Textos del estudio, el método (fases, actos, capas, criterio, preguntas), avisos, piezas, hoja de pedido y gomets: `data/site.mjs`.
2. Proyectos (textos, servicios, equipo, portada y pasos): `data/projects.json`. Salen de los proyectos de Gomet Verd Estudi del portfolio de Manel Vila; sus medios están en `media/<slug>/`.
3. Dibujos: `tools/figures.mjs` (huevo, pictogramas y el recorte y rotulado de las láminas). Los dibujos del método y el logotipo están en `assets/figma/`, exportados en SVG de la presentación «Método» de Figma; si cambian allí, vuelve a exportarlos con el mismo nombre. Estilos: `assets/css/gve.css`. Interacción: `assets/js/gve.js`.
4. Regenera las páginas: `node tools/build.mjs` (Node 18 o superior).

`index.html`, `about/`, `modelos/`, `404.html`, `sitemap.xml` y `robots.txt` se generan: no los edites a mano.

## Hoja de pedido

Quien la rellena la envía desde su propio correo o su WhatsApp, ya escrita: la web no guarda datos. Correo, teléfono y tramos de presupuesto: `STUDIO` y `ORDER` en `data/site.mjs`. Para llegar con un proyecto de referencia marcado: `/?m=claur-tiles#pedido` (lo usan los botones «Pedir un modelo como este»).

## Publicar

Cualquier hosting estático (Cloudflare Pages, Netlify, GitHub Pages) sirviendo la raíz del repositorio. Sin paso de build: las páginas generadas están en el repositorio. El dominio previsto es `gometverdestudi.com` (`STUDIO.site` en `data/site.mjs`; se usa en canonical, Open Graph y sitemap).
