# gometverdestudi.com

Web de **Gomet Verd Estudi**, estudio independiente de branding y dirección de arte entre Valencia y Barcelona.

Una marca se construye como un edificio. La web lo enseña: en la portada, el edificio se levanta capa a capa mientras se hace scroll, una fase del método en cada capa y un gomet verde en cada validación. La estética (blanco, grises, Archivo, títulos entre corchetes y axonometrías de línea) y los dibujos salen de la presentación «Método» de Figma.

Es una web estática: sin servidor, sin base de datos y sin dependencias.

## Páginas

| Ruta | Qué es |
|---|---|
| `index.html` | **Portada**: el edificio en obra. A la izquierda pasan las ocho fases (workshop, estrategia, concepto, sistema, aplicaciones, artes finales, entrega y mantenimiento); a la derecha, el plano en fantasma se va construyendo con el scroll y cada validación se marca con un gomet verde. Debajo, una selección de obras, el criterio (la viga de celosía entre técnica y creatividad) y el estudio |
| `metodo/` | El método completo en láminas: lo que suele pasar (la fachada primero), el edificio, las ocho fases, fases y validaciones, criterio, curaduría, evidencia, resultado y preguntas frecuentes |
| `obras/`, `obras/<slug>/` | Todos los proyectos y la ficha de cada uno: programa de piezas, gremios, imágenes con visor y «¿Construimos la vuestra?» |
| `estudio/` | Quiénes somos, ficha del estudio, ALWAYS WIPing, ecosistema, cómo nos organizamos, clientes y gremios |
| `contacto/` | El primer paso: un formulario que se envía ya escrito desde el correo o el WhatsApp de quien lo rellena (la web no guarda datos). `contacto/?obra=claur-tiles` llega con la obra de referencia marcada |
| `404.html` | «Esta página no está en el plano» |

## Cambiar contenido

1. Textos: `data/site.mjs` (estudio, servicios, el método con sus fases, actos y capas, criterio, preguntas, contacto).
2. Proyectos (textos, servicios, equipo, portada e imágenes): `data/projects.json`. Sus medios están en `media/<slug>/`.
3. Dibujos: `assets/figma/` guarda los SVG exportados de la presentación «Método» (edificio, fases, fachada y logotipo). `tools/figures.mjs` los recorta, los rotula y los agrupa por capas para animarlos. Si cambian en Figma, vuelve a exportarlos con el mismo nombre.
4. Estilos: `assets/css/gve.css`. Interacción: `assets/js/gve.js`.
5. Regenera las páginas: `node tools/build.mjs` (Node 18 o superior).

`index.html`, `metodo/`, `obras/`, `estudio/`, `contacto/`, `404.html`, `sitemap.xml` y `robots.txt` se generan: no los edites a mano.

## Publicar

Cualquier hosting estático (Cloudflare Pages, Netlify, GitHub Pages) sirviendo la raíz del repositorio. Sin paso de build: las páginas generadas están en el repositorio. El dominio previsto es `gometverdestudi.com` (`STUDIO.site` en `data/site.mjs`; se usa en canonical, Open Graph y sitemap).
