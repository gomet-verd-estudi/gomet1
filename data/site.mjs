/*
 * Contenido de gometverdestudi.com
 * --------------------------------
 * Todo lo que se lee en la web, menos los proyectos (data/projects.json).
 * Después de editar: `node tools/build.mjs`.
 */

export const STUDIO = {
  name: 'Gomet Verd Estudi',
  site: 'https://gometverdestudi.com',
  email: 'gometverdestudi@gmail.com',
  phone: '+34 684 450 515',
  phoneHref: '+34684450515',
  whatsapp: '34684450515',
  instagram: 'https://www.instagram.com/gometverdestudi/',
  instagramLabel: '@gometverdestudi',
  cities: 'Valencia · Barcelona',
  motto: 'ALWAYS WIPing',
  mottoLong: 'Working In Play',
  tagline: 'Estudio independiente de branding y dirección de arte entre Valencia y Barcelona.',
  desc: 'Gomet Verd Estudi es un estudio independiente de branding y dirección de arte en Valencia y Barcelona. Construimos marcas como edificios: de abajo arriba, en ocho fases y con una validación en cada capa.'
};

/* Lo que se puede encargar al estudio (el «programa» de piezas). Sale en el formulario de contacto. */
export const SERVICES = ['Identidad corporativa', 'Dirección de arte', 'Packaging', 'Diseño editorial', 'Lettering', 'Cartelería', 'Redes sociales', '3D', 'Títulos y créditos', 'Web'];

/*
 * EL MÉTODO GOMET — una marca se construye como un edificio.
 * Textos de la presentación «Método» (Figma Slides). Ocho fases en cuatro actos; cada fase
 * termina con una validación conjunta, y en la web cada validación es un gomet verde.
 *   layer → la capa del edificio      rows → [etiqueta, texto]
 *   val   → número de validación (o una nota cuando la fase no termina en validación)
 *   icon  → índice del dibujo de la fase en assets/figma/fases.svg
 */
export const ACTS = [
  { k: 'Entender', t: 'Escuchamos, investigamos y elegimos juntos dónde construir.', phases: '01–02' },
  { k: 'Definir', t: 'Levantamos la idea y las reglas de la marca.', phases: '03–04' },
  { k: 'Construir', t: 'Diseñamos cada pieza y la dejamos lista para el mundo real.', phases: '05–07' },
  { k: 'Mantener', t: 'Cuidamos la marca mientras crece.', phases: '08' }
];

export const INTRO = {
  title: 'Una marca se construye como un edificio',
  sub: 'Con orden, sobre un terreno que conocemos y con vosotros en cada decisión.',
  problem: {
    head: 'Muchas marcas empiezan por la fachada',
    text: 'Suele pasar con prisa: hace falta algo que enseñar, se diseña el logo y todo lo demás se resuelve sobre la marcha. Con el tiempo, nada encaja con nada.',
    rows: [
      ['Lo que se nota', 'Piezas que no encajan entre sí y decisiones que dependen del gusto de cada día.'],
      ['Lo que cuesta', 'Rehacer lo que ya estaba hecho cada vez que la marca crece.'],
      ['Lo que proponemos', 'Lo contrario: empezar por abajo y validar cada capa con vosotros.']
    ],
    labels: ['La fachada primero', 'Plantas que no encajan', 'Sin cimientos']
  },
  building: {
    head: 'Cada capa se apoya en la anterior',
    text: 'Trabajamos de lo grande a lo pequeño, en cuatro actos, y ninguna capa se levanta sin vuestro visto bueno.'
  }
};

