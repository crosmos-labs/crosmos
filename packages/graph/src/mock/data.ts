// Wire shapes for the mock dataset. These mirror Crosmos's `/graph` API
// payload so the fixtures can be fed through any matching mapper, but they're
// not exported from the package's public types — consumers using the mocks
// rely on TypeScript structural typing.
interface MockGraphNodeWire {
	id: string;
	name: string;
	entity_type: string | null;
	edge_count: number;
	created_at: string | null;
	updated_at: string | null;
}

interface MockGraphEdgeWire {
	id: string;
	source_entity_id: string;
	target_entity_id: string;
	relation_type: string;
	confidence: number;
	valid_from: string | null;
	recorded_at: string;
}

// Procedural generator that produces a ~500-node Crosmos-shaped knowledge
// graph. Mirrors production conventions: 7 canonical lowercase entity types,
// the canonical 23-relation vocabulary, a single `USER` person hub, bimodal
// confidence, mostly-null `valid_from`. Seeded so the dataset is byte-stable
// across loads.

type EntityType =
	| "person"
	| "organization"
	| "technology"
	| "project"
	| "concept"
	| "location"
	| "object";

interface InternalNode {
	id: string;
	name: string;
	entity_type: EntityType;
	created_at: string;
	updated_at: string;
}

interface InternalEdge {
	id: string;
	source_entity_id: string;
	target_entity_id: string;
	relation_type: string;
	confidence: number;
	valid_from: string | null;
	recorded_at: string;
}

// ─── Canonical vocabularies ────────────────────────────────────────────────

// Forward-only canonical relations (inverses omitted, matching the LLM
// extractor's behaviour). Plus a handful of "soft" symmetric ones the
// extractor commonly emits.
const CANONICAL_RELATIONS = {
	WORKS_FOR: true,
	EMPLOYS: true,
	MANAGES: true,
	MANAGED_BY: true,
	USES: true,
	USED_BY: true,
	PART_OF: true,
	HAS_PART: true,
	LOCATED_IN: true,
	CONTAINS: true,
	OWNS: true,
	OWNED_BY: true,
	KNOWS: true,
	FRIEND_OF: true,
	PARTNER_OF: true,
	MET: true,
	PREFERS: true,
	LIKES: true,
	DISLIKES: true,
	RECOMMENDS: true,
	ATTENDED: true,
	VISITED: true,
	TRAVELED_TO: true,
	PLANNED: true,
	PURCHASED: true,
} as const;
type CanonicalRelation = keyof typeof CANONICAL_RELATIONS;

// Which relations are legal for a (sourceType -> targetType) pair. Mirrors
// what the real extractor produces — e.g. a `person` -> `organization` edge
// is almost always WORKS_FOR / EMPLOYS / MANAGES / ATTENDED, never `LIKES`.
type TypePair = `${EntityType}->${EntityType}`;
const PAIR_RELATIONS: Partial<Record<TypePair, CanonicalRelation[]>> = {
	"person->person": ["KNOWS", "FRIEND_OF", "MET", "PARTNER_OF", "MANAGES"],
	"person->organization": ["WORKS_FOR", "ATTENDED", "MANAGES", "OWNS"],
	"person->technology": ["USES", "PREFERS", "LIKES", "DISLIKES"],
	"person->project": ["MANAGES", "PART_OF", "USES", "OWNS"],
	"person->concept": ["LIKES", "PREFERS", "DISLIKES", "RECOMMENDS"],
	"person->location": ["LOCATED_IN", "VISITED", "TRAVELED_TO"],
	"person->object": ["OWNS", "PURCHASED", "LIKES"],
	"organization->person": ["EMPLOYS"],
	"organization->organization": ["PART_OF", "OWNS"],
	"organization->technology": ["USES", "OWNS"],
	"organization->project": ["HAS_PART", "OWNS"],
	"organization->location": ["LOCATED_IN"],
	"organization->object": ["OWNS"],
	"technology->concept": ["PART_OF"],
	"technology->organization": ["PART_OF", "OWNED_BY"],
	"project->technology": ["USES"],
	"project->organization": ["PART_OF"],
	"project->concept": ["PART_OF"],
	"project->person": ["MANAGED_BY"],
	"concept->concept": ["PART_OF"],
	"location->location": ["PART_OF", "CONTAINS"],
	"location->organization": ["CONTAINS"],
	"object->organization": ["OWNED_BY"],
};

