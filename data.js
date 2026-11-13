/* Creacy — demonstration content.
   All studio details, people, clients and awards below are fictional placeholders.
   Images live in /img (see tools/scenes.py); swap files with the same names for real photography. */

window.CONFIG = {
  studio: "Creacy",
  email: "creacy@hello.com",
  phone: "+1 (555) 123-4567",
  address: ["456 Oak Avenue,", "Cityville, MA 56789,", "United States"],
  // Set to a form backend (Formspree, Basin, your own API…) to receive inquiries.
  // Left empty, forms validate and then offer an email draft instead of pretending to send.
  formEndpoint: "",
  socials: [
    ["Instagram", "https://instagram.com"],
    ["Behance", "https://behance.net"],
    ["Vimeo", "https://vimeo.com"],
    ["LinkedIn", "https://linkedin.com"]
  ]
};

window.CATEGORIES = [
  { slug: "landscape", name: "Landscape", line: "Mountains, valleys and weather in motion.",
    text: "Long approaches, early starts and patient waiting for the moment the light finally lands on the ridge. Our landscape work is quiet, wide and deliberately unhurried.",
    images: [
      ["alpine-valley", "Chasing Clouds at the Pinnacle", "Mont Blanc Massif, France"],
      ["blue-hour-peaks", "Blue Hour Above the Treeline", "Dolomites, Italy"],
      ["mirror-lake", "A Lake That Holds the Sky", "Lake Bohinj, Slovenia"],
      ["storm-ridge", "Weather Over the Spine", "Isle of Skye, Scotland"],
      ["golden-ridges", "Layers at First Light", "Tuscany, Italy"],
      ["fog-pines", "The Forest Exhales", "Black Forest, Germany"]
    ] },
  { slug: "wildlife", name: "Wildlife", line: "Respectful distance, unhurried observation.",
    text: "We work with local guides and long lenses, never baiting or crowding. The aim is the animal as it is — inside its landscape, not cut out of it.",
    images: [
      ["savanna-giraffes", "Tall Shadows at Dusk", "Maasai Mara, Kenya"],
      ["savanna-morning", "Morning on the Plains", "Serengeti, Tanzania"],
      ["birds-lake", "The Long Migration", "Lake Myvatn, Iceland"]
    ] },
  { slug: "architecture", name: "Architecture", line: "Form, material and the light that defines them.",
    text: "Buildings photographed the way they are lived in: in weather, at odd hours, with the land around them. We favour honest light over polished renders.",
    images: [
      ["meadow-house", "The House in the Tall Grass", "Jutland, Denmark"],
      ["concrete-cantilever", "Cantilevered Calm", "Porto, Portugal"],
      ["facade-grid", "Looking Up, Counting Windows", "Rotterdam, Netherlands"],
      ["warm-brutalism", "Warm Concrete", "Marseille, France"],
      ["facade-dusk", "The Tower After Six", "Copenhagen, Denmark"],
      ["night-cabin", "One Light On", "Lofoten, Norway"]
    ] },
  { slug: "street", name: "Street", line: "Cities after dark, reflected and rain-soft.",
    text: "Night walks with a small camera and no plan. Street work keeps the studio honest — fast decisions, imperfect light, real places.",
    images: [
      ["neon-rain", "Rain on the Bay", "Tokyo, Japan"],
      ["city-blue", "Blue Grid", "Osaka, Japan"],
      ["city-amber", "Amber Hour", "Hong Kong"]
    ] },
  { slug: "travel", name: "Travel", line: "Distant places, slow attention.",
    text: "Travel stories built from long stays rather than quick stops — returning to the same viewpoint across days until the place opens up.",
    images: [
      ["pagoda-dusk", "A Temple's Serene Silhouette", "Kyoto, Japan"],
      ["pagoda-mist", "Morning Mist at the Pagoda", "Nara, Japan"],
      ["golden-dunes", "Wind-Drawn Lines", "Erg Chebbi, Morocco"],
      ["blue-dunes", "After the Sun Has Gone", "Wadi Rum, Jordan"],
      ["sunset-coast", "The Headland at Dusk", "Big Sur, California"]
    ] },
  { slug: "portrait", name: "Portrait", line: "Character in natural, sculpted light.",
    text: "Portraits made slowly, in conversation. One light, simple backgrounds, and the time it takes for someone to stop performing for the camera.",
    images: [
      ["portrait-sky", "Looking Toward Something", "Studio, Lisbon"],
      ["portrait-amber", "Warm Silence", "Studio, Lisbon"],
      ["portrait-noir", "Study in Monochrome", "Studio, London"],
      ["portrait-sage", "The Listener", "Studio, Lisbon"],
      ["portrait-clay", "Clay & Light", "Studio, Marrakesh"]
    ] }
];