export const PHASES = [
  {
    n: '01', key: 'Workshop', act: 'Entender', layer: 'El terreno', icon: 0,
    head: 'Antes de construir, estudiamos el terreno',
    text: 'Ninguna obra empieza sin pisar el suelo. El workshop es una conversación larga y sin prisas: nos contáis quiénes sois, qué os preocupa y hacia dónde queréis ir.',
    rows: [
      ['Qué hacemos', 'Preguntamos y, sobre todo, escuchamos: vuestra historia, vuestro público, la competencia, la misión, la visión y los valores.'],
      ['Qué recibís', 'El brief, que resume lo hablado, y el programa: las piezas que necesitará vuestra marca.'],
      ['Vuestro papel', 'Venir con tiempo y sin filtros. Lo que nos contéis aquí sostiene todo lo demás.']
    ],
    val: null
  },
  {
    n: '02', key: 'Estrategia', act: 'Entender', layer: 'El solar', icon: 1,
    head: 'Elegimos el solar con precisión quirúrgica',
    text: 'Con lo que nos contáis y lo que investigamos por nuestra cuenta, decidimos juntos dónde tiene sentido construir: el espacio que nadie ocupa y los límites del proyecto.',
    rows: [
      ['Espacio en el mercado', 'El hueco que la competencia deja libre y que vuestra marca puede ocupar con autoridad.'],
      ['Programa', 'Las piezas que necesitaréis, ya dimensionadas, para que el alcance no cambie a mitad de obra.'],
      ['Qué recibís', 'El documento estratégico: oportunidad, target, competencia y mapa de posicionamiento.']
    ],
    val: 1
  },
  {
    n: '03', key: 'Concepto', act: 'Definir', layer: 'Los cimientos', icon: 2,
    head: 'Nadie ve los cimientos. Todo se apoya en ellos',
    text: 'El concepto es la idea que sostendrá vuestra marca durante años. No se ve en el resultado final, pero si es sólido y propio, nada se cae.',
    rows: [
      ['Fundamentos', 'Filosofía, misión, visión, valores y ethos: lo que vuestra marca cree y defiende.'],
      ['Concepto raíz', 'La idea madre de la que sale todo, con su arquetipo, su propuesta única y su manifiesto.'],
      ['Vuestro papel', 'Validar la idea antes de pasar a lo visual. Es la decisión más importante del proyecto.']
    ],
    val: 2
  },
  {
    n: '04', key: 'Sistema', act: 'Definir', layer: 'La estructura', icon: 3,
    head: 'Cuatro pilares atraviesan todo el proyecto',
    text: 'De la idea nacen las reglas visuales y verbales de vuestra marca. Se deciden una vez y sostienen cada pieza, hoy y dentro de cinco años.',
    rows: [
      ['Tipografía', 'Cómo escribe vuestra marca: familias, jerarquías y tono de los textos.'],
      ['Retícula', 'Cómo ordena el espacio: márgenes, columnas y proporciones.'],
      ['Color', 'Su paleta y cómo se reparte: qué color manda y cuál acompaña.'],
      ['Imagen', 'Cómo fotografía, ilustra y retoca: luz, encuadres y tratamiento.']
    ],
    val: 3
  },
  {
    n: '05', key: 'Aplicaciones', act: 'Construir', layer: 'Las plantas', icon: 4,
    head: 'Cada planta es distinta. El edificio es uno',
    text: 'Las plantas son los lugares donde vive vuestra marca: la web, la papelería, el packaging, las redes. Cada una tiene su tamaño y sus necesidades, pero todas comparten pilares.',
    rows: [
      ['Qué hacemos', 'Diseñamos las piezas del programa, primero en conjunto y después una a una, adaptando la identidad a cada formato.'],
      ['Qué recibís', 'Todas las aplicaciones diseñadas y listas para revisar.'],
      ['Vuestro papel', 'Revisar y validar cada pieza. Como el programa se fijó al principio, no hay sorpresas de alcance.']
    ],
    val: 4
  },
  {
    n: '06', key: 'Artes finales', act: 'Construir', layer: 'Instalaciones y remates', icon: 5,
    head: 'Que todo funcione y esté bien rematado',
    text: 'Una casa con paredes pero sin luz ni agua no se puede habitar. Aquí convertimos el diseño aprobado en archivos que funcionan en el mundo real.',
    rows: [
      ['Instalaciones', 'Preparamos cada archivo para su destino, sea imprenta, pantalla o fabricante: formatos, colores, tintas y márgenes.'],
      ['Remates', 'Revisamos cada detalle antes de producir y resolvemos lo que solo aparece en obra: ajustes, pruebas y correcciones.'],
      ['Qué recibís', 'Los archivos finales, revisados y listos para producir sin sorpresas.']
    ],
    val: 5
  },
  {
    n: '07', key: 'Entrega', act: 'Construir', layer: 'Las llaves', icon: 6,
    head: 'Os damos las llaves y el libro del edificio',
    text: 'La marca pasa a ser completamente vuestra: con todo lo necesario para usarla sin depender de nadie y con las instrucciones para no estropearla.',
    rows: [
      ['Las llaves', 'Todos los archivos fuente, logotipos en todos sus formatos, tipografías, plantillas y accesos.'],
      ['El libro del edificio', 'El manual de marca: cómo se usa cada elemento, qué se puede hacer y qué no.'],
      ['Vuestro papel', 'Compartir el manual con cualquiera que trabaje con la marca, dentro o fuera de la empresa.']
    ],
    val: 'Llave en mano'
  },
  {
    n: '08', key: 'Mantenimiento', act: 'Mantener', layer: 'El edificio en uso', icon: 7,
    head: 'Seguimos cerca mientras el edificio se usa',
    text: 'Con el uso aparecen piezas nuevas, proveedores distintos y ganas de crecer. Durante el tiempo que haga falta, cuidamos con vosotros que la marca siga siendo reconocible.',
    rows: [
      ['Revisiones', 'Revisamos las piezas nuevas para que respeten los pilares, las haga quien las haga.'],
      ['Ajustes', 'Corregimos lo que se desvía o se desgasta con el uso antes de que se note.'],
      ['Ampliaciones', 'Diseñamos las nuevas plantas, como una campaña o un nuevo local, sobre la misma estructura.']
    ],
    val: 'Durante el tiempo necesario'
  }
];