// Fixed tier-1 mix: exactly how many of each type hang directly off USER.
// Hand-balanced to mirror a real personal-knowledge graph — heavy on people
// and technology, generous on organizations and projects so cluster diversity
// is guaranteed regardless of RNG variance.
const TIER1_MIX: Record<EntityType, number> = {
	person: 12,
	organization: 7,
	technology: 11,
	project: 5,
	concept: 6,
	location: 5,
	object: 4,
};
// Canonical relations the extractor uses from USER, by target type. Picked
// uniformly at random per tier-1 hub.
const USER_RELATIONS_BY_TYPE: Record<EntityType, readonly CanonicalRelation[]> =
	{
		person: ["KNOWS", "FRIEND_OF", "PARTNER_OF", "MET"],
		organization: ["WORKS_FOR", "ATTENDED", "MANAGES", "OWNS"],
		technology: ["USES", "PREFERS", "LIKES", "DISLIKES"],
		project: ["MANAGES", "PART_OF", "USES", "OWNS"],
		concept: ["LIKES", "PREFERS", "DISLIKES", "RECOMMENDS"],
		location: ["LOCATED_IN", "VISITED", "TRAVELED_TO"],
		object: ["OWNS", "PURCHASED", "LIKES"],
	};

// ─── Name tables ────────────────────────────────────────────────────────────

// Hand-curated so a casual viewer sees plausible Crosmos-style entities, not
// synthetic-looking "Person 42". Sized comfortably above the per-type budget.