window.PROJECTS = [
  { slug: "majestic-creatures", title: "Majestic Creatures", long: "Majestic Creatures of the African Savanna",
    category: "wildlife", year: 2025, location: "Maasai Mara, Kenya", hero: "savanna-giraffes",
    tags: ["Wildlife Portraits", "Nature", "Mammals", "#2025"],
    excerpt: "Capturing the grace and power of the savanna's residents in the last hour of light.",
    intent: "To photograph animals as part of the land they move through — small in the frame, enormous in presence.",
    narrative: [
      "Over eleven days with Maasai guides we followed the same family of giraffes across the conservancy, returning each evening to the ridge where they browsed the acacias.",
      "We worked almost entirely from the vehicle, at distance, and let the light decide the pictures. The best frames came in the eight minutes after the sun dipped below the escarpment."
    ],
    approach: "Long lenses, low angles and a commitment to backlight. Every frame was composed so the horizon stays quiet and the silhouettes carry the story.",
    notes: [["Duration", "11 days in the field"], ["Kit", "Full-frame body, 100–400mm, 600mm prime"], ["Light", "Golden hour and civil twilight only"], ["Ethics", "No baiting, guided distance at all times"]],
    blocks: ["full:savanna-giraffes", "text", "pair:savanna-morning|birds-lake", "quote"],
    quote: "The animals set the schedule. Our job was to be ready when they walked into the light." },
  { slug: "silent-structures", title: "Silent Structures", long: "Silent Structures",
    category: "architecture", year: 2024, location: "Porto & Marseille", hero: "concrete-cantilever",
    tags: ["Architecture", "Concrete", "Editorial", "#2024"],
    excerpt: "Brutalist buildings photographed as sculpture — heavy forms made weightless by light.",
    intent: "To find softness in raw concrete by photographing it in the most forgiving light of the day.",
    narrative: [
      "Commissioned for an architecture quarterly, the series documents four post-war buildings at the edges of two port cities.",
      "We visited each site at three times of day, then chose the hour where the material looked most like itself: rough, warm and honest."
    ],
    approach: "Straight verticals, generous negative space, and skies kept clean so the geometry reads instantly.",
    notes: [["Client", "Fieldnote Quarterly (fictional)"], ["Kit", "Tilt-shift 24mm & 45mm"], ["Deliverables", "18 editorial images"], ["Format", "Print & digital feature"]],
    blocks: ["full:concrete-cantilever", "text", "stack:facade-grid|facade-dusk", "full:warm-brutalism", "quote"],
    quote: "Concrete remembers every board it was poured against. The light is what lets you read it." },
  { slug: "mountain-light", title: "Mountain Light", long: "Mountain Light",
    category: "landscape", year: 2025, location: "The Dolomites, Italy", hero: "alpine-valley",
    tags: ["Landscape", "Alpine", "Fine Art", "#2025"],
    excerpt: "A season of early starts in the high Dolomites, waiting for weather to move through the valleys.",
    intent: "To record the mountains not as postcards but as places where weather is always arriving or leaving.",
    narrative: [
      "Across six weeks of late summer we hiked to the same three viewpoints before dawn, logging cloud, wind and light in a field journal.",
      "The images that survived the edit are the ones where something was changing — a front clearing a ridge, fog lifting from the forest, the last blue before morning."
    ],
    approach: "Medium telephoto compression to stack the ridgelines, exposures held back to protect the highlights in snow and cloud.",
    notes: [["Duration", "6 weeks"], ["Kit", "Medium format, 45–100mm, 150mm"], ["Edition", "Limited prints, 12 per image"], ["Paper", "Hahnemühle Photo Rag 308"]],
    blocks: ["full:alpine-valley", "text", "pair:blue-hour-peaks|storm-ridge", "full:mirror-lake", "quote"],
    quote: "You don't photograph mountains. You photograph the weather that happens to them." },
  { slug: "the-human-condition", title: "The Human Condition", long: "Moments Framed in Portraits",
    category: "portrait", year: 2024, location: "Lisbon, London & Marrakesh", hero: "portrait-sky",
    tags: ["Portrait", "Studio", "Character", "#2024"],
    excerpt: "Single-light portraits exploring stillness, attention and the moment before someone speaks.",
    intent: "To make portraits that feel like listening rather than looking.",
    narrative: [
      "Each sitting began with a conversation and no camera. Only once the sitter had forgotten about the session did we start making pictures.",
      "One light, one painted backdrop, and a rule that the subject could look anywhere except the lens."
    ],
    approach: "Hard rim light from behind, almost nothing on the shadow side. Features are suggested, never spelled out.",
    notes: [["Sittings", "24 portraits across 3 cities"], ["Kit", "85mm & 105mm primes"], ["Light", "Single strobe with grid"], ["Exhibition", "Planned group show (demo)"]],
    blocks: ["pair:portrait-sky|portrait-amber", "text", "full:portrait-noir", "pair:portrait-sage|portrait-clay", "quote"],
    quote: "The picture happens in the half-second after they stop posing." },
  { slug: "tokyo-after-dark", title: "Tokyo After Dark", long: "Tokyo After Dark",
    category: "street", year: 2023, location: "Tokyo & Osaka, Japan", hero: "neon-rain",
    tags: ["Street", "Night", "Urban", "#2023"],
    excerpt: "Night walks through rain, glass and reflected neon across two cities.",
    intent: "To show the city as a single glowing organism seen from its edges.",
    narrative: [
      "Ten nights, no itinerary. We walked until the trains stopped and photographed whatever the rain reflected.",
      "Waterfronts became the recurring stage: the skyline doubled in the bay, softened by drizzle and long exposures."
    ],
    approach: "Handheld at high ISO, then tripod for the water reflections. Colour pulled back so the neon reads as atmosphere, not decoration.",
    notes: [["Duration", "10 nights"], ["Kit", "Compact full-frame, 35mm"], ["Exposure", "1/30s handheld to 8s on tripod"], ["Grade", "Muted colour, lifted blacks"]],
    blocks: ["full:neon-rain", "text", "full:city-blue", "quote", "full:city-amber"],
    quote: "At night the city stops explaining itself and starts glowing." },
  { slug: "beyond-the-horizon", title: "Beyond the Horizon", long: "A Temple's Serene Silhouette",
    category: "travel", year: 2024, location: "Kyoto, Japan & Sahara", hero: "pagoda-dusk",
    tags: ["Travel", "Culture", "Dusk", "#2024"],
    excerpt: "Temples at dusk and deserts after sunset — two journeys about silence and scale.",
    intent: "To photograph places that ask you to slow down, at the hours when they are emptiest.",
    narrative: [
      "In Kyoto we returned to a single pagoda for nine evenings, waiting for the lanterns to come on against the last colour in the sky.",
      "Months later in the desert, the same idea held: arrive early, stay late, and photograph the hour everyone else leaves."
    ],
    approach: "Simple, centred compositions and a strong vertical in each frame — a pagoda, a ridge of sand, a line of light.",
    notes: [["Duration", "2 trips, 4 weeks total"], ["Kit", "35mm & 70–200mm"], ["Access", "Arranged with temple caretakers"], ["Deliverables", "Travel feature, 22 images"]],
    blocks: ["pair:pagoda-dusk|pagoda-mist", "text", "full:golden-dunes", "quote", "full:blue-dunes"],
    quote: "The quiet hour is the one after the visitors leave and before the lights come on." },
  { slug: "coastal-silence", title: "Coastal Silence", long: "Coastal Silence",
    category: "landscape", year: 2025, location: "Big Sur & the Black Forest", hero: "silver-coast",
    tags: ["Nature", "Coast", "Forest", "#2025"],
    excerpt: "Headlands, forests and the fog that ties them together.",
    intent: "A study of the sea and the forest in their softest moods — fog, rain and late light.",
    narrative: [
      "The coastline was photographed across two winters, always in the in-between weather that tourists avoid.",
      "Forest pictures from the same season sit alongside them, connected by fog and a narrow, silvery palette."
    ],
    approach: "Restrained palettes and long exposures that flatten the water into a single, calm surface.",
    notes: [["Seasons", "2 winters"], ["Kit", "ND filters, 24–70mm, tripod"], ["Exposure", "Up to 60 seconds"], ["Edition", "Book dummy in progress"]],
    blocks: ["full:silver-coast", "text", "pair:fog-pines|dusk-forest", "full:sunset-coast", "quote"],
    quote: "Fog is the best editor. It removes everything you didn't need." },
  { slug: "architectural-geometry", title: "Architectural Geometry", long: "Lonely Life at the Meadow",
    category: "architecture", year: 2023, location: "Jutland, Denmark & Lofoten, Norway", hero: "meadow-house",
    tags: ["Fine Art", "Residential", "Landscape", "#2023"],
    excerpt: "Small houses in big landscapes — minimal homes photographed as part of the land.",
    intent: "To show modest architecture at the scale it is actually experienced: small, sheltered and surrounded.",
    narrative: [
      "Three private residences, each photographed over a full day and night so the house could be seen in every light it lives in.",
      "Grass, weather and treelines were treated as part of the architecture rather than distractions from it."
    ],
    approach: "Wide, low and patient. The house rarely fills the frame — the land around it does the talking.",
    notes: [["Client", "Norrland Architects (fictional)"], ["Kit", "Tilt-shift 17mm & 24mm"], ["Coverage", "Dawn to night per site"], ["Use", "Award submission & website"]],
    blocks: ["full:meadow-house", "text", "pair:countryside-barn|night-cabin", "quote", "full:golden-ridges"],
    quote: "The best compliment for a small house is a big sky." }
];