/* Capas del edificio explotado (de arriba abajo), como en la lámina «El edificio». */
export const LAYERS = [
  { k: 'Llaves', ph: '07 Entrega', y: 352 },
  { k: 'Instalaciones y remates', ph: '06 Artes finales', y: 448 },
  { k: 'Plantas', ph: '05 Aplicaciones', y: 547.6 },
  { k: 'Estructura', ph: '04 Sistema', y: 688 },
  { k: 'Cimientos', ph: '03 Concepto', y: 826.1 },
  { k: 'Solar', ph: '01 Workshop y 02 Estrategia', y: 960 }
];

/* Técnica y creatividad: la viga de celosía. */
export const CRITERIA = {
  head: 'Pensamos como arquitectos y calculamos como ingenieros',
  text: 'Gomet une dos maneras de trabajar que casi siempre van por separado: el análisis técnico, con datos y pruebas, y la creatividad que nace de la investigación y del análisis conceptual.',
  rows: [
    ['La parte técnica', 'Datos, análisis de mercado, pruebas y cálculo: lo que hace que una marca funcione.'],
    ['La parte creativa', 'Investigación cultural, análisis conceptual y curaduría: lo que hace que una marca sea única.'],
    ['Juntas', 'Avanzan a la vez en cada fase y ninguna decide sola.']
  ],
  truss: {
    head: 'Técnica y creatividad avanzan juntas en cada fase',
    text: 'Como en una viga de celosía, dos piezas unidas por triángulos soportan mucho más que por separado. En cada validación se cruzan, y lo que avanza es la idea más interesante, comprobada con datos.',
    tech: ['Datos del negocio', 'Mercado y competencia', 'Análisis semántico', 'Pruebas de legibilidad', 'Pruebas de uso por formato', 'Pruebas de producción', 'Archivos y documentación', 'Auditoría de coherencia'],
    crea: ['Escucha e intuiciones', 'Lectura cultural y referentes', 'Exploración conceptual', 'Exploración formal y curaduría', 'Dirección de arte', 'Oficio y detalle', 'Relato de la marca', 'Nuevas ideas sobre la estructura']
  }
};

