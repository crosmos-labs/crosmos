export type TocSection = {
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

export function extractSections(content: string): TocSection[] {
	const sections: TocSection[] = [];
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