window.SERIES = [
  { slug: "the-quiet-earth", title: "The Quiet Earth", years: "2021 — Ongoing",
    text: "An ongoing collection of landscapes made in fog, drizzle and the soft light at either end of the day.",
    images: ["fog-pines", "mirror-lake", "silver-coast", "golden-dunes", "birds-lake", "blue-hour-peaks"] },
  { slug: "human-expressions", title: "Human Expressions", years: "2022 — 2024",
    text: "Single-light portraits about attention and stillness — the moment before someone speaks.",
    images: ["portrait-sky", "portrait-amber", "portrait-noir", "portrait-sage", "portrait-clay"] },
  { slug: "shapes-of-silence", title: "Shapes of Silence", years: "2020 — 2025",
    text: "Architecture reduced to line, volume and shadow, from brutalist blocks to a lone pagoda in mist.",
    images: ["concrete-cantilever", "facade-grid", "meadow-house", "pagoda-mist", "warm-brutalism", "facade-dusk"] }
];

window.SERVICES = [
  { slug: "commercial", title: "Commercial Photography", img: "warm-brutalism",
    short: "Campaign imagery with an editorial eye for brands that value restraint.",
    text: "From hospitality to outdoor equipment, we create campaign images that feel discovered rather than staged — built around real locations, natural light and a clear brief.",
    deliverables: ["Creative treatment & shot list", "Location scouting", "1–3 shoot days", "Retouched selects in all formats", "Usage licensing"],
    timeline: "3–6 weeks", related: ["silent-structures", "coastal-silence"] },
  { slug: "editorial", title: "Editorial Photography", img: "neon-rain",
    short: "Features and stories for magazines, journals and publishers.",
    text: "We collaborate with editors and writers to build visual stories that carry a narrative across a spread, not just a single image.",
    deliverables: ["Story development with the editor", "Location or studio shoot", "Sequenced edit for layout", "Captions & credits"],
    timeline: "2–4 weeks", related: ["tokyo-after-dark", "silent-structures"] },
  { slug: "architecture", title: "Architecture Photography", img: "meadow-house",
    short: "Buildings and interiors documented in honest, beautiful light.",
    text: "For architects, developers and designers who want their work seen as it is lived in — including the landscape, weather and hours around it.",
    deliverables: ["Site visit & sun study", "Dawn-to-dusk coverage", "Perspective-corrected images", "Award & publication packages"],
    timeline: "2–5 weeks", related: ["architectural-geometry", "silent-structures"] },
  { slug: "portrait", title: "Portrait Photography", img: "portrait-amber",
    short: "Sculpted, quiet portraits for people, founders and artists.",
    text: "Sessions are slow and conversational, in studio or on location, lit simply so the person — not the setup — becomes the subject.",
    deliverables: ["Pre-session conversation", "2–4 hour sitting", "10 retouched portraits", "Print-ready files"],
    timeline: "1–2 weeks", related: ["the-human-condition"] },
  { slug: "travel", title: "Travel Photography", img: "pagoda-dusk",
    short: "Destination stories for tourism boards, hotels and publications.",
    text: "Long stays and slow attention: we return to places across days to find the hours and angles that make a destination feel personal.",
    deliverables: ["Itinerary & access planning", "Multi-day field coverage", "Story edit with captions", "Social cut-downs"],
    timeline: "4–8 weeks", related: ["beyond-the-horizon", "coastal-silence"] },
  { slug: "wildlife", title: "Wildlife Photography", img: "savanna-giraffes",
    short: "Ethical wildlife assignments with experienced local guides.",
    text: "We work only with responsible operators and never bait or pressure animals. The result is wildlife in context — calm, natural and true to the place.",
    deliverables: ["Guide & permit coordination", "Field days with backup dates", "Edited selects", "Conservation-friendly licensing"],
    timeline: "6–10 weeks", related: ["majestic-creatures"] },
  { slug: "creative-direction", title: "Creative Direction", img: "facade-grid",
    short: "Visual direction for campaigns, books and exhibitions.",
    text: "We help teams define how their images should look and feel — moodboards, sequencing, art direction on set and guidance for other photographers.",
    deliverables: ["Visual strategy & moodboards", "Shot lists & sequencing", "On-set direction", "Image guidelines"],
    timeline: "Ongoing or per project", related: ["mountain-light", "beyond-the-horizon"] },
  { slug: "post-production", title: "Post-Production", img: "mirror-lake",
    short: "Colour, retouching and print preparation with a light hand.",
    text: "Considered grading and retouching for existing photography, plus fine-art print preparation and proofing with our lab partners.",
    deliverables: ["Colour grading", "Natural retouching", "Print proofing", "Archive-ready masters"],
    timeline: "1–3 weeks", related: ["mountain-light", "coastal-silence"] }
];