const PERSON_NAMES = [
	"Alice Chen",
	"Marcus Johnson",
	"Priya Patel",
	"Liam O'Brien",
	"Sofia Rossi",
	"Daniel Kim",
	"Maya Khan",
	"Lucas Silva",
	"Hannah Müller",
	"Aarav Sharma",
	"Emily Davies",
	"Yuki Tanaka",
	"Mateo García",
	"Isla Macleod",
	"Noah Cohen",
	"Olivia Bennett",
	"Eli Rosenberg",
	"Zara Ahmed",
	"Felix Wagner",
	"Rohan Mehta",
	"Sienna Walsh",
	"Theo Laurent",
	"Aisha Begum",
	"Caleb Park",
	"Nina Volkov",
	"Adrian Costa",
	"Mira Singh",
	"Owen Hughes",
	"Linnea Berg",
	"Jasper Holt",
	"Camila Vargas",
	"Henry Adler",
	"Yara El-Sayed",
	"Finn O'Connor",
	"Naya Watson",
	"Ezra Goldberg",
	"Anya Petrov",
	"Diego Morales",
	"Tessa Lin",
	"Mila Novak",
	"Ravi Iyer",
	"Greta Schmidt",
	"Kenji Watanabe",
	"Lucia Marchetti",
	"Arthur Hill",
	"Imani Okafor",
	"Saanvi Reddy",
	"Levi Stein",
	"Beatrice Wood",
	"Tariq Hassan",
	"Pia Larsen",
	"Cole Whitaker",
	"Aurelia Ricci",
	"Soren Eriksen",
	"Devika Nair",
	"Hugo Albers",
	"Eva Bauer",
	"Mateusz Kowalski",
	"Anika Joshi",
	"Wren Caldwell",
	"Otis Mathers",
	"Sara Bianchi",
	"Karim El-Masri",
	"Ivy Donovan",
	"Rafael Cruz",
	"Lina Choi",
	"Bram De Vries",
	"Esme Carter",
	"Nikhil Verma",
	"Talia Fox",
	"Jonas Holm",
	"Eira Pritchard",
	"Mateo Russo",
	"Aditi Bose",
	"Linus Stoll",
	"Mae Sullivan",
	"Cyrus Vahedi",
	"Lena Schulz",
	"Aaron Goldstein",
	"Sienna Pope",
	"Vasili Kuznetsov",
	"Maeve Cassidy",
	"Iker Etxeberria",
	"Stella Hayes",
	"Joaquin Reyes",
	"Anaya Pillai",
	"Ronan Walsh",
	"Helena Vargas",
	"Ash Lin",
	"Marisol Vega",
	"Inara Faruq",
	"Dmitri Ivanov",
	"Pippa Westwood",
	"Reese Calloway",
	"Indira Rao",
	"Klaus Becker",
	"Cleo Marshall",
	"Sven Lindqvist",
	"Dahlia Quint",
	"Roan Pierce",
	"Selene Doukas",
	"Imran Qureshi",
	"Lyra Brennan",
	"Atticus Hale",
	"Esperanza Solé",
	"Quentin Marsh",
	"Vikram Bhatt",
	"Cosima Frey",
	"Astrid Vinter",
	"Tomás Bravo",
	"Reka Nagy",
	"Mathilde Olsen",
	"Bram Hoffmann",
	"Saira Bose",
	"Konstantin Stern",
	"Iola Fennell",
	"Niamh Carlin",
	"Émile Beauchamp",
	"Yusuf Demir",
	"Aino Korhonen",
	"Zane Brody",
	"Linnet Vance",
	"Octavio Salas",
	"Reina Saito",
	"Vidya Krishnan",
	"Pavel Sokolov",
	"Maelle Bernard",
	"Jordan Pace",
	"Bea Larsson",
	"Dexter Cole",
	"Saskia Vlieger",
	"Otto Hjalmar",
	"Cleo Brennan",
	"Niko Pellegrini",
	"Hattie Burke",
	"Anders Kaplan",
	"Rumi Otsuka",
	"Aurora Pell",
	"Sloan Whitfield",
	"Mae Burnside",
	"Felix Pham",
	"Mira Eskola",
	"Ezra Vargas",
	"Bodhi Tan",
	"Hana Aalto",
	"Cyril Toomey",
	"Adisa Boateng",
	"Lior Sapir",
	"Aram Markarian",
	"Verity Stone",
];

const ORG_NAMES = [
	"Stripe",
	"Linear",
	"Vercel",
	"Anthropic",
	"Notion",
	"Pinecone Labs",
	"Figma",
	"Shopify",
	"Atlassian",
	"Datadog",
	"Cloudflare",
	"Replit",
	"Supabase",
	"OpenAI",
	"HuggingFace",
	"Tailscale",
	"Sentry",
	"GitHub",
	"Postman",
	"Algolia",
	"Brex",
	"Ramp",
	"Mercury",
	"Plaid",
	"Snowflake",
	"Modal Labs",
	"Render",
	"Fly.io",
	"Neon",
	"Resend",
	"Crosmos Labs",
	"Substack",
	"Linktree",
	"Beehiiv",
	"Cal.com",
	"Pendo",
	"Mixpanel",
	"Amplitude",
	"Hex",
	"Retool",
	"Stanford University",
	"MIT",
	"Berkeley",
	"Carnegie Mellon",
	"ETH Zürich",
	"Imperial College",
	"TU Delft",
	"IIT Bombay",
	"Tsinghua University",
	"NUS",
	"Acme Robotics",
	"Beacon Studios",
	"Cipher Foundry",
	"Drift Analytics",
	"Ember Health",
	"Foundry Press",
	"Glade & Co.",
	"Halo Books",
	"Indigo Brewing",
	"Juno Bikes",
];