/* Curaduría y evidencia: cómo se elige y cómo se comprueba. */
export const FILTERS = {
  curate: {
    head: 'Exploramos mucho para elegir una sola cosa',
    text: 'La creatividad sin criterio es azar. Abrimos todos los caminos posibles y los pasamos por filtros explícitos hasta quedarnos con la solución más interesante. Y os explicamos por qué.',
    rows: [['Pertinente', 'Responde a la estrategia y al concepto, no a una moda.'], ['Propia', 'No se parece a lo que ya hay en vuestro sector.'], ['Viable', 'Funciona en todas las plantas, en pantalla y en producción.']]
  },
  proof: {
    head: 'Cada decisión tiene una razón y una prueba',
    text: 'No os pedimos que confiéis en nuestro gusto: os enseñamos por qué. Cada propuesta llega con su argumento estratégico y con las pruebas que la sostienen.',
    rows: [['Reconocimiento', '¿Se identifica en un instante, incluso sin el logotipo?'], ['Legibilidad', '¿Se lee de lejos, en pequeño y en movimiento?'], ['Coherencia', '¿Funciona igual en todas las plantas del edificio?'], ['Producción', '¿Aguanta el soporte real: papel, pantalla, tela o metal?']]
  },
  result: {
    head: 'El método es siempre el mismo. El resultado, nunca',
    text: 'Seguimos el mismo orden en cada proyecto precisamente para que el resultado pueda ser distinto: una marca que solo podría ser vuestra, sostenida por la investigación y comprobada antes de salir a la calle.',
    rows: [['Lo que se repite', 'El orden, el rigor y las validaciones.'], ['Lo que nunca se repite', 'La idea, la forma y la manera de contarla.']]
  }
};

/* Quién construye y cómo nos organizamos. */
export const CREW = {
  head: 'Un equipo fijo y los mejores gremios',
  text: 'Nuestro equipo fijo hace el grueso del proyecto. Cuando una planta pide un oficio concreto, sumamos especialistas de confianza.',
  rows: [
    ['Equipo fijo', 'Estrategia, dirección creativa, identidad, tipografía, editorial…'],
    ['Especialistas', 'Creación audiovisual, estrategia de redes, desarrollo web…'],
    ['Producción', 'Impresión, packaging, rotulación, fabricación, merchandising…'],
    ['Un solo interlocutor', 'Coordinamos a todos: no tenéis que gestionar proveedores.']
  ],
  together: {
    head: 'Trabajamos con vosotros, no para vosotros',
    text: 'Un proyecto de marca es una obra compartida. Estas son las reglas de convivencia que la hacen fácil, clara y sin sorpresas.',
    rows: [['Una persona de referencia', 'Os acompaña de principio a fin y conoce cada decisión.'], ['Un ritmo fijo', 'Reuniones por cada fase, breves y con decisiones.'], ['Todo a la vista', 'Un espacio compartido con el material del proyecto, siempre al día.']]
  }
};

/* Ficha técnica del estudio. */
export const SPECS = [
  ['Estudio', 'Gomet Verd Estudi (GVE)'],
  ['Tipo', 'Estudio independiente de branding y dirección de arte'],
  ['Ubicación', 'Valencia · Barcelona'],
  ['Especialidad', 'Moda independiente, música y cultura'],
  ['Método', 'Una marca se construye como un edificio: ocho fases en cuatro actos'],
  ['Modo de trabajo', 'ALWAYS WIPing — Working In Play'],
  ['Piezas incluidas', 'Identidad, dirección de arte, packaging, editorial, lettering, cartelería, redes, 3D, títulos y web'],
];

/* Preguntas frecuentes. */
export const FAQ = [
  ['¿Cuánto dura un proyecto?', 'Depende del programa de piezas. Lo fijamos en el workshop y tenéis el calendario desde el primer día.'],
  ['¿Qué necesitáis de nosotros?', 'Tiempo para el workshop, una persona que decida y respuestas en los plazos pactados.'],
  ['¿Y si una propuesta no nos convence?', 'Lo hablamos. Cada propuesta se defiende desde la estrategia, así que discutimos razones, no gustos.'],
  ['¿Podemos cambiar algo ya aprobado?', 'Sí, pero cuanto más abajo está la capa, más cuesta moverla. Por eso validamos en orden.'],
  ['¿Qué nos llevamos al final?', 'Todos los archivos, las licencias y el manual. La marca es completamente vuestra.'],
  ['¿Y cuando termine el proyecto?', 'Si lo necesitáis, seguimos cuidando la marca con vosotros durante el tiempo que haga falta.']
];

export const START = {
  head: 'El primer paso es una conversación',
  text: 'Empezamos por el workshop: una sesión con las personas que deciden. Después tendréis el brief y el calendario de toda la obra.',
  need: 'Una fecha, una sala y a las personas que mejor conocen vuestra marca.'
};

