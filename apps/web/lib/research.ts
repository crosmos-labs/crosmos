import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { extractSections, type TocSection } from "./toc";

const RESEARCH_FILE = path.join(process.cwd(), "content/research/paper.mdx");

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

export function getResearchDoc(): ResearchDoc {
	const raw = fs.readFileSync(RESEARCH_FILE, "utf-8");
	const { data, content } = matter(raw);

	if (typeof data.title !== "string" || !data.title) {
		throw new Error('Missing or invalid "title" in research/paper.mdx');
	}

	const title = data.title;
	const epigraph = typeof data.epigraph === "string" ? data.epigraph : "";
	const note = typeof data.note === "string" ? data.note : "";
	const body = content.trimStart();

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
