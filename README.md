# gometverdestudi.com

Web de **Gomet Verd Estudi**, estudio independiente de branding y dirección de arte entre Valencia y Barcelona.

La web entera es un manual de montaje: el folleto que viene dentro de la cápsula de un huevo sorpresa, dibujado como unas instrucciones japonesas. Papel fino, tinta negra, trama de puntos y una sola tinta plana, el verde del gomet.

Es una web estática: sin servidor, sin base de datos y sin dependencias.

## Recorrido

| Ruta | Qué es |
|---|---|
| `index.html` | **La tapa**: al hacer scroll el huevo se abre (gira, se abre por la línea, sale la cápsula, se abre y se despliegan las instrucciones). Dentro: *Gracias por abrir este huevo* y los avisos (A) la serie completa de modelos, «¡Colecciónalos todos!»; (B) las piezas sueltas (servicios) en una matriz de maqueta; (C) el método en siete pasos; (D) la hoja de gomets, que se despegan y se pegan por la página; (E) la hoja de pedido |
| `about/` | **Manual del estudio**: quiénes somos, especificaciones, precauciones, **el método Gomet** paso a paso (qué pones tú y qué sale de cada paso), las reglas del juego (ALWAYS WIPing: Working In Play), «¿Crees que algo no funciona?» y fabricante |
| `modelos/<slug>/` | **Hoja de montaje** de cada proyecto: contenido de la cápsula (servicios), herramientas (equipo), figura 1 (modelo terminado), los pasos (galería con visor) y «¡Modelo terminado!» |
| `404.html` | «Falta una pieza» |

## Cambiar contenido

1. Textos del estudio, método, avisos, piezas, hoja de pedido y gomets: `data/site.mjs`.
2. Proyectos (textos, servicios, equipo, portada y pasos): `data/projects.json`. Salen de los proyectos de Gomet Verd Estudi del portfolio de Manel Vila; sus medios están en `media/<slug>/`.
3. Dibujos (huevo, pasos del método, pictogramas): `tools/figures.mjs`. Estilos: `assets/css/gve.css`. Interacción: `assets/js/gve.js`.
4. Regenera las páginas: `node tools/build.mjs` (Node 18 o superior).

`index.html`, `about/`, `modelos/`, `404.html`, `sitemap.xml` y `robots.txt` se generan: no los edites a mano.

## Hoja de pedido

Quien la rellena la envía desde su propio correo o su WhatsApp, ya escrita: la web no guarda datos. Correo, teléfono y tramos de presupuesto: `STUDIO` y `ORDER` en `data/site.mjs`. Para llegar con un proyecto de referencia marcado: `/?m=claur-tiles#pedido` (lo usan los botones «Pedir un modelo como este»).

## Publicar

Cualquier hosting estático (Cloudflare Pages, Netlify, GitHub Pages) sirviendo la raíz del repositorio. Sin paso de build: las páginas generadas están en el repositorio. El dominio previsto es `gometverdestudi.com` (`STUDIO.site` en `data/site.mjs`; se usa en canonical, Open Graph y sitemap).