const TECH_NAMES = [
	"Python",
	"TypeScript",
	"Rust",
	"Go",
	"Swift",
	"Kotlin",
	"Elixir",
	"Haskell",
	"Zig",
	"Java",
	"React",
	"Next.js",
	"SvelteKit",
	"Vue",
	"Solid",
	"Astro",
	"Remix",
	"Qwik",
	"Nuxt",
	"Angular",
	"Postgres",
	"SQLite",
	"DuckDB",
	"Redis",
	"ClickHouse",
	"Neo4j",
	"Qdrant",
	"Weaviate",
	"Cassandra",
	"MongoDB",
	"Bun",
	"Deno",
	"Node.js",
	"tRPC",
	"GraphQL",
	"gRPC",
	"Protobuf",
	"OpenAPI",
	"WebSockets",
	"WebRTC",
	"Docker",
	"Kubernetes",
	"Terraform",
	"Ansible",
	"Helm",
	"Tailwind",
	"shadcn/ui",
	"Radix",
	"Framer Motion",
	"GSAP",
	"d3-force",
	"react-force-graph-2d",
	"Three.js",
	"WebGL",
	"Canvas API",
	"PyTorch",
	"TensorFlow",
	"JAX",
	"scikit-learn",
	"Polars",
	"FastAPI",
	"Django",
	"Flask",
	"Express",
	"Hono",
	"Drizzle",
	"Prisma",
	"Kysely",
	"TypeORM",
	"SQLAlchemy",
	"Vite",
	"esbuild",
	"Webpack",
	"tsup",
	"Rollup",
];

const PROJECT_NAMES = [
	"Atlas",
	"Aurora",
	"Bastion",
	"Beacon",
	"Cobalt",
	"Compass",
	"Drift",
	"Echo",
	"Ember",
	"Falcon",
	"Glacier",
	"Helios",
	"Iris",
	"Juno",
	"Kepler",
	"Lumen",
	"Mercury Engine",
	"Nova",
	"Orbit",
	"Pioneer",
	"Quartz",
	"Relay",
	"Sentinel",
	"Tessera",
	"Vector",
	"Voyager",
	"Warp",
	"Zenith",
	"Atlas v2 Migration",
	"Q1 Onboarding Revamp",
	"Memory Consolidation Pipeline",
	"Inference Sidecar",
	"Graph API Refactor",
	"Mobile Beta",
	"Search Reindex",
	"CS 229 Final Project",
	"Thesis: Graph Reasoning",
	"Side Project: Habit Tracker",
	"Open-Source: tinydiff",
	"Hackathon: Lumen Health",
	"Cipher Lite",
	"Mosaic",
	"Prism Boards",
	"Synapse",
	"Tideline",
	"Halo Notes",
	"Drift Inbox",
	"Mirror Stack",
	"Loom Loop",
	"Yarn Threads",
];

const CONCEPT_NAMES = [
	"Machine Learning",
	"Distributed Systems",
	"Retrieval-Augmented Generation",
	"Knowledge Graphs",
	"Vector Search",
	"Functional Programming",
	"Type Theory",
	"Domain-Driven Design",
	"Event Sourcing",
	"CQRS",
	"Reactive Programming",
	"Concurrency",
	"Memory Consolidation",
	"Spaced Repetition",
	"Active Recall",
	"Stoicism",
	"Effective Altruism",
	"Minimalism",
	"Slow Living",
	"Deep Work",
	"Climbing",
	"Trail Running",
	"Cycling",
	"Photography",
	"Pottery",
	"Wabi-sabi",
	"Bauhaus Design",
	"Cyberpunk",
	"Solarpunk",
	"Brutalism",
	"Probability Theory",
	"Linear Algebra",
	"Information Retrieval",
	"Reinforcement Learning",
	"Causal Inference",
	"Mechanism Design",
	"Systems Thinking",
	"First Principles",
	"Pareto Frontier",
	"Loss Aversion",
	"Specialty Coffee",
	"Wine Tasting",
	"Sourdough",
	"Fermentation",
	"Mise en Place",
	"Behavioral Economics",
	"Game Theory",
	"Bayesian Inference",
	"Graph Theory",
	"Topology",
	"Mindfulness Meditation",
	"Cognitive Behavioral Therapy",
	"Sleep Hygiene",
	"Nutrition Science",
	"Strength Training",
	"Long-form Writing",
	"Improv",
	"Public Speaking",
	"Pair Programming",
	"Code Review",
	"Open Source",
	"Indie Hacking",
	"Bootstrapping",
	"Product-Led Growth",
	"Developer Experience",
];

