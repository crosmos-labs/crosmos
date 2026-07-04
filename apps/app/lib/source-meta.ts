import { type Connector, connectors } from "@/config/connectors";
import type { SourceSummary } from "@/lib/types/source";

export interface SourceRepo {
	ownerRepo: string;
	branch: string | null;
	url: string | null;
}

export interface ParsedSourceMeta {
	connector: Connector | null;
	repo: SourceRepo | null;
	project: string | null;
	session: string | null;
	sessionDate: string | null;
	extras: [string, string][];
}

export function formatMetaValue(value: unknown): string {
	return typeof value === "object" && value !== null
		? JSON.stringify(value)
		: String(value);
}

function nonEmptyString(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed || null;
}

function parseRepo(
	repoValue: unknown,
	branchValue: unknown,
): SourceRepo | null {
	const slug = nonEmptyString(repoValue);
	if (!slug) return null;
	const parts = slug.split("/");
	if (parts.length < 3 || parts.some((part) => !part)) return null;
	const [host, owner, name] = parts;
	return {
		ownerRepo: parts.slice(1).join("/"),
		branch: nonEmptyString(branchValue),
		url:
			host === "github-com" && parts.length === 3
				? `https://github.com/${owner}/${name}`
				: null,
	};
}

export function parseSourceMeta(meta: SourceSummary["meta"]): ParsedSourceMeta {
	const source = nonEmptyString(meta?.source);
	const connector = source
		? (connectors.find((c) => c.id === source) ?? null)
		: null;
	const repo = parseRepo(meta?.repo, meta?.branch);
	const project = nonEmptyString(meta?.project);
	const session = nonEmptyString(meta?.session_id);
	const date = nonEmptyString(meta?.date);
	const sessionDate =
		date && /^\d{4}-\d{2}-\d{2}/.test(date) && !Number.isNaN(Date.parse(date))
			? date
			: null;

	const consumed = new Set(["error_message"]);
	if (connector) consumed.add("source");
	if (repo) {
		consumed.add("repo");
		consumed.add("branch");
	}
	if (project) consumed.add("project");
	if (session) consumed.add("session_id");
	if (sessionDate) consumed.add("date");

	const extras: [string, string][] = Object.entries(meta ?? {})
		.filter(
			([key, value]) =>
				!consumed.has(key) &&
				value != null &&
				!(typeof value === "string" && !value.trim()),
		)
		.map(([key, value]) => [key, formatMetaValue(value)]);

	return { connector, repo, project, session, sessionDate, extras };
}