/* Hoja de pedido (/#pedido): se envía desde el correo o el WhatsApp de quien la rellena. */
export const ORDER = {
  stage: ['Una marca nueva', 'Un rediseño', 'Una pieza o campaña', 'Otra cosa'],
  when: ['Lo antes posible', 'En 1–3 meses', 'Más adelante', 'Sin fecha'],
  budgets: ['Menos de 1.500 €', '1.500 – 3.000 €', '3.000 – 6.000 €', 'Más de 6.000 €', 'Prefiero hablarlo'],
  reply: 'Solemos responder en dos días laborables.'
};

export const CLIENTS = ['Vintage Palace', '404 Studio', 'Claur Tiles', 'Bernal', 'D’Matinada', 'Orbis Vacui', 'Leo Rizzi', 'Kaniche Pedigree Hot Dogs'];

/* Lo que veréis: las láminas de entregables de la presentación «Método», con sus diagramas. */
export const VEREIS = {
  brief: {
    ph: 'Fase 01, Workshop: el terreno', note: 'Lo recibiréis tras el workshop',
    head: 'Después del workshop recibiréis el brief',
    text: 'Un documento breve que recoge lo que nos contasteis y lo convierte en un punto de partida compartido. Lo revisamos juntos y lo firmamos antes de seguir.',
    rows: [
      ['Vuestro contexto', 'Quiénes sois, qué hacéis y en qué mercado competís, contado con vuestras palabras.'],
      ['El problema', 'Lo que hoy le impide a vuestra marca crecer o diferenciarse, dicho en una frase.'],
      ['Los objetivos', 'Lo que tiene que conseguir el proyecto y cómo sabremos que lo ha conseguido.'],
      ['El programa', 'La lista de piezas que vamos a construir, para que el alcance esté claro desde el principio.'],
      ['El calendario', 'Las fechas de cada fase y de cada validación.']
    ]
  },
  oportunidad: {
    ph: 'Fase 02, Estrategia: el solar', note: 'Lo veréis en el documento estratégico',
    head: 'El hallazgo que lo ordena todo',
    text: 'Al terminar la investigación os presentaremos la oportunidad: una verdad de vuestro mercado que nadie está aprovechando y que vuestra marca puede ocupar. Es la conclusión que guía todo lo demás.',
    cols: [['Lo que hemos visto', 'Qué está pasando en vuestro mercado, con datos y observación.'], ['Lo que proponemos', 'La postura que debería tomar vuestra marca ante eso.'], ['Lo que cambia', 'Cómo esa postura guiará cada decisión a partir de ahí.']]
  },
  target: {
    ph: 'Fase 02, Estrategia: el solar', note: 'Lo veréis en el documento estratégico',
    head: 'Os mostraremos a quién sirve vuestra marca',
    text: 'No en forma de perfiles inventados, sino en tres círculos: quién la compra y la usa, quién le da reputación y quién la recomienda.',
    table: [
      ['Primario', 'Quien compra y usa vuestro producto de forma habitual.', 'Es a quien escuchamos primero: cada decisión se mide contra él.'],
      ['Secundario', 'Quien se acerca por afinidad con lo que representáis.', 'Aporta visibilidad y reputación a vuestra marca.'],
      ['Terciario', 'Quien recomienda: expertos, medios, tiendas o profesionales.', 'Su opinión abre la puerta a los demás.']
    ],
    need: 'Para cada uno describimos qué necesita resolver con vuestra marca. Así las decisiones de diseño dejan de ser una cuestión de gusto.'
  },
  competencia: {
    ph: 'Fase 02, Estrategia: el solar', note: 'Lo veréis en el documento estratégico',
    head: 'Veréis dónde está vuestro hueco en el mercado',
    text: 'Situamos a vuestros competidores y a marcas de referencia de otros sectores en un mapa. El espacio que nadie ocupa es donde os propondremos construir.',
    take: 'Un análisis de cada marca estudiada: lo que conviene copiar, lo que conviene adaptar y lo que conviene evitar.'
  },
  idea: {
    ph: 'Fase 03, Concepto: los cimientos', note: 'Lo veréis en la presentación de concepto',
    head: 'La idea madre',
    steps: [['Realidad observada', 'Lo que vemos en vuestro mercado.'], ['Insight de mercado', 'Lo que significa.'], ['Insight de marca', 'La postura de vuestra marca.'], ['Territorio', 'El espacio creativo.'], ['Concepto', 'La frase de la que sale todo.']],
    text: 'Os mostraremos el camino completo hasta el concepto, paso a paso, para que entendáis por qué es ese y no otro.',
    unique: 'Lo que vuestra marca ofrece y nadie más, en una frase'
  },
  pilares: {
    ph: 'Fase 04, Sistema: la estructura', note: 'Lo veréis en el sistema de identidad',
    head: 'Los cuatro pilares que diseñaremos para vuestra marca',
    items: [
      ['Tipografía', 'Una familia con carácter para los titulares y otra de servicio para textos, precios y datos.'],
      ['Retícula', 'El orden que compartirán todas vuestras piezas, de la más pequeña a la más grande.'],
      ['Color', 'Una paleta con jerarquía: qué color manda, cuál acompaña y cuál aparece solo como acento.'],
      ['Imagen', 'Cómo se fotografía, se ilustra y se retoca vuestra marca: luz, encuadre y tratamiento.']
    ]
  },
  plantas: {
    ph: 'Fase 05, Aplicaciones: las plantas', note: 'Lo veréis en las aplicaciones',
    head: 'Cada pieza, pensada para su sitio',
    text: 'Diseñaremos cada pieza de vuestro programa sabiendo qué tiene que conseguir, a quién sirve y qué pilares usa. Por ejemplo:',
    table: [
      ['Papelería', 'Presentar la marca en formatos pequeños.', 'Clientes y proveedores.', 'Tipografía y color.'],
      ['Packaging', 'Destacar en el lineal y proteger el producto.', 'Quien compra.', 'Los cuatro.'],
      ['Espacio y señalética', 'Leerse a distancia, de día y de noche.', 'Quien pasa por la calle.', 'Tipografía y color.'],
      ['Web', 'Informar y vender en pocos pasos.', 'Todos los públicos.', 'Retícula e imagen.'],
      ['Redes sociales', 'Publicar a menudo sin perder coherencia.', 'Clientes y seguidores.', 'Plantillas y registros.'],
      ['Editorial y campañas', 'Contar la historia con profundidad.', 'Prensa y prescriptores.', 'Los cuatro.']
    ]
  }
};

