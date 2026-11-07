/*
 * Contenido de gometverdestudi.com
 * --------------------------------
 * Todo lo que se lee en la web, menos los proyectos (data/projects.json).
 * Después de editar: `node tools/build.mjs`.
 *
 * Los textos en japonés son las etiquetas de un manual de montaje: no hace falta traducirlas.
 */

export const STUDIO = {
  name: 'Gomet Verd Estudi',
  short: 'GVE',
  jp: 'ゴメット・ベルド・エストゥディ',
  site: 'https://gometverdestudi.com',
  email: 'gometverdestudi@gmail.com',
  phone: '+34 684 450 515',
  phoneHref: '+34684450515',
  whatsapp: '34684450515',
  instagram: 'https://www.instagram.com/gometverdestudi/',
  instagramLabel: '@gometverdestudi',
  cities: 'Valencia · Barcelona',
  edition: 'Edición 2026',
  motto: 'ALWAYS WIPing',
  mottoLong: 'Working In Play',
  tagline: 'Estudio independiente de branding y dirección de arte entre Valencia y Barcelona.',
  desc: 'Gomet Verd Estudi es un estudio independiente de branding y dirección de arte en Valencia y Barcelona. Identidades para moda independiente, música y cultura, montadas paso a paso y jugando.'
};

/* Piezas sueltas del estudio (servicios). Salen en la matriz de piezas «B» de la portada y en la hoja de pedido. */
export const PARTS = [
  { code: 'B1', name: 'Identidad corporativa', jp: 'ロゴ', shape: 'circle' },
  { code: 'B2', name: 'Dirección de arte', jp: 'アートディレクション', shape: 'pill' },
  { code: 'B3', name: 'Packaging', jp: 'パッケージ', shape: 'square' },
  { code: 'B4', name: 'Diseño editorial', jp: '編集', shape: 'pill' },
  { code: 'B5', name: 'Lettering', jp: 'レタリング', shape: 'circle' },
  { code: 'B6', name: 'Cartelería', jp: 'ポスター', shape: 'square' },
  { code: 'B7', name: 'Redes sociales', jp: 'SNS', shape: 'pill' },
  { code: 'B8', name: '3D', jp: '立体', shape: 'circle' },
  { code: 'B9', name: 'Títulos y créditos', jp: 'タイトル', shape: 'pill' },
  { code: 'B10', name: 'Web', jp: 'ウェブ', shape: 'square' }
];

/* Avisos del interior de la tapa: el humor de los manuales, con la estrategia del estudio dentro. */
export const WARNINGS = [
  'Contiene piezas pequeñas de gran carácter.',
  'No apto para marcas sin ganas de jugar.',
  'Puede provocar ganas irrefrenables de cambiar de logo.',
  'Lee las instrucciones antes de empezar. O sáltatelas: también es parte del juego.'
];

/*
 * EL MÉTODO GOMET — siete pasos, del huevo cerrado al gomet verde.
 *   you  → lo que pone quien nos encarga el proyecto
 *   out  → lo que sale de ese paso
 *   fig  → dibujo del paso (tools/figures.mjs)
 */
export const METHOD = [
  {
    n: 1, fig: 'talk', title: 'Abrir el huevo', jp: '開ける', name: 'La conversación',
    text: 'Todo proyecto empieza con una conversación. Antes de dibujar nada escuchamos: qué quiere ser la marca, a quién le habla, qué la hace distinta y qué la está frenando. Lo que no se cuenta aquí no se puede diseñar después.',
    you: 'La historia, las dudas y las ganas.',
    out: 'Un brief compartido.'
  },
  {
    n: 2, fig: 'parts', title: 'Sacar las piezas', jp: '部品を確認する', name: 'Estrategia',
    text: 'Ponemos todas las piezas sobre la mesa: público, competencia, tono, lo que ya funciona y lo que sobra. Ordenarlas es la estrategia: decidir qué va a contar la marca, a quién y dónde tiene que sonar.',
    you: 'Lo que sabes de tu público y de tu sector.',
    out: 'Posicionamiento y territorio de marca.'
  },
  {
    n: 3, fig: 'thread', title: 'Encontrar el hilo', jp: '物語', name: 'Narrativa',
    text: 'Buscamos el concepto que lo une todo: una idea lo bastante clara para explicarla en una frase y lo bastante abierta para jugar con ella durante años. El cine quinqui en 404 Studio, la heráldica en Vintage Palace, las plantas que bailan junto al río en el cartel de Leo Rizzi.',
    you: 'Tu opinión sincera.',
    out: 'Concepto y relato.'
  },
  {
    n: 4, fig: 'play', title: 'Jugar con las piezas', jp: '遊ぶ', name: 'Exploración visual',
    text: 'Aquí empieza el juego, y se juega en equipo con quien nos lo encarga. Bocetos, lettering, tipografía, color, fotografía, 3D: probamos rápido, giramos las piezas, rompemos alguna y nos quedamos con las que encajan. Es nuestro ALWAYS WIPing: Working In Play.',
    you: 'Ganas de jugar (y de equivocarnos juntos).',
    out: 'Rutas visuales para elegir.'
  },
  {
    n: 5, fig: 'build', title: 'Montar el sistema', jp: '組み立てる', name: 'Identidad',
    text: 'Con la ruta elegida construimos el sistema completo: logotipo, tipografía, color, imagen, tono y reglas de uso. No se queda en el logo: es un sistema pensado para que funcione igual en una etiqueta, un cartel, un envase o una pantalla.',
    you: 'Validación en cada encaje.',
    out: 'Sistema de identidad.'
  },
  {
    n: 6, fig: 'click', title: '¡Clic!', jp: 'カチッ', name: 'Aplicaciones',
    text: 'Las piezas encajan de verdad cuando salen al mundo: packaging, redes, cartelería, merchandising, vinilos, títulos, web. Acompañamos cada aplicación hasta la última, para llegar a algo que se pueda ver, tocar o poner en movimiento.',
    you: 'Canales, fechas y prioridades.',
    out: 'Piezas finales y guía de uso.'
  },
  {
    n: 7, fig: 'gomet', title: 'Pegar el gomet', jp: 'シールを貼る', name: 'Cuidado',
    text: 'En el cole, un gomet verde era la señal de un trabajo bien hecho. Revisamos cada pieza, entregamos los archivos ordenados y seguimos cerca: una marca viva necesita que alguien la cuide después del lanzamiento.',
    you: 'Nada más. Ya está montado.',
    out: 'Entrega, archivos y acompañamiento.'
  }
];

