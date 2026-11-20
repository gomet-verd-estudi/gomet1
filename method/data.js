// Contenido de la presentación "Method" (EN) para el modo lectura responsive.
window.DECK = (function () {
  var PH2 = ["Phase 02, Strategy: the site", "You'll see it in the strategy document"];
  var PH3 = ["Phase 03, Concept: the foundations", "You'll see it in the concept presentation"];
  var PH4 = ["Phase 04, System: the structure", "You'll see it in the identity system"];
  function S(num, sec, sub, title, blocks, extra) { var o = { num: num, sec: sec, sub: sub, title: title, blocks: blocks }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  return [
    S("", "", "", "", [["cover"]], { kind: "cover", name: "Cover" }),
    S("00", "Introduction", "How we work", "[Method]", [
      ["lead", "A brand is built like a building"],
      ["rule"],
      ["caps", "In order, on ground we know, and with you in every decision."]
    ], { name: "Introduction" }),
    S("00", "Method", "What usually happens", "[Method]", [
      ["h", "Many brands start with the façade"],
      ["p", "It usually happens in a rush: there's something to show, so the logo gets designed and everything else is figured out on the fly. Over time, nothing fits with anything."],
      ["img", "v03", "Stacked floors that don't fit, with the façade designed first and no foundations"],
      ["items", [["What shows", "Pieces that don't fit together and decisions that depend on the taste of the day."], ["What it costs", "Redoing what was already done every time the brand grows."], ["What we propose", "The opposite: start from the bottom and sign off each layer with you."]]]
    ], { name: "What usually happens" }),
    S("00", "Method", "The building", "[Method]", [
      ["h", "Each layer rests on the one before"],
      ["p", "We work from the big picture down to the detail, in four acts, and no layer goes up without your sign-off."],
      ["img", "v04", "The building in layers: site, foundations, structure, floors, utilities and finishes, keys"],
      ["items", [["Understand", "We listen, research and choose together where to build."], ["Define", "We raise the brand's idea and its rules."], ["Build", "We design every piece and get it ready for the real world."], ["Maintain", "We look after the brand as it grows."]]],
      ["meta", ["Each circle is a sign-off with you"]]
    ], { name: "The building" }),
    S("01", "Workshop", "The ground", "[Workshop]", [
      ["h", "Before building, we survey the ground"],
      ["p", "No build starts without walking the ground. The workshop is a long, unhurried conversation: you tell us who you are, what worries you and where you want to go."],
      ["img", "v05", "The plot surrounded by competitors, industry and audience"],
      ["items", [["What we do", "We ask and, above all, we listen: your story, your audience, your competitors, your mission, vision and values."], ["What you get", "The brief, which sums up what we discussed, and the program: the pieces your brand will need."], ["Your role", "Come with time and without filters. What you tell us here holds up everything else."]]]
    ], { name: "Workshop" }),
    S("01", "Brief", "What you'll see", "[Brief]", [
      ["h", "After the workshop, you'll receive the brief"],
      ["p", "A short document that captures what you told us and turns it into a shared starting point. We review it together and sign it before moving on."],
      ["items", [["Your context", "Who you are, what you do and which market you compete in, told in your own words."], ["The problem", "What is stopping your brand from growing or standing out today, in one sentence."], ["The goals", "What the project has to achieve and how we'll know it has."], ["The program", "The list of pieces we'll build, so the scope is clear from the start."], ["The schedule", "The dates of every phase and every sign-off."]]],
      ["meta", ["Phase 01, Workshop: the ground", "You'll receive it after the workshop"]]
    ], { name: "Brief" }),
    S("02", "Strategy", "The site", "[Strategy]", [
      ["h", "We choose the site with surgical precision"],
      ["p", "With what you tell us and what we research on our own, we decide together where it makes sense to build: the space no one occupies and the limits of the project."],
      ["img", "v07", "The chosen plot, with the program and the market space"],
      ["items", [["Market space", "The gap your competitors leave open and your brand can take with authority."], ["Program", "The pieces you'll need, already sized, so the scope doesn't change mid-build."], ["What you get", "The strategy document: opportunity, target, competitors and positioning map."]]],
      ["meta", ["Sign-off 01"]]
    ], { name: "Strategy" }),
    S("02", "Opportunity", "What you'll see", "[Opportunity]", [
      ["lead", "The finding that puts everything in order"],
      ["p", "When the research is done, we'll present the opportunity: a truth in your market that no one is taking advantage of and that your brand can own. It's the conclusion that guides everything else."],
      ["items", [["What we've seen", "What's happening in your market, backed by data and observation."], ["What we propose", "The stance your brand should take on it."], ["What changes", "How that stance will guide every decision from then on."]]],
      ["meta", PH2]
    ], { name: "Opportunity" }),
    S("02", "Target", "What you'll see", "[Target]", [
      ["h", "We'll show you who your brand serves"],
      ["p", "Not as made-up personas, but as three circles: who buys and uses it, who gives it reputation and who recommends it."],
      ["img", "v09", "Three concentric circles: primary, secondary and tertiary"],
      ["table", ["Circle", "Who it usually is", "Why it matters"], [["Primary", "Whoever buys and uses your product regularly.", "The first one we listen to: every decision is measured against them."], ["Secondary", "Whoever comes closer out of affinity with what you stand for.", "Brings visibility and reputation to your brand."], ["Tertiary", "Whoever recommends: experts, media, retailers or professionals.", "Their opinion opens the door to everyone else."]]],
      ["items", [["What each circle needs", "For each one, we describe what it needs your brand to solve. That way, design decisions stop being a matter of taste."]]],
      ["meta", PH2]
    ], { name: "Target" }),
    S("02", "Competitors", "What you'll see", "[Competitors]", [
      ["h", "You'll see where your gap in the market is"],
      ["p", "We place your competitors, and benchmark brands from other industries, on a map. The space no one occupies is where we'll propose you build."],
      ["img", "v10", "Positioning map: exclusive–accessible, functional–emotional, with the open space"],
      ["items", [["What you'll take away", "An analysis of every brand studied: what's worth copying, what's worth adapting and what's best avoided."]]],
      ["meta", PH2]
    ], { name: "Competitors" }),
    S("03", "Concept", "The foundations", "[Concept]", [
      ["h", "No one sees the foundations. Everything rests on them"],
      ["p", "The concept is the idea that will hold up your brand for years. You don't see it in the final result, but if it's solid and your own, nothing falls down."],
      ["img", "v11", "The foundations below ground level"],
      ["items", [["Fundamentals", "Philosophy, mission, vision, values and ethos: what your brand believes in and stands for."], ["Root concept", "The core idea everything stems from, with its archetype, its unique proposition and its manifesto."], ["Narrative frameworks", "They show you how that idea reaches every part of the project."], ["Your role", "Sign off the idea before moving on to visuals. It's the most important decision of the project."]]],
      ["meta", ["Sign-off 02"]]
    ], { name: "Concept" }),
    S("03", "Fundamentals", "What you'll see", "[Fundamentals]", [
      ["k", "Philosophy"],
      ["h", "Your brand's convictions"],
      ["items", [["What you'll get", "Three or four principles that explain why your brand exists."], ["What they're for", "They're the filter for any future decision: if something contradicts them, it doesn't fit."]]],
      ["k", "Mission"],
      ["lead2", "What your brand does every day, in one sentence"],
      ["p", "Specific and verifiable: no empty promises."],
      ["k", "Vision"],
      ["lead2", "Where it wants to go, in one sentence"],
      ["p", "Ambitious, but credible."],
      ["note", "We write them from what you tell us in the workshop and sign them off with you."],
      ["meta", PH3]
    ], { name: "Fundamentals" }),
    S("03", "Values", "What you'll see", "[Values]", [
      ["k", "Values: how your brand behaves"],
      ["table", ["You'll get", "What it's for"], [["Three to five values", "Knowing how to act on every decision without having to ask."], ["One sentence for each value", "So the whole team can remember it and explain it."], ["A behavior that proves it", "So your values show in what you do, not just in what you say."]]],
      ["k", "Ethos: what your brand is like"],
      ["lead2", "A few traits that define its character and the tone it will speak in"],
      ["quote", "Values are what we do. Ethos is who we are when no one is watching"],
      ["meta", PH3]
    ], { name: "Values" }),
    S("03", "Archetype", "What you'll see", "[Archetype]", [
      ["h", "We'll define your brand's character"],
      ["p", "We combine three archetypes that decide how your brand speaks, how it presents itself and what it would never do."],
      ["items", [["Primary", "What your brand is at its core."], ["Secondary", "How it treats the people it serves."], ["Modulator", "The counterweight that keeps the other two from going over the top."]]],
      ["items", [["What it will never be", "We'll also tell you which archetypes we ruled out and why. Knowing what you're not helps as much as knowing what you are."]]],
      ["meta", PH3]
    ], { name: "Archetype" }),
    S("03", "Concept", "What you'll see", "[Concept]", [
      ["lead", "The core idea"],
      ["steps", [["01", "Observed reality", "What we see in your market."], ["02", "Market insight", "What it means."], ["03", "Brand insight", "Your brand's stance."], ["04", "Territory", "The creative space."], ["05", "Concept", "The line everything stems from."]]],
      ["p", "We'll walk you through the full path to the concept, step by step, so you understand why it's this one and not another."],
      ["k", "Unique proposition"],
      ["lead2", "What your brand offers that no one else does, in one sentence"],
      ["items", [["Narrative frameworks", "You'll see how the concept reaches every part of the project: from the brand's principles to what can be seen and touched."]]],
      ["meta", PH3]
    ], { name: "The core idea" }),
    S("03", "Manifesto", "What you'll see", "[Manifesto]", [
      ["h", "You'll receive your brand's manifesto"],
      ["p", "It's the text that tells your brand out loud, in one minute. It's born from the concept and sums up all the foundations."],
      ["k", "Where it will live"],
      ["steps", [["01", "Your website", "The first page, the one that explains who you are."], ["02", "The packaging", "The inside, what you read when you open it."], ["03", "Social media", "The new brand's first post."], ["04", "Your team", "Presentations, and the welcome for new joiners."]]],
      ["meta", PH3]
    ], { name: "Manifesto" }),
    S("04", "System", "The structure", "[System]", [
      ["h", "Four pillars run through the whole project"],
      ["p", "Your brand's visual and verbal rules are born from the idea. They're decided once and hold up every piece, today and five years from now."],
      ["img", "v17", "Four pillars on a foundation slab: typography, grid, color and imagery"],
      ["items", [["Typography", "How your brand writes: type families, hierarchy and the tone of its copy."], ["Grid", "How it organizes space: margins, columns and proportions."], ["Color", "Its palette and how it's distributed: which color leads and which supports."], ["Imagery", "How it photographs, illustrates and retouches: light, framing and treatment."]]],
      ["meta", ["Sign-off 03"]]
    ], { name: "System" }),
    S("04", "Pillars", "What you'll see", "[Pillars]", [
      ["h", "The four pillars we'll design for your brand"],
      ["pillars", [["v18a", "Typography", "A family with character for headlines and a workhorse one for body copy, prices and data."], ["v18b", "Grid", "The order all your pieces will share, from the smallest to the largest."], ["v18c", "Color", "A palette with hierarchy: which color leads, which supports and which appears only as an accent."], ["v18d", "Imagery", "How your brand is photographed, illustrated and retouched: light, framing and treatment."]]],
      ["meta", PH4]
    ], { name: "Pillars" }),
    S("04", "Registers", "What you'll see", "[Registers]", [
      ["h", "Your brand's voice, also with rules"],
      ["p", "Like the visual pillars, the voice is designed. We'll hand over the brand's key lines and the tones it will use depending on what it's saying."],
      ["items", [["The main line", "The one everyone will remember about your brand."], ["The supporting lines", "The ones that explain how it keeps its promise."], ["The internal vocabulary", "Your team's own words, which stay in-house."]]],
      ["table", ["Register", "What it tells", "How it sounds"], [["Technical", "How your product is made and why it works.", "Precise, with data."], ["Emotional", "What it feels like to use it.", "Warm and sensory."], ["Documentary", "Your brand in real life.", "Direct, unvarnished."]]],
      ["meta", PH4]
    ], { name: "Registers" }),
    S("05", "Applications", "The floors", "[Applications]", [
      ["h", "Every floor is different. The building is one"],
      ["p", "The floors are the places where your brand lives: the website, the stationery, the packaging, social media. Each has its own size and needs, but they all share the same pillars."],
      ["img", "v20", "A building whose floors are stationery, web, packaging and social media"],
      ["items", [["What we do", "We design the pieces in the program, first as a whole and then one by one, adapting the identity to each format."], ["What you get", "Every application designed and ready for review."], ["Your role", "Review and sign off each piece. Since the program was set at the start, there are no scope surprises."]]],
      ["meta", ["Sign-off 04"]]
    ], { name: "Applications" }),
    S("05", "Floors", "What you'll see", "[Floors]", [
      ["h", "Every piece, designed for its place"],
      ["p", "We'll design every piece in your program knowing what it has to achieve, who it serves and which pillars it uses. For example:"],
      ["table", ["Piece", "What it has to achieve", "For whom", "Pillars it uses"], [["Stationery", "Introduce the brand in small formats.", "Clients and suppliers.", "Typography and color."], ["Packaging", "Stand out on the shelf and protect the product.", "The buyer.", "All four."], ["Space and signage", "Be read from a distance, day and night.", "Passers-by.", "Typography and color."], ["Web", "Inform and sell in a few steps.", "Every audience.", "Grid and imagery."], ["Social media", "Post often without losing consistency.", "Customers and followers.", "Templates and registers."], ["Editorial and campaigns", "Tell the story in depth.", "Press and tastemakers.", "All four."]]],
      ["meta", ["Phase 05, Applications: the floors", "You'll see it in the applications"]]
    ], { name: "Floors" }),
    S("06", "Final artwork", "Utilities and finishes", "[Final artwork]", [
      ["h", "Fully working, properly finished"],
      ["p", "A house with walls but no power or water can't be lived in. Here we turn the approved design into files that work in the real world."],
      ["img", "v22", "The building with its utilities, finishes and destinations: printer, screen and manufacturer"],
      ["items", [["Utilities", "We prepare every file for its destination, whether printer, screen or manufacturer: formats, colors, inks and margins."], ["Finishes", "We check every detail before production and solve what only shows up on site: adjustments, proofs and corrections."], ["What you get", "The final files, checked and ready for production with no surprises."]]],
      ["meta", ["Sign-off 05"]]
    ], { name: "Final artwork" }),
    S("06", "Final artwork", "What you'll see", "[Final artwork]", [
      ["h", "Before production, we prepare and test everything"],
      ["p", "You won't have to worry about formats or specs: we take care of every file and every proof before anything reaches the printer, the screen or the factory."],
      ["k", "Utilities: every file for its destination"],
      ["items", [["Print", "Color profiles, inks, bleeds and safety margins."], ["Fabrication and signage", "Real dimensions, part breakdowns and specified materials."], ["Digital", "Formats, image file sizes and web font licenses."]]],
      ["k", "Finishes: what only shows up on site"],
      ["items", [["Color proofs", "Color shifts from one medium to another: we test it and adjust it before production."], ["Scale tests", "What works on screen can fail at full size: we check it."], ["Final corrections", "Copy, legibility and details, reviewed piece by piece."]]],
      ["meta", ["Phase 06, Final artwork: utilities and finishes", "We take care of it"]]
    ], { name: "Preparing and testing" }),
    S("07", "Handover", "The keys", "[Handover]", [
      ["h", "We hand you the keys and the building manual"],
      ["p", "The brand becomes entirely yours: with everything you need to use it without depending on anyone, and the instructions to keep from breaking it."],
      ["img", "v24", "The finished building with its keys and building manual"],
      ["items", [["The keys", "All source files, logos in every format, typefaces, templates and logins."], ["The building manual", "The brand guidelines: how each element is used, what can and can't be done."], ["Your role", "Share the guidelines with anyone who works with the brand, inside or outside the company."]]],
      ["meta", ["Turnkey"]]
    ], { name: "Handover" }),
    S("07", "Keys", "What you'll see", "[Keys]", [
      ["h", "Turnkey"],
      ["p", "You get everything you need to use your brand without depending on anyone, and the rules to keep from breaking it."],
      ["items", [["The keys", "Logos in every format, licensed typefaces, templates and the production files for every piece."], ["The building manual", "The brand guidelines: how each element is used, what can and can't be done, with do's and don'ts."], ["The decisions page", "The strategic decisions summed up on a single page, to check before any new piece."]]],
      ["meta", ["Phase 07, Handover: the keys", "You'll receive it at handover"]]
    ], { name: "Keys" }),
    S("08", "Maintenance", "The building in use", "[Maintenance]", [
      ["h", "We stay close while the building is in use"],
      ["p", "Use brings new pieces, different suppliers and the urge to grow. For as long as it takes, we work with you to keep the brand recognizable."],
      ["img", "v26", "The building in use, with extensions, reviews and adjustments"],
      ["items", [["Reviews", "We review new pieces so they respect the pillars, whoever makes them."], ["Adjustments", "We correct whatever drifts or wears with use before it shows."], ["Extensions", "We design the new floors, like a campaign or a new location, on the same structure."]]],
      ["meta", ["For as long as needed"]]
    ], { name: "Maintenance" }),
    S("08", "Maintenance", "What you'll see", "[Maintenance]", [
      ["h", "Looking after the building in use"],
      ["p", "Use brings new pieces, different suppliers and the urge to grow. Maintenance keeps your brand recognizable."],
      ["items", [["Reviews", "We review new pieces before they're published or produced, whoever makes them."], ["Adjustments", "We correct whatever drifts with use and update the guidelines when needed."], ["Extensions", "We design the new floors, like a campaign, a product line or a new location, on the same structure."], ["For as long as needed", "Our support lasts as long as the project needs, with an agreed review cadence."]]],
      ["meta", ["Phase 08, Maintenance: the building in use", "For as long as needed"]]
    ], { name: "Looking after the building" }),
    S("00", "Method", "Phases and sign-offs", "[Method]", [
      ["h", "Nothing advances without your sign-off"],
      ["p", "Every phase ends with a joint sign-off, and the next one builds on it. That way you always know where we are on the build, and no one has to undo what was already right."],
      ["wide", "v28", "Timeline of the eight phases grouped in four acts, with a sign-off between phases"],
      ["meta", ["Each circle is a sign-off with you"]]
    ], { name: "Phases and sign-offs" }),
    S("00", "Judgment", "Technique and creativity", "[Judgment]", [
      ["h", "We think like architects and calculate like engineers"],
      ["p", "Gomet brings together two ways of working that almost always stay apart: technical analysis, with data and testing, and creativity born from research and conceptual analysis."],
      ["img", "v29", "A building measured by calculation and shaped by design"],
      ["items", [["The technical side", "Data, market analysis, testing and calculation: what makes a brand work."], ["The creative side", "Cultural research, conceptual analysis and curation: what makes a brand unique."], ["Together", "They move forward in step through every phase, and neither decides alone."]]]
    ], { name: "Judgment" }),
    S("00", "Crossover", "In every phase", "[Crossover]", [
      ["h", "Technique and creativity advance together in every phase"],
      ["p", "As in a truss, two members joined by triangles bear far more than they could apart. They cross at every sign-off, and what moves forward is the most interesting idea, tested against data."],
      ["wide", "v30", "A truss: technical work on top, creative work below, crossing at every phase"],
      ["meta", ["Each marked vertical is a sign-off with you"]]
    ], { name: "Crossover" }),
    S("00", "Curation", "Open up and choose", "[Curation]", [
      ["h", "We explore a lot to choose just one thing"],
      ["p", "Creativity without judgment is chance. We open every possible path and run them through explicit filters until we're left with the most interesting solution. And we explain why."],
      ["img", "v31", "Every option filtered by relevance, ownability and viability down to one solution"],
      ["items", [["Relevant", "It answers to the strategy and the concept, not to a trend."], ["Ownable", "It doesn't look like anything already in your industry."], ["Viable", "It works on every floor, on screen and in production."]]]
    ], { name: "Curation" }),
    S("00", "Evidence", "Nothing on impulse", "[Evidence]", [
      ["h", "Every decision has a reason and a test"],
      ["p", "We don't ask you to trust our taste: we show you why. Every proposal comes with its strategic rationale and the tests that back it up."],
      ["img", "v32", "A sign viewed up close, at a distance and in passing"],
      ["items", [["Recognition", "Is it recognizable in an instant, even without the logo?"], ["Legibility", "Can it be read from afar, at small sizes and in motion?"], ["Consistency", "Does it work equally well on every floor of the building?"], ["Production", "Does it hold up on the real medium: paper, screen, fabric or metal?"]]]
    ], { name: "Evidence" }),
    S("00", "Result", "Every brand, unique", "[Result]", [
      ["h", "The method is always the same. The result, never"],
      ["p", "We follow the same order on every project precisely so the result can be different: a brand that could only be yours, backed by research and tested before it goes out into the world."],
      ["img", "v33", "Three different buildings on the same grid: product, hospitality and culture"],
      ["items", [["What repeats", "The order, the rigor and the sign-offs."], ["What never repeats", "The idea, the form and the way it's told."]]]
    ], { name: "Result" }),
    S("00", "Ecosystem", "Who builds", "[Ecosystem]", [
      ["h", "A core team and the best trades"],
      ["p", "Our core team does the bulk of the project. When a floor calls for a specific trade, we bring in trusted specialists."],
      ["img", "v34", "The core team with audiovisual, social media, web development and production specialists"],
      ["items", [["Core team", "Strategy, creative direction, identity, typography, editorial, etc."], ["Specialists", "Video production, social media strategy, web development, etc."], ["Production", "Printing, packaging, signage, fabrication, merchandise, etc."], ["A single point of contact", "We coordinate everyone: you don't have to manage suppliers."]]]
    ], { name: "Ecosystem" }),
    S("00", "Ecosystem", "Phase by phase", "[Ecosystem]", [
      ["h", "Specialists join when their floor needs them"],
      ["p", "The core team stays with the project from start to finish. Specialists and production join in the phases where their craft is needed, always coordinated by the studio."],
      ["legend", ["Leads", "Takes part", "Signs off"]],
      ["wide", "v35", "Who takes part in each of the eight phases"]
    ], { name: "Phase by phase" }),
    S("00", "Together", "How we organize", "[Together]", [
      ["h", "We work with you, not for you"],
      ["p", "A brand project is a shared build. These are the house rules that keep it easy, clear and free of surprises."],
      ["img", "v36", "A shared build with people on both sides"],
      ["items", [["One point person", "[Name] is with you from start to finish and knows every decision."], ["A steady rhythm", "Short, decision-focused meetings for every phase, and replies in under [24 h]."], ["Everything in plain sight", "A shared space with all the project material, always up to date."]]]
    ], { name: "Together" }),
    S("00", "Questions", "Frequently asked", "[Questions]", [
      ["h", "What almost everyone asks us"],
      ["qa", [["How long does a project take?", "It depends on the program of pieces. We set it in the workshop, and you have the schedule from day one."], ["What do you need from us?", "Time for the workshop, one decision-maker and replies within the agreed deadlines."], ["What if a proposal doesn't convince us?", "We talk it through. Every proposal is defended from the strategy, so we discuss reasons, not tastes."], ["Can we change something already approved?", "Yes, but the lower the layer, the harder it is to move. That's why we sign off in order."], ["What do we take away at the end?", "All the files, the licenses and the guidelines. The brand is entirely yours."], ["And when the project ends?", "If you need it, we keep looking after the brand with you for as long as it takes."]]]
    ], { name: "Questions" }),
    S("01", "Let's start", "The first step", "[Let's start]", [
      ["h", "The first step is a conversation"],
      ["p", "We start with the workshop: a [3]-hour session with the decision-makers. Within [2] weeks, you'll have the brief and the schedule for the whole build."],
      ["img", "v38", "The empty site, where everything starts"],
      ["items", [["What we need", "A date, a room and the people who know your brand best."]]],
      ["contact"]
    ], { name: "Let's start" }),
    S("", "", "", "", [["closing"]], { kind: "closing", name: "Thank you" })
  ];
})();

window.VSIZE = {"p1":[196,115],"p2":[196,115],"p3":[228,82],"p4":[228,135],"p5":[228,137],"p6":[228,137],"p7":[228,137],"p8":[228,168],"v01":[1394,260],"v03":[1340,586],"v04":[1162,732],"v05":[1191,445],"v07":[1200,445],"v09":[682,241],"v10":[1140,702],"v11":[1340,462],"v17":[1340,637],"v18a":[298,219],"v18b":[262,253],"v18c":[420,145],"v18d":[262,306],"v20":[1340,603],"v22":[1340,649],"v24":[1340,603],"v26":[1340,685],"v28":[1851,410],"v29":[1340,649],"v30":[1723,286],"v31":[766,590],"v32":[1340,462],"v33":[1230,333],"v34":[1340,603],"v35":[1877,540],"v36":[1340,462],"v38":[1340,462]};
