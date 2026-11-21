/*
 * Gomet · Method — the content, synthesised (EN and ES side by side).
 * One idea per line: short headline, one-sentence lead, rows of 1–3 words + one line.
 * Duplicated plates merged (39 → 34). The 8 phases, the sign-offs and every drawing stay.
 * num: the original slide (for its thumbnail and the "original slide" view) · scene: the drawing it shows.
 */
window.DECK_I18N = (function () {
  function P(num, scene, sec, sub, title, name, blocks, kind) {
    var o = { num: num, scene: scene, sec: sec, sub: sub, title: title, name: name, blocks: blocks };
    if (kind) o.kind = kind;
    return o;
  }
  var en = [
    P(1, 0, "", "", "", "Cover", [["cover"]], "cover"),
    P(2, 0, "Introduction", "How we work", "[Method]", "Introduction", [
      ["lead", "A brand is built like a building"],
      ["caps", "In order, on solid ground, and with you in every decision."]
    ]),
    P(3, 3, "Method", "What usually happens", "[Method]", "The façade", [
      ["h", "Many brands start with the façade"],
      ["p", "In a rush, the logo comes first and the rest is improvised. Over time, nothing fits."],
      ["img", "v03", "Stacked floors that don't fit, with the façade designed first and no foundations"],
      ["items", [["The symptom", "Pieces that don't match and decisions made by taste."], ["The cost", "Redoing work every time the brand grows."], ["Our way", "Start from the ground and sign off every layer with you."]]]
    ]),
    P(4, 4, "Method", "The building", "[Method]", "The building", [
      ["h", "Each layer rests on the one before"],
      ["p", "From the big picture to the detail, in four acts. Nothing goes up without your sign-off."],
      ["img", "v04", "The building in layers: site, foundations, structure, floors, utilities and finishes, keys"],
      ["items", [["Understand", "We listen, research and choose where to build."], ["Define", "We raise the idea and its rules."], ["Build", "We design every piece, ready for the real world."], ["Maintain", "We look after the brand as it grows."]]],
      ["meta", ["Each circle is a sign-off with you"]]
    ]),
    P(5, 5, "Workshop", "Phase 01 · The ground", "[Workshop]", "Workshop", [
      ["h", "First, we survey the ground"],
      ["p", "An unhurried conversation: who you are, what worries you and where you want to go."],
      ["img", "v05", "The plot surrounded by competitors, industry and audience"],
      ["items", [["We do", "Ask and, above all, listen."], ["You get", "The brief and the program: the pieces your brand will need."], ["Your part", "Time and candour. Everything else rests on this."]]]
    ]),
    P(6, 0, "Brief", "Phase 01 · Deliverable", "[Brief]", "Brief", [
      ["h", "The brief: a shared starting point"],
      ["p", "A short document we review and sign together before moving on."],
      ["items", [["Context", "Who you are and where you compete, in your words."], ["Problem", "What holds the brand back, in one sentence."], ["Goals", "What the project must achieve, and how we'll know."], ["Program and dates", "Every piece and every phase, clear from day one."]]]
    ]),
    P(7, 7, "Strategy", "Phase 02 · The site", "[Strategy]", "Strategy", [
      ["h", "We choose where to build"],
      ["p", "Your input and our research: the space no one occupies and the limits of the project."],
      ["img", "v07", "The chosen plot, with the program and the market space"],
      ["items", [["Market space", "The gap competitors leave, for your brand to take."], ["Program", "Pieces sized up front, so the scope doesn't drift."], ["You get", "The strategy document: opportunity, target, competitors and map."]]],
      ["meta", ["Sign-off 01"]]
    ]),
    P(8, 0, "Opportunity", "Phase 02 · Deliverable", "[Opportunity]", "Opportunity", [
      ["lead", "The finding that puts everything in order"],
      ["p", "A truth in your market that no one is using and your brand can own."],
      ["items", [["What we see", "What's happening, backed by data."], ["What we propose", "The stance your brand should take."], ["What changes", "Every decision follows from it."]]]
    ]),
    P(9, 9, "Target", "Phase 02 · Deliverable", "[Target]", "Target", [
      ["h", "Who your brand serves"],
      ["p", "Three circles instead of made-up personas."],
      ["img", "v09", "Three concentric circles: primary, secondary and tertiary"],
      ["items", [["Primary", "Buys and uses it. The measure of every decision."], ["Secondary", "Comes closer by affinity. Brings visibility."], ["Tertiary", "Recommends: experts, media, retailers. Opens doors."]]]
    ]),
    P(10, 10, "Competitors", "Phase 02 · Deliverable", "[Competitors]", "Competitors", [
      ["h", "Where your gap is"],
      ["p", "Competitors and benchmarks on one map. Where no one stands, we build."],
      ["img", "v10", "Positioning map: exclusive–accessible, functional–emotional, with the open space"],
      ["items", [["You take away", "What to copy, adapt or avoid, brand by brand."]]]
    ]),
    P(11, 11, "Concept", "Phase 03 · The foundations", "[Concept]", "Concept", [
      ["h", "No one sees the foundations. Everything rests on them"],
      ["p", "The idea that holds your brand up for years. Invisible, but if it's solid and yours, nothing falls."],
      ["img", "v11", "The foundations below ground level"],
      ["items", [["Fundamentals", "What your brand believes in and stands for."], ["Root concept", "The core idea, with its archetype, proposition and manifesto."], ["Your part", "Sign off the idea before any visuals."]]],
      ["meta", ["Sign-off 02"]]
    ]),
    P(12, 0, "Fundamentals", "Phase 03 · Deliverable", "[Fundamentals]", "Fundamentals", [
      ["h", "What your brand believes, does and wants"],
      ["items", [["Philosophy", "Three or four principles: why it exists. The filter for every decision."], ["Mission", "What it does every day, in one verifiable sentence."], ["Vision", "Where it's going: ambitious, but credible."], ["Values", "Three to five, each with a sentence and a behaviour that proves it."], ["Ethos", "Its character and the tone it speaks in."]]],
      ["quote", "Values are what we do. Ethos is who we are when no one is watching"]
    ]),
    P(14, 0, "Archetype", "Phase 03 · Deliverable", "[Archetype]", "Archetype", [
      ["h", "Your brand's character"],
      ["p", "Three archetypes decide how it speaks, how it shows itself and what it would never do."],
      ["items", [["Primary", "What it is at its core."], ["Secondary", "How it treats people."], ["Modulator", "The counterweight that keeps the balance."], ["Never", "The ones we ruled out, and why."]]]
    ]),
    P(15, 0, "Concept", "Phase 03 · Deliverable", "[Concept]", "Core idea", [
      ["lead", "The core idea, step by step"],
      ["p", "You'll see the whole path, so you know why it's this one and not another."],
      ["steps", [["01", "Observed reality", "What we see in your market."], ["02", "Market insight", "What it means."], ["03", "Brand insight", "Your brand's stance."], ["04", "Territory", "The creative space."], ["05", "Concept", "The line everything stems from."]]],
      ["items", [["Unique proposition", "What only your brand offers, in one sentence."], ["Manifesto", "Your brand out loud, in one minute: for the web, the packaging, social media and the team."]]]
    ]),
    P(17, 17, "System", "Phase 04 · The structure", "[System]", "System", [
      ["h", "Four pillars hold up every piece"],
      ["p", "Visual and verbal rules, decided once and valid for years."],
      ["img", "v17", "Four pillars on a foundation slab: typography, grid, color and imagery"],
      ["items", [["Typography", "How the brand writes."], ["Grid", "How it orders space."], ["Color", "Which colour leads and which supports."], ["Imagery", "How it photographs and illustrates."]]],
      ["meta", ["Sign-off 03"]]
    ]),
    P(18, 18, "Pillars", "Phase 04 · Deliverable", "[Pillars]", "Pillars", [
      ["h", "The four pillars, designed for you"],
      ["pillars", [["v18a", "Typography", "A family with character for headlines, a workhorse for text and data."], ["v18b", "Grid", "One order shared by every piece, from small to large."], ["v18c", "Color", "A palette with hierarchy: lead, support and accent."], ["v18d", "Imagery", "Light, framing and treatment for photos and illustration."]]]
    ]),
    P(19, 0, "Registers", "Phase 04 · Deliverable", "[Registers]", "Registers", [
      ["h", "The voice has rules too"],
      ["p", "Key lines and tones, designed like the visual pillars."],
      ["items", [["Main line", "The one everyone remembers."], ["Supporting lines", "How the brand keeps its promise."], ["Vocabulary", "The team's own words."], ["Technical", "How it's made. Precise, with data."], ["Emotional", "How it feels. Warm and sensory."], ["Documentary", "Real life. Direct, unvarnished."]]]
    ]),
    P(20, 20, "Applications", "Phase 05 · The floors", "[Applications]", "Applications", [
      ["h", "Every floor is different. The building is one"],
      ["p", "Web, stationery, packaging, social media: each with its needs, all on the same pillars."],
      ["img", "v20", "A building whose floors are stationery, web, packaging and social media"],
      ["items", [["We do", "Design the program as a whole, then piece by piece."], ["You get", "Every application, ready for review."], ["Your part", "Sign off each piece. No scope surprises."]]],
      ["meta", ["Sign-off 04"]]
    ]),
    P(21, 0, "Floors", "Phase 05 · Deliverable", "[Floors]", "Floors", [
      ["h", "Each piece, designed for its place"],
      ["p", "What it must achieve, for whom and with which pillars. For example:"],
      ["items", [["Packaging", "Stand out on the shelf and protect the product. All four pillars."], ["Signage", "Be read from afar, day and night. Type and colour."], ["Web", "Inform and sell in a few steps. Grid and imagery."], ["Social media", "Post often without losing consistency. Templates and registers."]]]
    ]),
    P(22, 22, "Final artwork", "Phase 06 · Utilities and finishes", "[Final artwork]", "Final artwork", [
      ["h", "Fully working, properly finished"],
      ["p", "A house without power or water can't be lived in. We turn the design into files that work in the real world."],
      ["img", "v22", "The building with its utilities, finishes and destinations: printer, screen and manufacturer"],
      ["items", [["Utilities", "Every file ready for its destination: print, screen or fabrication."], ["Finishes", "Colour proofs, scale tests and final corrections."], ["You get", "Production-ready files, with no surprises."]]],
      ["meta", ["Sign-off 05"]]
    ]),
    P(24, 24, "Handover", "Phase 07 · The keys", "[Handover]", "Handover", [
      ["h", "The keys and the building manual"],
      ["p", "The brand becomes fully yours: everything to use it on your own, and the rules not to break it."],
      ["img", "v24", "The finished building with its keys and building manual"],
      ["items", [["The keys", "Source files, logos, licensed typefaces, templates and logins."], ["The manual", "The brand guidelines: what to do and what not."], ["Decisions page", "The strategy on one page, to check before any new piece."]]],
      ["meta", ["Turnkey"]]
    ]),
    P(26, 26, "Maintenance", "Phase 08 · The building in use", "[Maintenance]", "Maintenance", [
      ["h", "We stay close while the building is in use"],
      ["p", "New pieces, new suppliers, growth: we keep the brand recognisable."],
      ["img", "v26", "The building in use, with extensions, reviews and adjustments"],
      ["items", [["Reviews", "New pieces checked against the pillars, whoever makes them."], ["Adjustments", "We fix what drifts and update the guidelines."], ["Extensions", "New floors — a campaign, a line, a location — on the same structure."], ["Cadence", "Support for as long as needed, with agreed reviews."]]],
      ["meta", ["For as long as needed"]]
    ]),
    P(28, 0, "Method", "Phases and sign-offs", "[Method]", "Sign-offs", [
      ["h", "Nothing advances without your sign-off"],
      ["p", "Each phase closes with a joint sign-off and the next builds on it. No one undoes what was right."],
      ["wide", "v28", "Timeline of the eight phases grouped in four acts, with a sign-off between phases"]
    ]),
    P(29, 29, "Judgment", "Technique and creativity", "[Judgment]", "Judgment", [
      ["h", "We think like architects and calculate like engineers"],
      ["p", "Data and testing on one side; research and concept on the other. Rarely together. Always, with us."],
      ["img", "v29", "A building measured by calculation and shaped by design"],
      ["items", [["Technical", "Data, market and tests: what makes it work."], ["Creative", "Culture, concept and curation: what makes it unique."], ["Together", "Neither decides alone."]]]
    ]),
    P(30, 0, "Crossover", "In every phase", "[Crossover]", "Crossover", [
      ["h", "Two ways of working, crossing at every phase"],
      ["p", "Like a truss: joined, they bear far more. What moves forward is the most interesting idea, tested against data."],
      ["wide", "v30", "A truss: technical work on top, creative work below, crossing at every phase"]
    ]),
    P(31, 31, "Curation", "Open up and choose", "[Curation]", "Curation", [
      ["h", "We explore a lot to choose one thing"],
      ["p", "Creativity without judgment is chance. Every path goes through three filters, and we tell you why the winner won."],
      ["img", "v31", "Every option filtered by relevance, ownability and viability down to one solution"],
      ["items", [["Relevant", "It answers to the strategy, not to a trend."], ["Ownable", "Unlike anything in your industry."], ["Viable", "It works on every floor, on screen and in production."]]]
    ]),
    P(32, 32, "Evidence", "Nothing on impulse", "[Evidence]", "Evidence", [
      ["h", "Every decision has a reason and a test"],
      ["p", "Not our taste: the rationale and the tests behind every proposal."],
      ["img", "v32", "A sign viewed up close, at a distance and in passing"],
      ["items", [["Recognition", "Recognisable in an instant, even without the logo?"], ["Legibility", "Readable from afar, small and in motion?"], ["Consistency", "The same on every floor?"], ["Production", "Does it hold up on paper, screen, fabric or metal?"]]]
    ]),
    P(33, 33, "Result", "Every brand, unique", "[Result]", "Result", [
      ["h", "Same method. Never the same result"],
      ["p", "The same order makes room for a brand that could only be yours."],
      ["img", "v33", "Three different buildings on the same grid: product, hospitality and culture"],
      ["items", [["Repeats", "The order, the rigour and the sign-offs."], ["Never repeats", "The idea, the form and the story."]]]
    ]),
    P(34, 34, "Ecosystem", "Who builds", "[Ecosystem]", "Ecosystem", [
      ["h", "A core team and the best trades"],
      ["p", "The core team does the bulk. When a floor needs a specific trade, trusted specialists join."],
      ["img", "v34", "The core team with audiovisual, social media, web development and production specialists"],
      ["items", [["Core team", "Strategy, creative direction, identity, typography, editorial, etc."], ["Specialists", "Video, social media, web development, etc."], ["Production", "Print, packaging, signage, fabrication, etc."], ["One contact", "We coordinate everyone. You don't manage suppliers."]]]
    ]),
    P(35, 0, "Ecosystem", "Phase by phase", "[Ecosystem]", "Who, when", [
      ["h", "Each trade joins when its floor needs it"],
      ["p", "The core team stays from start to finish; the rest join their phases, coordinated by the studio."],
      ["legend", ["Leads", "Takes part", "Signs off"]],
      ["wide", "v35", "Who takes part in each of the eight phases"]
    ]),
    P(36, 36, "Together", "How we organise", "[Together]", "Together", [
      ["h", "We work with you, not for you"],
      ["p", "A shared build, with house rules that keep it easy and clear."],
      ["img", "v36", "A shared build with people on both sides"],
      ["items", [["One point person", "[Name], from start to finish."], ["A steady rhythm", "Short decision meetings; replies within [24 h]."], ["In plain sight", "One shared space, always up to date."]]]
    ]),
    P(37, 0, "Questions", "Frequently asked", "[Questions]", "Questions", [
      ["h", "What almost everyone asks"],
      ["qa", [["How long does it take?", "It depends on the program. We set it in the workshop; you have the schedule from day one."], ["What do you need from us?", "Time for the workshop, one decision-maker and replies on time."], ["What if a proposal doesn't convince us?", "We talk it through, with reasons from the strategy, not tastes."], ["Can we change something already approved?", "Yes, but the lower the layer, the harder it moves. That's why we sign off in order."], ["What do we take away?", "Every file, every licence and the guidelines. The brand is all yours."], ["And when it ends?", "If you need it, we keep looking after the brand with you."]]]
    ]),
    P(38, 38, "Let's start", "The first step", "[Let's start]", "Let's start", [
      ["h", "The first step is a conversation"],
      ["p", "A [3]-hour workshop with the decision-makers. In [2] weeks: the brief and the whole schedule."],
      ["img", "v38", "The empty site, where everything starts"],
      ["items", [["We need", "A date, a room and the people who know your brand best."]]],
      ["contact"]
    ]),
    P(39, 0, "", "", "", "Closing", [["closing"]], "closing")
  ];

  var es = [
    P(1, 0, "", "", "", "Portada", [["cover"]], "cover"),
    P(2, 0, "Introducción", "Cómo trabajamos", "[Método]", "Introducción", [
      ["lead", "Una marca se construye como un edificio"],
      ["caps", "Con orden, sobre terreno firme y con vosotros en cada decisión."]
    ]),
    P(3, 3, "Método", "Lo que suele pasar", "[Método]", "La fachada", [
      ["h", "Muchas marcas empiezan por la fachada"],
      ["p", "Con prisa, primero va el logo y el resto se improvisa. Con el tiempo, nada encaja."],
      ["img", "v03", "Plantas apiladas que no encajan, con la fachada diseñada primero y sin cimientos"],
      ["items", [["El síntoma", "Piezas que no casan y decisiones según el gusto del día."], ["El coste", "Rehacer lo hecho cada vez que la marca crece."], ["Nuestra forma", "Empezar por el suelo y validar cada capa con vosotros."]]]
    ]),
    P(4, 4, "Método", "El edificio", "[Método]", "El edificio", [
      ["h", "Cada capa se apoya en la anterior"],
      ["p", "De lo grande a lo pequeño, en cuatro actos. Nada se levanta sin vuestro visto bueno."],
      ["img", "v04", "El edificio por capas: solar, cimientos, estructura, plantas, instalaciones y remates, llaves"],
      ["items", [["Entender", "Escuchamos, investigamos y elegimos dónde construir."], ["Definir", "Levantamos la idea y sus reglas."], ["Construir", "Diseñamos cada pieza, lista para el mundo real."], ["Mantener", "Cuidamos la marca mientras crece."]]],
      ["meta", ["Cada círculo es una validación con vosotros"]]
    ]),
    P(5, 5, "Workshop", "Fase 01 · El terreno", "[Workshop]", "Workshop", [
      ["h", "Primero, estudiamos el terreno"],
      ["p", "Una conversación sin prisas: quiénes sois, qué os preocupa y hacia dónde queréis ir."],
      ["img", "v05", "El solar rodeado de competencia, sector y público"],
      ["items", [["Hacemos", "Preguntar y, sobre todo, escuchar."], ["Recibís", "El brief y el programa: las piezas que necesitará vuestra marca."], ["Vuestra parte", "Tiempo y sinceridad. Todo lo demás se apoya en esto."]]]
    ]),
    P(6, 0, "Brief", "Fase 01 · Entregable", "[Brief]", "Brief", [
      ["h", "El brief: un punto de partida compartido"],
      ["p", "Un documento breve que revisamos y firmamos juntos antes de seguir."],
      ["items", [["Contexto", "Quiénes sois y dónde competís, con vuestras palabras."], ["Problema", "Lo que frena a la marca, en una frase."], ["Objetivos", "Lo que debe conseguir el proyecto y cómo lo sabremos."], ["Programa y fechas", "Cada pieza y cada fase, claras desde el primer día."]]]
    ]),
    P(7, 7, "Estrategia", "Fase 02 · El solar", "[Estrategia]", "Estrategia", [
      ["h", "Elegimos dónde construir"],
      ["p", "Lo que nos contáis y lo que investigamos: el espacio que nadie ocupa y los límites del proyecto."],
      ["img", "v07", "El solar elegido, con el programa y el espacio en el mercado"],
      ["items", [["Espacio en el mercado", "El hueco que deja la competencia, para que lo ocupe vuestra marca."], ["Programa", "Piezas dimensionadas desde el inicio, para que el alcance no cambie."], ["Recibís", "El documento estratégico: oportunidad, target, competencia y mapa."]]],
      ["meta", ["Validación 01"]]
    ]),
    P(8, 0, "Oportunidad", "Fase 02 · Entregable", "[Oportunidad]", "Oportunidad", [
      ["lead", "El hallazgo que lo ordena todo"],
      ["p", "Una verdad de vuestro mercado que nadie aprovecha y que vuestra marca puede hacer suya."],
      ["items", [["Lo que vemos", "Qué está pasando, con datos."], ["Lo que proponemos", "La postura que debe tomar vuestra marca."], ["Lo que cambia", "Cada decisión parte de ahí."]]]
    ]),
    P(9, 9, "Target", "Fase 02 · Entregable", "[Target]", "Target", [
      ["h", "A quién sirve vuestra marca"],
      ["p", "Tres círculos en lugar de perfiles inventados."],
      ["img", "v09", "Tres círculos concéntricos: primario, secundario y terciario"],
      ["items", [["Primario", "La compra y la usa. La medida de cada decisión."], ["Secundario", "Se acerca por afinidad. Aporta visibilidad."], ["Terciario", "La recomienda: expertos, medios, tiendas. Abre puertas."]]]
    ]),
    P(10, 10, "Competencia", "Fase 02 · Entregable", "[Competencia]", "Competencia", [
      ["h", "Dónde está vuestro hueco"],
      ["p", "Competidores y referentes en un mismo mapa. Donde no hay nadie, construimos."],
      ["img", "v10", "Mapa de posicionamiento: exclusivo–accesible, funcional–emocional, con el espacio libre"],
      ["items", [["Os lleváis", "Qué copiar, qué adaptar y qué evitar, marca a marca."]]]
    ]),
    P(11, 11, "Concepto", "Fase 03 · Los cimientos", "[Concepto]", "Concepto", [
      ["h", "Nadie ve los cimientos. Todo se apoya en ellos"],
      ["p", "La idea que sostiene vuestra marca durante años. No se ve, pero si es sólida y propia, nada se cae."],
      ["img", "v11", "Los cimientos bajo el nivel del suelo"],
      ["items", [["Fundamentos", "Lo que vuestra marca cree y defiende."], ["Concepto raíz", "La idea madre, con su arquetipo, su propuesta y su manifiesto."], ["Vuestra parte", "Validar la idea antes de pasar a lo visual."]]],
      ["meta", ["Validación 02"]]
    ]),
    P(12, 0, "Fundamentos", "Fase 03 · Entregable", "[Fundamentos]", "Fundamentos", [
      ["h", "Lo que vuestra marca cree, hace y quiere"],
      ["items", [["Filosofía", "Tres o cuatro principios: por qué existe. El filtro de cada decisión."], ["Misión", "Lo que hace cada día, en una frase verificable."], ["Visión", "Hacia dónde va: ambiciosa, pero creíble."], ["Valores", "Entre tres y cinco, cada uno con una frase y una conducta que lo demuestra."], ["Ethos", "Su carácter y el tono con el que habla."]]],
      ["quote", "Los valores son lo que hacemos. El ethos es cómo somos cuando nadie mira"]
    ]),
    P(14, 0, "Arquetipo", "Fase 03 · Entregable", "[Arquetipo]", "Arquetipo", [
      ["h", "El carácter de vuestra marca"],
      ["p", "Tres arquetipos deciden cómo habla, cómo se muestra y qué nunca haría."],
      ["items", [["Primario", "Lo que es en esencia."], ["Secundario", "Cómo trata a la gente."], ["Modulador", "El contrapeso que mantiene el equilibrio."], ["Nunca", "Los que descartamos, y por qué."]]]
    ]),
    P(15, 0, "Concepto", "Fase 03 · Entregable", "[Concepto]", "Idea madre", [
      ["lead", "La idea madre, paso a paso"],
      ["p", "Veréis el camino completo, para que sepáis por qué es esa y no otra."],
      ["steps", [["01", "Realidad observada", "Lo que vemos en vuestro mercado."], ["02", "Insight de mercado", "Lo que significa."], ["03", "Insight de marca", "La postura de vuestra marca."], ["04", "Territorio", "El espacio creativo."], ["05", "Concepto", "La frase de la que sale todo."]]],
      ["items", [["Propuesta única", "Lo que solo ofrece vuestra marca, en una frase."], ["Manifiesto", "Vuestra marca en voz alta, en un minuto: para la web, el packaging, las redes y el equipo."]]]
    ]),
    P(17, 17, "Sistema", "Fase 04 · La estructura", "[Sistema]", "Sistema", [
      ["h", "Cuatro pilares sostienen cada pieza"],
      ["p", "Reglas visuales y verbales, decididas una vez y válidas durante años."],
      ["img", "v17", "Cuatro pilares sobre una losa: tipografía, retícula, color e imagen"],
      ["items", [["Tipografía", "Cómo escribe la marca."], ["Retícula", "Cómo ordena el espacio."], ["Color", "Qué color manda y cuál acompaña."], ["Imagen", "Cómo fotografía e ilustra."]]],
      ["meta", ["Validación 03"]]
    ]),
    P(18, 18, "Pilares", "Fase 04 · Entregable", "[Pilares]", "Pilares", [
      ["h", "Los cuatro pilares, diseñados para vosotros"],
      ["pillars", [["v18a", "Tipografía", "Una familia con carácter para titulares y otra de servicio para textos y datos."], ["v18b", "Retícula", "Un orden que comparten todas las piezas, de la más pequeña a la más grande."], ["v18c", "Color", "Una paleta con jerarquía: quién manda, quién acompaña y quién acentúa."], ["v18d", "Imagen", "Luz, encuadre y tratamiento para fotografía e ilustración."]]]
    ]),
    P(19, 0, "Registros", "Fase 04 · Entregable", "[Registros]", "Registros", [
      ["h", "La voz también tiene reglas"],
      ["p", "Frases clave y tonos, diseñados como los pilares visuales."],
      ["items", [["Frase principal", "La que todo el mundo recuerda."], ["Frases de apoyo", "Cómo cumple la marca su promesa."], ["Vocabulario", "Las palabras propias del equipo."], ["Técnico", "Cómo está hecho. Preciso, con datos."], ["Emocional", "Lo que se siente. Cercano y sensorial."], ["Documental", "La vida real. Directo, sin artificio."]]]
    ]),
    P(20, 20, "Aplicaciones", "Fase 05 · Las plantas", "[Aplicaciones]", "Aplicaciones", [
      ["h", "Cada planta es distinta. El edificio es uno"],
      ["p", "Web, papelería, packaging, redes: cada una con sus necesidades, todas sobre los mismos pilares."],
      ["img", "v20", "Un edificio cuyas plantas son la papelería, la web, el packaging y las redes sociales"],
      ["items", [["Hacemos", "Diseñar el programa en conjunto y después pieza a pieza."], ["Recibís", "Todas las aplicaciones, listas para revisar."], ["Vuestra parte", "Validar cada pieza. Sin sorpresas de alcance."]]],
      ["meta", ["Validación 04"]]
    ]),
    P(21, 0, "Plantas", "Fase 05 · Entregable", "[Plantas]", "Plantas", [
      ["h", "Cada pieza, pensada para su sitio"],
      ["p", "Qué tiene que conseguir, para quién y con qué pilares. Por ejemplo:"],
      ["items", [["Packaging", "Destacar en el lineal y proteger el producto. Los cuatro pilares."], ["Señalética", "Leerse a distancia, de día y de noche. Tipografía y color."], ["Web", "Informar y vender en pocos pasos. Retícula e imagen."], ["Redes sociales", "Publicar a menudo sin perder coherencia. Plantillas y registros."]]]
    ]),
    P(22, 22, "Artes finales", "Fase 06 · Instalaciones y remates", "[Artes finales]", "Artes finales", [
      ["h", "Que todo funcione y esté bien rematado"],
      ["p", "Una casa sin luz ni agua no se puede habitar. Convertimos el diseño en archivos que funcionan en el mundo real."],
      ["img", "v22", "El edificio con sus instalaciones, sus remates y sus destinos: imprenta, pantalla y fabricante"],
      ["items", [["Instalaciones", "Cada archivo listo para su destino: imprenta, pantalla o fabricación."], ["Remates", "Pruebas de color, pruebas a escala y correcciones finales."], ["Recibís", "Archivos listos para producir, sin sorpresas."]]],
      ["meta", ["Validación 05"]]
    ]),
    P(24, 24, "Entrega", "Fase 07 · Las llaves", "[Entrega]", "Entrega", [
      ["h", "Las llaves y el libro del edificio"],
      ["p", "La marca pasa a ser del todo vuestra: todo para usarla sin depender de nadie, y las reglas para no estropearla."],
      ["img", "v24", "El edificio terminado, con sus llaves y su libro del edificio"],
      ["items", [["Las llaves", "Archivos fuente, logotipos, tipografías con licencia, plantillas y accesos."], ["El manual", "El manual de marca: qué se puede hacer y qué no."], ["Página de decisiones", "La estrategia en una página, para consultarla antes de cada pieza nueva."]]],
      ["meta", ["Llave en mano"]]
    ]),
    P(26, 26, "Mantenimiento", "Fase 08 · El edificio en uso", "[Mantenimiento]", "Mantenimiento", [
      ["h", "Seguimos cerca mientras el edificio se usa"],
      ["p", "Piezas nuevas, nuevos proveedores, ganas de crecer: mantenemos la marca reconocible."],
      ["img", "v26", "El edificio en uso, con ampliaciones, revisiones y ajustes"],
      ["items", [["Revisiones", "Las piezas nuevas, contrastadas con los pilares, las haga quien las haga."], ["Ajustes", "Corregimos lo que se desvía y actualizamos el manual."], ["Ampliaciones", "Plantas nuevas —una campaña, una línea, un local— sobre la misma estructura."], ["Ritmo", "Acompañamiento el tiempo que haga falta, con revisiones pactadas."]]],
      ["meta", ["El tiempo que haga falta"]]
    ]),
    P(28, 0, "Método", "Fases y validaciones", "[Método]", "Validaciones", [
      ["h", "Nada avanza sin vuestro visto bueno"],
      ["p", "Cada fase se cierra con una validación conjunta y la siguiente se apoya en ella. Nadie deshace lo que estaba bien."],
      ["wide", "v28", "Cronograma de las ocho fases en cuatro actos, con una validación entre fases"]
    ]),
    P(29, 29, "Criterio", "Técnica y creatividad", "[Criterio]", "Criterio", [
      ["h", "Pensamos como arquitectos y calculamos como ingenieros"],
      ["p", "Datos y pruebas por un lado; investigación y concepto por otro. Casi nunca juntos. Con nosotros, siempre."],
      ["img", "v29", "Un edificio medido por el cálculo y formado por el proyecto"],
      ["items", [["Técnica", "Datos, mercado y pruebas: lo que hace que funcione."], ["Creatividad", "Cultura, concepto y curaduría: lo que la hace única."], ["Juntas", "Ninguna decide sola."]]]
    ]),
    P(30, 0, "Cruce", "En cada fase", "[Cruce]", "Cruce", [
      ["h", "Dos formas de trabajar que se cruzan en cada fase"],
      ["p", "Como una celosía: unidas aguantan mucho más. Avanza la idea más interesante, contrastada con datos."],
      ["wide", "v30", "Una celosía: el trabajo técnico arriba y el creativo abajo, cruzándose en cada fase"]
    ]),
    P(31, 31, "Curaduría", "Abrir y elegir", "[Curaduría]", "Curaduría", [
      ["h", "Exploramos mucho para elegir una sola cosa"],
      ["p", "La creatividad sin criterio es azar. Cada camino pasa por tres filtros, y os contamos por qué gana el que gana."],
      ["img", "v31", "Todas las opciones filtradas por pertinencia, propiedad y viabilidad hasta una sola solución"],
      ["items", [["Pertinente", "Responde a la estrategia, no a una moda."], ["Propia", "No se parece a nada de vuestro sector."], ["Viable", "Funciona en cada planta, en pantalla y en producción."]]]
    ]),
    P(32, 32, "Evidencia", "Nada por impulso", "[Evidencia]", "Evidencia", [
      ["h", "Cada decisión tiene un porqué y una prueba"],
      ["p", "No nuestro gusto: el razonamiento y las pruebas detrás de cada propuesta."],
      ["img", "v32", "Un rótulo visto de cerca, a distancia y de pasada"],
      ["items", [["Reconocimiento", "¿Se reconoce al instante, incluso sin el logo?"], ["Legibilidad", "¿Se lee de lejos, en pequeño y en movimiento?"], ["Coherencia", "¿Funciona igual en cada planta?"], ["Producción", "¿Aguanta en papel, pantalla, tela o metal?"]]]
    ]),
    P(33, 33, "Resultado", "Cada marca, única", "[Resultado]", "Resultado", [
      ["h", "El mismo método. Nunca el mismo resultado"],
      ["p", "El mismo orden deja sitio a una marca que solo podría ser vuestra."],
      ["img", "v33", "Tres edificios distintos sobre la misma retícula: producto, hostelería y cultura"],
      ["items", [["Se repite", "El orden, el rigor y las validaciones."], ["Nunca se repite", "La idea, la forma y la manera de contarla."]]]
    ]),
    P(34, 34, "Ecosistema", "Quién construye", "[Ecosistema]", "Ecosistema", [
      ["h", "Un equipo fijo y los mejores oficios"],
      ["p", "El equipo fijo hace el grueso. Cuando una planta pide un oficio concreto, se suman especialistas de confianza."],
      ["img", "v34", "El equipo base con especialistas en audiovisual, redes sociales, desarrollo web y producción"],
      ["items", [["Equipo fijo", "Estrategia, dirección creativa, identidad, tipografía, editorial, etc."], ["Especialistas", "Vídeo, redes sociales, desarrollo web, etc."], ["Producción", "Imprenta, packaging, señalética, fabricación, etc."], ["Un solo contacto", "Coordinamos a todos. Vosotros no gestionáis proveedores."]]]
    ]),
    P(35, 0, "Ecosistema", "Fase a fase", "[Ecosistema]", "Quién y cuándo", [
      ["h", "Cada oficio entra cuando su planta lo necesita"],
      ["p", "El equipo fijo está de principio a fin; el resto se suma en sus fases, coordinado por el estudio."],
      ["legend", ["Lidera", "Participa", "Valida"]],
      ["wide", "v35", "Quién participa en cada una de las ocho fases"]
    ]),
    P(36, 36, "Juntos", "Cómo nos organizamos", "[Juntos]", "Juntos", [
      ["h", "Trabajamos con vosotros, no para vosotros"],
      ["p", "Una obra compartida, con normas de la casa que la hacen fácil y clara."],
      ["img", "v36", "Una obra compartida, con gente a ambos lados"],
      ["items", [["Una persona de referencia", "[Nombre], de principio a fin."], ["Un ritmo fijo", "Reuniones cortas para decidir; respuestas en menos de [24 h]."], ["Todo a la vista", "Un espacio compartido, siempre al día."]]]
    ]),
    P(37, 0, "Preguntas", "Las de siempre", "[Preguntas]", "Preguntas", [
      ["h", "Lo que casi todo el mundo nos pregunta"],
      ["qa", [["¿Cuánto dura?", "Depende del programa. Lo fijamos en el workshop y tenéis el calendario desde el primer día."], ["¿Qué necesitáis de nosotros?", "Tiempo para el workshop, una persona que decida y respuestas a tiempo."], ["¿Y si una propuesta no nos convence?", "Lo hablamos, con razones de la estrategia, no de gustos."], ["¿Podemos cambiar algo ya aprobado?", "Sí, pero cuanto más abajo está la capa, más cuesta moverla. Por eso validamos en orden."], ["¿Qué nos llevamos?", "Todos los archivos, las licencias y el manual. La marca es del todo vuestra."], ["¿Y cuando termine?", "Si lo necesitáis, seguimos cuidando la marca con vosotros."]]]
    ]),
    P(38, 38, "Empezamos", "El primer paso", "[Empezamos]", "Empezamos", [
      ["h", "El primer paso es una conversación"],
      ["p", "Un workshop de [3] horas con quienes deciden. En [2] semanas: el brief y el calendario de toda la obra."],
      ["img", "v38", "El solar vacío, donde empieza todo"],
      ["items", [["Necesitamos", "Una fecha, una sala y las personas que mejor conocen vuestra marca."]]],
      ["contact"]
    ]),
    P(39, 0, "", "", "", "Cierre", [["closing"]], "closing")
  ];
  return { en: en, es: es };
})();