// Illustrative entries for the demo — not real awards.
window.AWARDS = [
  { year: 2015, title: "Meridian Open Photography Awards", note: "Landscape — Shortlist", img: "countryside-barn", cap: "A Quiet Afternoon in the Countryside",
    capText: "As the sun gently descends in the western sky, casting a warm golden glow upon the rolling hills and meadows, the countryside settles into a tranquil serenity." },
  { year: 2017, title: "Wayfarer Travel Photographer Of The Year", note: "Journeys — Commended", img: "pagoda-dusk", cap: "A Temple's Serene Silhouette",
    capText: "Nine evenings at the same pagoda, waiting for the lanterns to answer the last colour in the sky." },
  { year: 2022, title: "Atlas Documentary Photography Awards", note: "Wildlife — Finalist", img: "savanna-giraffes", cap: "Tall Shadows at Dusk",
    capText: "A giraffe family crossing the ridge in the eight minutes after sunset." },
  { year: 2023, title: "Lumen International Photography Awards", note: "Architecture — Winner", img: "meadow-house", cap: "The House in the Tall Grass",
    capText: "A small timber home photographed as part of its meadow rather than in front of it." },
  { year: 2024, title: "Northlight Portrait Prize", note: "Series — Shortlist", img: "portrait-sky", cap: "Looking Toward Something",
    capText: "From Human Expressions — portraits made in the moment before speaking." },
  { year: 2025, title: "Quiet Earth Fine Art Salon", note: "Exhibition — Selected", img: "mirror-lake", cap: "A Lake That Holds the Sky",
    capText: "Dawn reflections on a windless morning, printed at 150cm for the salon wall." }
];