/* Las reglas del juego (principios). */
export const RULES = [
  { k: 'Curiosidad', t: 'Seguir siendo curiosos, proyecto tras proyecto.' },
  { k: 'Cuestionar', t: 'Preguntar por qué se hace siempre igual, y probar otra cosa.' },
  { k: 'Disfrutar', t: 'Disfrutar del proceso, porque al final se nota en el resultado.' },
  { k: 'En equipo', t: 'Del primer boceto a la última aplicación, con quien nos lo encarga.' }
];

/* Ficha técnica del estudio (仕様). */
export const SPECS = [
  ['Modelo', 'Gomet Verd Estudi (GVE)'],
  ['Tipo', 'Estudio independiente de branding y dirección de arte'],
  ['Ubicación', 'Valencia · Barcelona'],
  ['Especialidad', 'Moda independiente, música y cultura'],
  ['Funciona con', 'Conversación, curiosidad y juego'],
  ['Modo de trabajo', 'ALWAYS WIPing — Working In Play'],
  ['Piezas incluidas', 'Identidad, dirección de arte, packaging, editorial, lettering, cartelería, redes, 3D, títulos y web'],
  ['Edad recomendada', 'Cualquier marca con algo que contar']
];

/* 故障かな？と思ったら — «¿Crees que está roto?»: las dudas de siempre, resueltas como en un manual. */
export const TROUBLE = [
  ['Mi marca no tiene nada especial que contar.', 'Aún no la hemos escuchado.', 'Paso ①. Siempre hay algo: nuestro trabajo es encontrarlo.'],
  ['Ya tengo logo, pero no funciona.', 'Un logo suelto no es un sistema.', 'Pasos ② y ⑤: lo revisamos y le construimos un sistema alrededor.'],
  ['Las piezas no encajan entre sí.', 'Falta un concepto común.', 'Paso ③: un hilo que lo una todo, del post al desfile.'],
  ['Lo necesito para ya.', 'Hay un lanzamiento, una gira o un desfile a la vista.', 'Pon la fecha en la hoja de pedido y montamos un plan por fases.'],
  ['No sé qué presupuesto hace falta.', 'Depende del número de piezas.', 'Elige un tramo orientativo o «prefiero hablarlo». Ajustamos las piezas, nunca el cuidado.']
];

/* Hoja de pedido (/#pedido): se envía desde el correo o el WhatsApp de quien la rellena. */
export const ORDER = {
  stage: ['Una marca nueva', 'Un rediseño', 'Una pieza o campaña', 'Otra cosa'],
  when: ['Lo antes posible', 'En 1–3 meses', 'Más adelante', 'Sin fecha'],
  budgets: ['Menos de 1.500 €', '1.500 – 3.000 €', '3.000 – 6.000 €', 'Más de 6.000 €', 'Prefiero hablarlo'],
  reply: 'Solemos responder en dos días laborables.'
};

export const CLIENTS = ['Vintage Palace', '404 Studio', 'Claur Tiles', 'Bernal', 'D’Matinada', 'Orbis Vacui', 'Leo Rizzi', 'Kaniche Pedigree Hot Dogs'];

/* Gomets de la hoja de pegatinas (se pueden despegar y pegar por toda la web). */
export const STICKERS = [
  { t: '¡Bien hecho!', c: 'g' }, { t: 'WIP', c: 'g' }, { t: 'GVE', c: 'k' }, { t: '遊', c: 'g' },
  { t: 'Hola', c: 'y' }, { t: 'VLC', c: 'k' }, { t: 'BCN', c: 'k' }, { t: '+1', c: 'g' },
  { t: '★', c: 'y' }, { t: 'OK', c: 'g' }, { t: 'カチッ', c: 'r' }, { t: '♡', c: 'g' }
];