const LOCATION_NAMES = [
	"San Francisco",
	"Berkeley",
	"Oakland",
	"Palo Alto",
	"Mountain View",
	"New York",
	"Brooklyn",
	"Boston",
	"Cambridge",
	"Seattle",
	"Portland",
	"Austin",
	"Denver",
	"Chicago",
	"Toronto",
	"Montréal",
	"Mexico City",
	"São Paulo",
	"Buenos Aires",
	"Lisbon",
	"Porto",
	"Madrid",
	"Barcelona",
	"Paris",
	"Lyon",
	"Berlin",
	"Munich",
	"Hamburg",
	"Amsterdam",
	"Rotterdam",
	"Copenhagen",
	"Stockholm",
	"Oslo",
	"Helsinki",
	"Reykjavík",
	"Zürich",
	"Vienna",
	"Prague",
	"Krakow",
	"Budapest",
	"Istanbul",
	"Athens",
	"Tel Aviv",
	"Dubai",
	"Cape Town",
	"Lagos",
	"Nairobi",
	"Mumbai",
	"Bengaluru",
	"Delhi",
	"Kyoto",
	"Tokyo",
	"Osaka",
	"Seoul",
	"Taipei",
	"Hong Kong",
	"Singapore",
	"Bali",
	"Sydney",
	"Melbourne",
	"Mission District",
	"SoMa",
	"The Marina",
	"Castro",
	"Hayes Valley",
	"Tartine Manufactory",
	"Sightglass Coffee",
	"Blue Bottle HQ",
	"Ferry Building",
	"Dolores Park",
];

const OBJECT_NAMES = [
	"iPhone 15 Pro",
	"MacBook Pro M3",
	"Kindle Oasis",
	"AirPods Pro",
	"Apple Watch Ultra",
	"Bose QC45",
	"Sony A7 IV",
	"Ricoh GR IIIx",
	"Leica Q3",
	"Fuji X100V",
	"Bell Zephyr Helmet",
	"Specialized Tarmac",
	"Bianchi Oltre",
	"Trek Madone",
	"Cervélo S5",
	"Hario V60",
	"Fellow Stagg",
	"Ode Brew Grinder",
	"Comandante C40",
	"Aeropress",
	"La Marzocco Linea Mini",
	"Rocket Appartamento",
	"Mahlkönig EK43",
	"Lelit Bianca",
	"Niche Zero",
	"Patagonia Houdini",
	"Arc'teryx Beta AR",
	"Nike Vaporfly 3",
	"Asics Novablast",
	"Salomon Speedcross",
	"Moleskine Classic",
	"Field Notes Brand",
	"Lamy 2000",
	"Pilot Custom 823",
	"Pelikan M800",
	"Eames Lounge Chair",
	"Aeron Chair",
	"Standing Desk Pro",
	"Logitech MX Master 3S",
	"Keychron K3",
	"Glossier Boy Brow",
	"Le Labo Santal 33",
	"Aesop Tacit",
	"Maison Margiela Replica",
	"Byredo Gypsy Water",
	"Anki Flashcards",
	"Roam Research Notebook",
	"Obsidian Vault",
	"Daily One Notebook",
	"Hobonichi Techo",
	"Sourdough Starter Astrid",
	"Rubik's Cube 3x3",
	"Yamaha Reface CP",
	"Fender Player Strat",
	"Roland TR-8S",
];

// ─── PRNG (Mulberry32) ─────────────────────────────────────────────────────

