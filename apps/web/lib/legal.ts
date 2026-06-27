import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { extractSections, type TocSection } from "./toc";

export { slugifyHeading } from "./toc";

const LEGAL_DIR = path.join(process.cwd(), "content/legal");

export type LegalSection = TocSection;

export type LegalDoc = {
	slug: "terms" | "privacy";
	title: string;
	effectiveAt: string;
	updatedAt: string;
	version: string;
	content: string;
	sections: LegalSection[];
};

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
