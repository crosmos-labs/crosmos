import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const LEGAL_DIR = path.join(process.cwd(), "content/legal");

export type LegalDoc = {
	slug: "terms" | "privacy";
	title: string;
	effectiveAt: string;
	updatedAt: string;
	version: string;
	content: string;
	sections: LegalSection[];
};

export type LegalSection = {
	id: string;
	title: string;
	depth: 2 | 3;
};

export function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.replace(/^\s*\d+(?:\.\d+)*\.?\s*/, "")
		.replace(/[^a-z0-9\s.-]/g, "")
		.replace(/[\s.]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function extractSections(content: string): LegalSection[] {
	const sections: LegalSection[] = [];
	const seen = new Set<string>();
	const lines = content.split("\n");
	let inFence = false;

	for (const line of lines) {
		if (line.startsWith("```")) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;

		const match = line.match(/^(#{2,3})\s+(.+?)\s*$/);
		if (!match || !match[1] || !match[2]) continue;

		const depth = match[1].length as 2 | 3;
		const title = match[2].trim();
		let id = slugifyHeading(title);
		if (!id) continue;

		let suffix = 2;
		const base = id;
		while (seen.has(id)) {
			id = `${base}-${suffix++}`;
		}
		seen.add(id);

		sections.push({ id, title, depth });
	}

	return sections;
}

export function getLegalDoc(slug: "terms" | "privacy"): LegalDoc {
	const file = path.join(LEGAL_DIR, `${slug}.mdx`);
	const raw = fs.readFileSync(file, "utf-8");
	const { data, content } = matter(raw);

	if (typeof data.title !== "string" || !data.title) {
		throw new Error(`Missing or invalid "title" in ${slug}.mdx`);
	}
	if (typeof data.effectiveAt !== "string" || !data.effectiveAt) {
		throw new Error(`Missing or invalid "effectiveAt" in ${slug}.mdx`);
	}
	if (typeof data.updatedAt !== "string" || !data.updatedAt) {
		throw new Error(`Missing or invalid "updatedAt" in ${slug}.mdx`);
	}
	if (Number.isNaN(new Date(data.effectiveAt).getTime())) {
		throw new Error(`Invalid "effectiveAt" date in ${slug}.mdx`);
	}
	if (Number.isNaN(new Date(data.updatedAt).getTime())) {
		throw new Error(`Invalid "updatedAt" date in ${slug}.mdx`);
	}
	if (typeof data.version !== "string" || !data.version) {
		throw new Error(`Missing or invalid "version" in ${slug}.mdx`);
	}

	return {
		slug,
		title: data.title,
		effectiveAt: data.effectiveAt,
		updatedAt: data.updatedAt,
		version: data.version,
		content,
		sections: extractSections(content),
	};
}

export function formatLegalDate(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