/* Síntesis de cada fase para la obra a pantalla completa de la portada: una frase y lo que se recibe. */
export const SYNTH = [
  { short: 'Una conversación larga y sin prisas: quiénes sois, qué os preocupa y hacia dónde queréis ir.', get: 'El brief y el programa de piezas' },
  { short: 'Investigamos el mercado y decidimos juntos dónde construir: el hueco que nadie ocupa.', get: 'El documento estratégico' },
  { short: 'La idea madre que sostendrá vuestra marca durante años. No se ve, pero todo se apoya en ella.', get: 'Fundamentos, concepto raíz y manifiesto' },
  { short: 'Tipografía, retícula, color e imagen: reglas que se deciden una vez y sostienen cada pieza.', get: 'El sistema de identidad' },
  { short: 'Papelería, web, packaging y redes: cada pieza en su formato, todas sobre los mismos pilares.', get: 'Todas las aplicaciones del programa' },
  { short: 'El diseño aprobado se convierte en archivos que funcionan en imprenta, pantalla y fábrica.', get: 'Artes finales revisadas y probadas' },
  { short: 'La marca pasa a ser vuestra: archivos fuente, licencias y el manual para no estropearla.', get: 'Llave en mano' },
  { short: 'Revisamos, ajustamos y ampliamos sobre la misma estructura mientras la marca crece.', get: 'Acompañamiento durante el tiempo necesario' }
];

/* Lo que se señala en el dibujo en cada fase: cada nombre lleva su número en la obra */
export const PARTS = [
  ['Competencia', 'Sector', 'Público'],
  ['Programa', 'Espacio en el mercado'],
  ['Fundamentos', 'Concepto raíz'],
  ['Tipografía', 'Retícula', 'Color', 'Imagen'],
  ['Papelería', 'Web', 'Packaging', 'Redes sociales'],
  ['Remates', 'Instalaciones', 'Imprenta', 'Pantalla', 'Fabricante'],
  ['Llaves', 'Libro del edificio'],
  ['Revisiones', 'Ajustes', 'Ampliaciones']
];
