import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { extractSections, type TocSection } from "./toc";

const RESEARCH_FILE = path.join(process.cwd(), "content/research/paper.md");

export type ResearchRef = {
	id: string;
	text: string;
};

export type ResearchDoc = {
	title: string;
	epigraph: string;
	note: string;
	body: string;
	sections: TocSection[];
	uncitedRefs: ResearchRef[];
	citedCount: number;
};

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Pull the consecutive `>` blockquote blocks that sit before the body. */
function extractBlockquotes(lines: string[]): string[] {
	const blocks: string[] = [];
	let current: string[] = [];

	const flush = () => {
		if (current.length > 0) {
			blocks.push(current.join(" ").trim());
			current = [];
		}
	};

	for (const line of lines) {
		if (line.startsWith(">")) {
			current.push(line.replace(/^>\s?/, "").trim());
		} else {
			flush();
		}
	}
	flush();
	return blocks;
}

export function getResearchDoc(): ResearchDoc {
	const raw = fs.readFileSync(RESEARCH_FILE, "utf-8");
	const { content } = matter(raw);
	const lines = content.split("\n");

	const bodyStart = lines.findIndex((l) => /^##\s/.test(l));
	const head = bodyStart === -1 ? lines : lines.slice(0, bodyStart);
	const body = bodyStart === -1 ? "" : lines.slice(bodyStart).join("\n");

	const title = head.find((l) => /^#\s/.test(l))?.replace(/^#\s+/, "").trim() ?? "";
	const [epigraph = "", note = ""] = extractBlockquotes(head);

	const defs: ResearchRef[] = [];
	const defRe = /^\[\^([^\]]+)\]:\s*(.+)$/gm;
	let m: RegExpExecArray | null;
	while ((m = defRe.exec(body)) !== null) {
		defs.push({ id: m[1] as string, text: (m[2] as string).trim() });
	}

	const isCited = (id: string) => {
		const matches = body.match(new RegExp(`\\[\\^${escapeRegExp(id)}\\]`, "g"));
		return (matches?.length ?? 0) > 1; // more than the definition itself
	};

	const uncitedRefs = defs.filter((d) => !isCited(d.id));

	return {
		title,
		epigraph,
		note,
		body,
		sections: extractSections(body),
		uncitedRefs,
		citedCount: defs.length - uncitedRefs.length,
	};
}
