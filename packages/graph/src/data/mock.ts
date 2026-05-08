import type { GraphEdge, GraphNode, GraphViewportResponse } from "../types";

export const MOCK_GRAPH_ENABLE = true;

function uuid(i: number): string {
	const hex = i.toString(16).padStart(12, "0");
	return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-7${hex.slice(4, 7).padStart(3, "0")}-${hex.slice(0, 4)}-5${hex.slice(0, 4).padStart(4, "0")}${i.toString(36).padEnd(12, "0").slice(0, 8)}`;
}

function dates(_i: number) {
	const created = new Date(
		2025,
		Math.floor(Math.random() * 4),
		Math.floor(Math.random() * 28) + 1,
	);
	const updated = new Date(created.getTime() + Math.random() * 30 * 86400000);
	return {
		created_at: created.toISOString(),
		updated_at: updated.toISOString(),
	};
}

function r(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _pick<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]!;
}

const _ENTITY_TYPES = [
	"person",
	"organization",
	"technology",
	"project",
	"concept",
	"location",
	"object",
] as const;

const _RELATION_TYPES = [
	"WORKS_FOR",
	"EMPLOYS",
	"PREFERS",
	"LIKES",
	"DISLIKES",
	"USES",
	"USED_BY",
	"KNOWS",
	"FRIEND_OF",
	"MANAGES",
	"MANAGED_BY",
	"LOCATED_IN",
	"CONTAINS",
	"OWNS",
	"OWNED_BY",
	"PART_OF",
	"HAS_PART",
	"ATTENDED",
	"VISITED",
	"PURCHASED",
	"RECOMMENDS",
	"EXPERIENCED",
	"MET",
	"WITH",
] as const;

const PERSON_NAMES = [
	"Alice Chen",
	"Bob Martinez",
	"Carol Davis",
	"David Kim",
	"Emily Patel",
	"Frank Okafor",
	"Grace Liu",
	"Henry Wagner",
	"Isabella Rossi",
	"James Thompson",
	"Karen Yamamoto",
	"Leo Abbas",
	"Monica Stein",
	"Nathan Brooks",
	"Olivia Fernandez",
	"Peter Muller",
	"Quinn Zhao",
	"Rachel Andersen",
	"Samuel Osei",
	"Tara Gupta",
	"Umar Hassan",
	"Veronica Sato",
	"William Bosch",
	"Xiaoling He",
	"Youssef El-Amin",
	"Zara Kutcher",
	"Aditya Sharma",
	"Beatrice Nwosu",
	"Carlos Diaz",
	"Diana Petrov",
	"Ethan Black",
	"Fatima Rahman",
	"George Okafor",
	"Hannah Johansson",
	"Ivan Popov",
	"Julia Santos",
	"Kevin Tran",
	"Lena Meyer",
	"Marcus Cole",
	"Nadia Khoury",
	"Oscar Reyes",
	"Priya Menon",
	"Rafael Costa",
	"Sarah Kim",
	"Tobias Richter",
	"Uma Venkatesh",
	"Victor Lam",
	"Wendy Zhao",
	"Xavier Dupont",
	"Yuki Tanaka",
] as const;

const ORG_NAMES = [
	"Google",
	"Meta",
	"Amazon",
	"Apple",
	"Microsoft",
	"Stripe",
	"Anthropic",
	"OpenAI",
	"Netflix",
	"Spotify",
	"Uber",
	"Airbnb",
	"SpaceX",
	"Tesla",
	"NVIDIA",
	"Salesforce",
	"Databricks",
	"Vercel",
	"Cloudflare",
	"Figma",
	"Shopify",
	"Square",
	"Palantir",
	"Coinbase",
	"Robinhood",
	"Stanford University",
	"MIT",
	"Carnegie Mellon",
	"UC Berkeley",
	"Georgia Tech",
] as const;

const TECH_NAMES = [
	"Python",
	"JavaScript",
	"TypeScript",
	"Rust",
	"Go",
	"C++",
	"Java",
	"Kotlin",
	"React",
	"Next.js",
	"Vue",
	"Svelte",
	"Angular",
	"Node.js",
	"Django",
	"FastAPI",
	"Flask",
	"Express",
	"Spring Boot",
	"PostgreSQL",
	"MySQL",
	"MongoDB",
	"Redis",
	"Kafka",
	"RabbitMQ",
	"Docker",
	"Kubernetes",
	"AWS",
	"GCP",
	"Azure",
	"Terraform",
	"Ansible",
	"GraphQL",
	"REST",
	"gRPC",
	"WebSockets",
	"PyTorch",
	"TensorFlow",
	"scikit-learn",
	"Hugging Face",
	"LangChain",
	"Git",
	"GitHub",
	"VS Code",
	"Neovim",
	"IntelliJ",
	"Linux",
	"Nix",
	"Tailwind CSS",
	"Prisma",
] as const;

const PROJECT_NAMES = [
	"Crosmos",
	"Project Atlas",
	"Project Beacon",
	"Project Catalyst",
	"Project Delta",
	"Project Echo",
	"Project Falcon",
	"Project Gemini",
	"API Gateway",
	"Data Pipeline",
	"ML Platform",
	"Auth Service",
	"Search Engine",
	"Notification System",
	"Payment Gateway",
	"Analytics Dashboard",
	"Mobile App",
	"Desktop Client",
] as const;

const CONCEPT_NAMES = [
	"machine learning",
	"deep learning",
	"reinforcement learning",
	"natural language processing",
	"computer vision",
	"artificial intelligence",
	"blockchain",
	"microservices",
	"event-driven architecture",
	"test-driven development",
	"domain-driven design",
	"clean architecture",
	"agile methodology",
	"continuous integration",
	"observability",
	"work-life balance",
	"remote work",
	"pair programming",
	"dark mode preference",
	"accessibility",
	"performance optimization",
	"security-first design",
	"immutable infrastructure",
	"serverless computing",
	"edge computing",
	"distributed systems",
	"functional programming",
	"design systems",
	"type safety",
	"zero-trust security",
] as const;

const LOCATION_NAMES = [
	"San Francisco",
	"New York",
	"London",
	"Tokyo",
	"Berlin",
	"Paris",
	"Singapore",
	"Sydney",
	"Toronto",
	"Austin",
	"Seattle",
	"Denver",
	"Boston",
	"Chicago",
	"Amsterdam",
	"Stockholm",
	"Seoul",
	"Mumbai",
	"Sao Paulo",
	"Dubai",
] as const;

const OBJECT_NAMES = [
	"MacBook Pro",
	"iPhone 15",
	"ThinkPad X1",
	"iPad Pro",
	"Pixel Watch",
	"Kindle Paperwhite",
	"Sony WH-1000XM5",
	"Bose QC45",
	"Herman Miller Aeron",
	"Standing Desk Pro",
	"Keychron K2",
	"Logitech MX Master",
	"Apple Studio Display",
	"Dell UltraSharp 27",
	"Nintendo Switch",
	"Steam Deck",
	"Oculus Quest 3",
	"Sonos Arc",
	"Nest Hub Max",
	"Ring Doorbell",
] as const;

export function getMockGraphData(): GraphViewportResponse | null {
	if (!MOCK_GRAPH_ENABLE) return null;

	const nodes: GraphNode[] = [];
	let nodeId = 1;
	let edgeId = 1000;

	const personIds: string[] = [];
	const orgIds: string[] = [];
	const techIds: string[] = [];
	const projectIds: string[] = [];
	const conceptIds: string[] = [];
	const locationIds: string[] = [];
	const objectIds: string[] = [];

	for (const name of PERSON_NAMES) {
		const id = uuid(nodeId++);
		personIds.push(id);
		nodes.push({
			id,
			name,
			entity_type: "person",
			edge_count: 0,
			...dates(nodeId),
		});
	}
	for (const name of ORG_NAMES) {
		const id = uuid(nodeId++);
		orgIds.push(id);
		nodes.push({
			id,
			name,
			entity_type: "organization",
			edge_count: 0,
			...dates(nodeId),
		});
	}
	for (const name of TECH_NAMES) {
		const id = uuid(nodeId++);
		techIds.push(id);
		nodes.push({
			id,
			name,
			entity_type: "technology",
			edge_count: 0,
			...dates(nodeId),
		});
	}
	for (const name of PROJECT_NAMES) {
		const id = uuid(nodeId++);
		projectIds.push(id);
		nodes.push({
			id,
			name,
			entity_type: "project",
			edge_count: 0,
			...dates(nodeId),
		});
	}
	for (const name of CONCEPT_NAMES) {
		const id = uuid(nodeId++);
		conceptIds.push(id);
		nodes.push({
			id,
			name,
			entity_type: "concept",
			edge_count: 0,
			...dates(nodeId),
		});
	}
	for (const name of LOCATION_NAMES) {
		const id = uuid(nodeId++);
		locationIds.push(id);
		nodes.push({
			id,
			name,
			entity_type: "location",
			edge_count: 0,
			...dates(nodeId),
		});
	}
	for (const name of OBJECT_NAMES) {
		const id = uuid(nodeId++);
		objectIds.push(id);
		nodes.push({
			id,
			name,
			entity_type: "object",
			edge_count: 0,
			...dates(nodeId),
		});
	}

	const edges: GraphEdge[] = [];
	const edgeCounts = new Map<string, number>();

	function addEdge(
		sourceId: string,
		targetId: string,
		relationType: string,
		confidence: number,
	) {
		if (sourceId === targetId) return;
		const id = uuid(edgeId++);
		const validFrom =
			Math.random() > 0.6
				? null
				: new Date(
						2024 + Math.floor(Math.random() * 2),
						Math.floor(Math.random() * 12),
						Math.floor(Math.random() * 28) + 1,
					).toISOString();
		const recordedAt = new Date(
			2025,
			Math.floor(Math.random() * 5),
			Math.floor(Math.random() * 28) + 1,
		).toISOString();
		edges.push({
			id,
			source_entity_id: sourceId,
			target_entity_id: targetId,
			relation_type: relationType,
			confidence,
			valid_from: validFrom,
			recorded_at: recordedAt,
		});
		edgeCounts.set(sourceId, (edgeCounts.get(sourceId) ?? 0) + 1);
		edgeCounts.set(targetId, (edgeCounts.get(targetId) ?? 0) + 1);
	}

	const seeded = new Set<string>();
	function addUnique(s: string, t: string, rel: string, conf: number) {
		const key = `${s}->${rel}->${t}`;
		if (seeded.has(key)) return;
		seeded.add(key);
		addEdge(s, t, rel, conf);
	}

	for (let i = 0; i < personIds.length; i++) {
		const pid = personIds[i];
		if (!pid) continue;

		addUnique(
			pid,
			orgIds[i % orgIds.length]!,
			"WORKS_FOR",
			0.85 + Math.random() * 0.1,
		);

		const techCount = r(2, 5);
		for (let t = 0; t < techCount; t++) {
			const tid = techIds[r(0, techIds.length - 1)];
			addUnique(pid, tid!, "USES", 0.8 + Math.random() * 0.15);
		}

		if (Math.random() > 0.5) {
			addUnique(
				pid,
				conceptIds[r(0, conceptIds.length - 1)]!,
				"PREFERS",
				0.7 + Math.random() * 0.2,
			);
		}
		if (Math.random() > 0.7) {
			addUnique(
				pid,
				conceptIds[r(0, conceptIds.length - 1)]!,
				"LIKES",
				0.75 + Math.random() * 0.2,
			);
		}
		if (Math.random() > 0.8) {
			addUnique(
				pid,
				conceptIds[r(0, conceptIds.length - 1)]!,
				"DISLIKES",
				0.7 + Math.random() * 0.2,
			);
		}

		addUnique(
			pid,
			locationIds[r(0, locationIds.length - 1)]!,
			"LOCATED_IN",
			0.9 + Math.random() * 0.05,
		);

		if (Math.random() > 0.5) {
			addUnique(
				pid,
				projectIds[r(0, projectIds.length - 1)]!,
				"PART_OF",
				0.8 + Math.random() * 0.1,
			);
		}

		if (Math.random() > 0.6) {
			const friendId = personIds[r(0, personIds.length - 1)];
			if (friendId && friendId !== pid)
				addUnique(pid, friendId, "KNOWS", 0.7 + Math.random() * 0.2);
		}
		if (Math.random() > 0.85) {
			const friendId = personIds[r(0, personIds.length - 1)];
			if (friendId && friendId !== pid)
				addUnique(pid, friendId, "FRIEND_OF", 0.8 + Math.random() * 0.1);
		}

		if (Math.random() > 0.7) {
			addUnique(
				pid,
				objectIds[r(0, objectIds.length - 1)]!,
				"OWNS",
				0.85 + Math.random() * 0.1,
			);
		}

		if (i < 10) {
			const mid = personIds[r(0, personIds.length - 1)];
			if (mid && mid !== pid)
				addUnique(pid, mid, "MANAGES", 0.8 + Math.random() * 0.1);
		}
	}

	for (let i = 0; i < orgIds.length; i++) {
		const oid = orgIds[i];
		if (!oid) continue;

		addUnique(
			oid,
			locationIds[i % locationIds.length]!,
			"LOCATED_IN",
			0.9 + Math.random() * 0.05,
		);

		const techCount = r(2, 4);
		for (let t = 0; t < techCount; t++) {
			const tid = techIds[r(0, techIds.length - 1)];
			addUnique(oid, tid!, "USES", 0.75 + Math.random() * 0.2);
		}

		const projCount = r(1, 3);
		for (let p = 0; p < projCount; p++) {
			const pid = projectIds[r(0, projectIds.length - 1)];
			addUnique(pid!, oid, "PART_OF", 0.85 + Math.random() * 0.1);
		}
	}

	for (let i = 0; i < projectIds.length; i++) {
		const pid = projectIds[i];
		if (!pid) continue;

		const techCount = r(3, 6);
		for (let t = 0; t < techCount; t++) {
			const tid = techIds[r(0, techIds.length - 1)];
			addUnique(pid, tid!, "USES", 0.8 + Math.random() * 0.15);
		}

		addUnique(
			pid,
			locationIds[r(0, locationIds.length - 1)]!,
			"LOCATED_IN",
			0.7 + Math.random() * 0.2,
		);
	}

	for (let i = 0; i < conceptIds.length; i++) {
		const cid = conceptIds[i];
		if (!cid) continue;

		if (Math.random() > 0.5) {
			const other = conceptIds[r(0, conceptIds.length - 1)];
			if (other && other !== cid)
				addUnique(cid, other, "PART_OF", 0.7 + Math.random() * 0.2);
		}

		const techCount = r(1, 3);
		for (let t = 0; t < techCount; t++) {
			const tid = techIds[r(0, techIds.length - 1)];
			if (tid) addUnique(tid, cid, "PART_OF", 0.6 + Math.random() * 0.3);
		}
	}

	for (const lid of locationIds) {
		if (Math.random() > 0.4) {
			const other = locationIds[r(0, locationIds.length - 1)];
			if (other && other !== lid)
				addUnique(lid, other, "CONTAINS", 0.85 + Math.random() * 0.1);
		}
	}

	for (const oid of objectIds) {
		if (Math.random() > 0.8) {
			addUnique(
				personIds[r(0, personIds.length - 1)]!,
				oid,
				"RECOMMENDS",
				0.7 + Math.random() * 0.2,
			);
		}
		if (Math.random() > 0.5) {
			addUnique(
				personIds[r(0, personIds.length - 1)]!,
				oid,
				"PURCHASED",
				0.85 + Math.random() * 0.1,
			);
		}
	}

	for (const node of nodes) {
		node.edge_count = edgeCounts.get(node.id) ?? 0;
	}

	return {
		nodes,
		edges: edges.slice(0, 2000),
		total_nodes: nodes.length,
		total_edges: edges.length,
	};
}