function createRng(seed: number): () => number {
	let t = seed >>> 0;
	return () => {
		t = (t + 0x6d2b79f5) >>> 0;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}

const SEED = 0xc05e0501;

// ─── Builder ───────────────────────────────────────────────────────────────

interface BuildState {
	rng: () => number;
	nodes: InternalNode[];
	edges: InternalEdge[];
	idCounter: Record<EntityType, number>;
	edgeIdCounter: number;
	edgeKey: Set<string>;
	nameUsed: Set<string>;
	namePoolIndex: Record<EntityType, number>;
	batchDates: string[];
}

const NAME_POOLS: Record<EntityType, readonly string[]> = {
	person: PERSON_NAMES,
	organization: ORG_NAMES,
	technology: TECH_NAMES,
	project: PROJECT_NAMES,
	concept: CONCEPT_NAMES,
	location: LOCATION_NAMES,
	object: OBJECT_NAMES,
};

function pick<T>(rng: () => number, arr: readonly T[]): T {
	if (arr.length === 0) throw new Error("pick: empty array");
	const item = arr[Math.floor(rng() * arr.length)];
	if (item === undefined) throw new Error("pick: empty array");
	return item;
}

function pickWeighted<T>(
	rng: () => number,
	items: readonly { weight: number; value: T }[],
): T {
	const total = items.reduce((s, i) => s + i.weight, 0);
	let r = rng() * total;
	for (const it of items) {
		r -= it.weight;
		if (r <= 0) return it.value;
	}
	const last = items[items.length - 1];
	if (!last) throw new Error("pickWeighted: empty items");
	return last.value;
}

function makeNode(state: BuildState, type: EntityType): InternalNode {
	const pool = NAME_POOLS[type];
	let name: string | null = null;
	// Pull names sequentially through the pool, then fall back to suffixing
	// for the rare overflow.
	for (let attempt = 0; attempt < pool.length; attempt++) {
		const candidate = pool[state.namePoolIndex[type] % pool.length] as string;
		state.namePoolIndex[type] += 1;
		const key = candidate.toLowerCase();
		if (!state.nameUsed.has(key)) {
			state.nameUsed.add(key);
			name = candidate;
			break;
		}
	}
	if (!name) {
		const fallback = `${pool[0]} ${state.idCounter[type] + 1}`;
		state.nameUsed.add(fallback.toLowerCase());
		name = fallback;
	}

	state.idCounter[type] += 1;
	const id = `${type}-${state.idCounter[type]}`;
	const created = pick(state.rng, state.batchDates);
	const node: InternalNode = {
		id,
		name,
		entity_type: type,
		created_at: created,
		updated_at: created,
	};
	state.nodes.push(node);
	return node;
}

function relationsFor(src: EntityType, tgt: EntityType): CanonicalRelation[] {
	return PAIR_RELATIONS[`${src}->${tgt}` as TypePair] ?? [];
}

function addEdge(
	state: BuildState,
	src: InternalNode,
	tgt: InternalNode,
	rel: CanonicalRelation,
	confidenceRange: [number, number],
): InternalEdge | null {
	if (src.id === tgt.id) return null;
	const key = `${src.id}->${rel}->${tgt.id}`;
	if (state.edgeKey.has(key)) return null;
	state.edgeKey.add(key);

	const [lo, hi] = confidenceRange;
	const confidence = Math.round((lo + state.rng() * (hi - lo)) * 100) / 100;

	// ~15% of edges carry a `valid_from` — explicit transition dates.
	const recordedAt = pick(state.rng, state.batchDates);
	const validFrom = state.rng() < 0.15 ? earlierDate(state, recordedAt) : null;

	state.edgeIdCounter += 1;
	const edge: InternalEdge = {
		id: `edge-${state.edgeIdCounter}`,
		source_entity_id: src.id,
		target_entity_id: tgt.id,
		relation_type: rel,
		confidence,
		valid_from: validFrom,
		recorded_at: recordedAt,
	};
	state.edges.push(edge);
	return edge;
}

function earlierDate(state: BuildState, recordedIso: string): string {
	const ms = Date.parse(recordedIso);
	const offsetDays = Math.floor(state.rng() * 540) + 30;
	const d = new Date(ms - offsetDays * 86_400_000);
	return d.toISOString();
}

function buildBatchDates(rng: () => number): string[] {
	// ~10 ingestion sessions over the last 18 months. Each session date is
	// used as the recorded_at for several nodes/edges, so timestamps cluster
	// realistically rather than being uniformly random.
	const end = Date.parse("2026-05-01T00:00:00Z");
	const eighteenMonths = 540 * 86_400_000;
	const sessions = 14;
	const dates: string[] = [];
	for (let i = 0; i < sessions; i++) {
		const offsetMs = Math.floor(rng() * eighteenMonths);
		const d = new Date(end - offsetMs);
		dates.push(d.toISOString());
	}
	return dates;
}

function fanOutCountFor(type: EntityType, rng: () => number): number {
	// Hub types get bigger fan-outs; leaf-prone types get smaller ones.
	const ranges: Record<EntityType, [number, number]> = {
		organization: [14, 28],
		project: [9, 18],
		technology: [7, 15],
		concept: [4, 10],
		person: [4, 10],
		location: [4, 10],
		object: [0, 3],
	};
	const [lo, hi] = ranges[type];
	return lo + Math.floor(rng() * (hi - lo + 1));
}

function fanOutTargetsFor(
	type: EntityType,
): readonly { target: EntityType; weight: number }[] {
	switch (type) {
		case "organization":
			return [
				{ target: "person", weight: 6 },
				{ target: "technology", weight: 3 },
				{ target: "project", weight: 4 },
				{ target: "location", weight: 2 },
				{ target: "organization", weight: 1 },
				{ target: "object", weight: 2 },
			];
		case "project":
			return [
				{ target: "technology", weight: 4 },
				{ target: "person", weight: 4 },
				{ target: "concept", weight: 2 },
				{ target: "organization", weight: 1 },
			];
		case "technology":
			return [
				{ target: "concept", weight: 3 },
				{ target: "organization", weight: 2 },
			];
		case "concept":
			return [{ target: "concept", weight: 1 }];
		case "person":
			return [
				{ target: "person", weight: 3 },
				{ target: "organization", weight: 2 },
				{ target: "technology", weight: 2 },
				{ target: "location", weight: 1 },
			];
		case "location":
			return [
				{ target: "location", weight: 3 },
				{ target: "organization", weight: 3 },
			];
		case "object":
			return [{ target: "organization", weight: 1 }];
	}
}

function buildGraph(): {
	nodes: MockGraphNodeWire[];
	edges: MockGraphEdgeWire[];
} {
	const rng = createRng(SEED);
	const state: BuildState = {
		rng,
		nodes: [],
		edges: [],
		idCounter: {
			person: 0,
			organization: 0,
			technology: 0,
			project: 0,
			concept: 0,
			location: 0,
			object: 0,
		},
		edgeIdCounter: 0,
		edgeKey: new Set(),
		nameUsed: new Set(),
		namePoolIndex: {
			person: 0,
			organization: 0,
			technology: 0,
			project: 0,
			concept: 0,
			location: 0,
			object: 0,
		},
		batchDates: buildBatchDates(rng),
	};

	// Pass 1: the USER anchor.
	state.nameUsed.add("user");
	state.idCounter.person += 1;
	const userCreated = state.batchDates[0] as string;
	const userNode: InternalNode = {
		id: "user",
		name: "USER",
		entity_type: "person",
		created_at: userCreated,
		updated_at: userCreated,
	};
	state.nodes.push(userNode);

	// Pass 2: tier-1 — entities the USER is directly related to. We use a
	// fixed type mix (not weighted random) so cluster diversity is stable
	// across seeds; the relation per node is still RNG-driven.
	const tier1: InternalNode[] = [];
	const tier1Order: EntityType[] = [
		"organization",
		"project",
		"technology",
		"person",
		"concept",
		"location",
		"object",
	];
	for (const type of tier1Order) {
		const count = TIER1_MIX[type];
		const relOptions = USER_RELATIONS_BY_TYPE[type];
		for (let i = 0; i < count; i++) {
			const node = makeNode(state, type);
			const rel = pick(rng, relOptions);
			addEdge(state, userNode, node, rel, [0.85, 0.95]);
			tier1.push(node);
		}
	}

	// Pass 3: hub fan-out — each tier-1 entity gets a cluster of its own.
	// `tier1Order` processes the highest-fan-out types first (orgs, projects)
	// so they get their share of the 500-node budget before leaf-prone types
	// (people, concepts) eat it.
	const TARGET_TOTAL = 500;
	for (const hub of tier1) {
		if (state.nodes.length >= TARGET_TOTAL) break;
		const fanCount = fanOutCountFor(hub.entity_type, rng);
		const targetMix = fanOutTargetsFor(hub.entity_type);
		if (targetMix.length === 0) continue;
		for (let i = 0; i < fanCount; i++) {
			if (state.nodes.length >= TARGET_TOTAL) break;
			const targetType = pickWeighted(
				rng,
				targetMix.map((t) => ({ weight: t.weight, value: t.target })),
			);
			const rels = relationsFor(hub.entity_type, targetType);
			if (rels.length === 0) continue;
			const leaf = makeNode(state, targetType);
			const rel = pick(rng, rels);
			addEdge(state, hub, leaf, rel, [0.85, 0.95]);
		}
	}

	// Pass 4: cross-cluster bridges — pick random pairs of existing nodes
	// (avoiding USER as a source to keep the hub uncluttered) and connect
	// them at lower confidence if the pair has a legal relation.
	const BRIDGE_TARGET = 55;
	const nonUserNodes = state.nodes.filter((n) => n.id !== "user");
	let bridgeAttempts = 0;
	let bridgeAdded = 0;
	while (bridgeAdded < BRIDGE_TARGET && bridgeAttempts < BRIDGE_TARGET * 12) {
		bridgeAttempts++;
		const src = pick(rng, nonUserNodes);
		const tgt = pick(rng, nonUserNodes);
		if (src.id === tgt.id) continue;
		const rels = relationsFor(src.entity_type, tgt.entity_type);
		if (rels.length === 0) continue;
		const rel = pick(rng, rels);
		const added = addEdge(state, src, tgt, rel, [0.72, 0.85]);
		if (added) bridgeAdded++;
	}

	// Compute edge_count from the actual edge list (truthful weights for the
	// renderer's `getNodeWeight`).
	const degree = new Map<string, number>();
	for (const e of state.edges) {
		degree.set(e.source_entity_id, (degree.get(e.source_entity_id) ?? 0) + 1);
		degree.set(e.target_entity_id, (degree.get(e.target_entity_id) ?? 0) + 1);
	}

	const nodes: MockGraphNodeWire[] = state.nodes.map((n) => ({
		id: n.id,
		name: n.name,
		entity_type: n.entity_type,
		edge_count: degree.get(n.id) ?? 0,
		created_at: n.created_at,
		updated_at: n.updated_at,
	}));

	const edges: MockGraphEdgeWire[] = state.edges.map((e) => ({
		id: e.id,
		source_entity_id: e.source_entity_id,
		target_entity_id: e.target_entity_id,
		relation_type: e.relation_type,
		confidence: e.confidence,
		valid_from: e.valid_from,
		recorded_at: e.recorded_at,
	}));

	return { nodes, edges };
}

const { nodes, edges } = buildGraph();

export const MOCK_NODES: MockGraphNodeWire[] = nodes;
export const MOCK_EDGES: MockGraphEdgeWire[] = edges;