window.CLIENTS = ["Norrland Architects", "Fieldnote Quarterly", "Saltwater Hotels", "Halden & Co.", "Kiln Studio", "Tessel Outdoor", "Mira Residences", "Atlas Journal"];

window.PROCESS = [
  ["Planning", "Every project starts with a conversation and a written treatment — what the images need to do, who they're for, and what they should feel like."],
  ["Location scouting", "We visit, map the sun and check access before anything is booked. Most of the picture is decided here."],
  ["Composition", "Frames are sketched in advance but held loosely. The plan is a starting point, not a script."],
  ["Lighting", "Natural light first. When we add our own, it is one source, shaped carefully, so it never announces itself."],
  ["Capture", "Slow, patient days on site. We shoot less and wait more — the best frame usually arrives after the obvious ones."],
  ["Editing", "A ruthless edit and a light-handed grade. Colour is calibrated to the place, not to a preset."],
  ["Presentation", "Final images are sequenced, captioned and delivered for print, web and archive — ready to live long after the project."]
];

window.ARTICLES = [
  { slug: "finding-stillness-in-the-mountains", title: "Finding Stillness in the Mountains", cat: "Field Notes", date: "2025-09-18", read: 6, img: "blue-hour-peaks",
    dek: "Six weeks of pre-dawn starts in the Dolomites taught us more about waiting than about photography.",
    body: [
      ["p", "The alarm goes at 3:40. Outside the hut it is cold enough that the zips on the camera bag stiffen, and the path is only visible in the small circle of a head torch. This was the rhythm of the summer we spent making Mountain Light, and for the first two weeks almost nothing worked."],
      ["p", "Weather in the high Dolomites arrives from the west and leaves in a hurry. We learned to read it the way the hut keepers do: by the colour of the light on the eastern faces at dusk, and by how quickly the valley fog burns off in the morning."],
      ["img", "storm-ridge", "A front clearing the ridge, minutes before the light went flat."],
      ["h", "The discipline of returning"],
      ["p", "We committed to three viewpoints and visited them again and again. It is the least efficient way to photograph a mountain range, and the only one we know that produces pictures with any sense of time inside them."],
      ["p", "By the fourth week we could predict which mornings would deliver. That knowledge did not make the images easier to take — but it made us calmer while we waited, and calm shows up in the frame."],
      ["img", "mirror-lake", "Windless dawn on the lake below the hut."],
      ["h", "What we kept"],
      ["p", "Out of more than four thousand frames, twenty-two made the final edit. Every one of them is a picture of something changing: cloud lifting, light arriving, a blue hour fading into day."]
    ] },
  { slug: "the-architecture-of-natural-light", title: "The Architecture of Natural Light", cat: "Craft", date: "2025-06-02", read: 5, img: "concrete-cantilever",
    dek: "Why we photograph buildings at the hours their architects never see.",
    body: [
      ["p", "Architects design with the sun in mind, but renders are almost always set at midday. Real buildings spend most of their lives in other light — grey mornings, low winter sun, the long blue after six."],
      ["p", "On every architecture commission we start with a sun study: where the light enters, which facades it rakes across, and when the material looks most like itself."],
      ["img", "warm-brutalism", "Late sun bringing out the board marks in poured concrete."],
      ["h", "Concrete, timber, glass"],
      ["p", "Raw concrete wants low, warm side light to reveal its texture. Dark timber needs soft overcast so it doesn't turn into a black shape. Glass is best at dusk, when the interior lights balance the sky."],
      ["img", "facade-grid", "A facade read as pattern, looking straight up."],
      ["p", "None of this is new. But building a shoot around it — rather than around a convenient slot in the calendar — is the single biggest difference between a document and a photograph."]
    ] },
  { slug: "portraits-that-tell-stories", title: "Portraits That Tell Stories", cat: "Portrait", date: "2025-03-11", read: 4, img: "portrait-amber",
    dek: "One light, one backdrop and the long conversation that happens before the camera comes out.",
    body: [
      ["p", "The best portrait sessions we have made began with half an hour of talking and no camera at all. People arrive braced for a performance; the conversation is how we take that weight off."],
      ["p", "For Human Expressions we limited ourselves to a single light placed behind the sitter. It outlines the profile and leaves the face mostly in shadow, which turns out to be very freeing — nobody worries about how they look when they can barely be seen."],
      ["img", "portrait-noir", "Rim light only, nothing on the shadow side."],
      ["h", "Looking away"],
      ["p", "We asked every sitter to look anywhere except the lens. The resulting pictures feel less like portraits of people being photographed and more like moments we happened to witness."],
      ["img", "portrait-sage", "From the Lisbon sittings."]
    ] },
  { slug: "a-night-walk-in-tokyo", title: "A Night Walk in Tokyo", cat: "Field Notes", date: "2024-11-27", read: 5, img: "neon-rain",
    dek: "Ten nights, no itinerary and a lot of rain.",
    body: [
      ["p", "We arrived with a shot list and abandoned it on the first night. Tokyo after dark doesn't reward plans; it rewards walking until your feet hurt and noticing what the rain is doing to the light."],
      ["img", "city-blue", "The skyline doubled in the bay."],
      ["p", "The waterfront became our stage. Long exposures smoothed the bay into glass and turned the city into a single glowing reflection — closer to how it feels at 2am than to how it looks on a map."]
    ] }
];

window.HERO_SLIDES = [
  { img: "meadow-house", title: "Lonely Life at the Meadow", sub: "Jutland, Spring 2023", project: "architectural-geometry" },
  { img: "alpine-valley", title: "A Symphony of Silent Peaks", sub: "Dolomites, Summer 2025", project: "mountain-light" },
  { img: "countryside-barn", title: "Golden Hour Homestead", sub: "Jutland, Autumn 2023", project: "architectural-geometry" }
];
