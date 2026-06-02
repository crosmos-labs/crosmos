import {
	convertToModelMessages,
	smoothStream,
	stepCountIs,
	streamText,
	tool,
	type UIMessage,
} from "ai";
import { z } from "zod";
import { listSpaces } from "@/actions/spaces";
import {
	CrosmosRetryableError,
	saveMemory,
	searchMemory,
} from "@/lib/ai/crosmos";
import { isValidModelId } from "@/lib/ai/models";
import { PLAYGROUND_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { resolveModel } from "@/lib/ai/resolve-model";

// Search can block up to 30s on the Crosmos worker before the model generates.
export const maxDuration = 60;

interface ChatRequestBody {
	messages: UIMessage[];
	model: string;
	spaceId: string;
}

const MAX_CONTENT_CHARS = 600;

export async function POST(req: Request) {
	if (process.env.PLAYGROUND_DISABLED === "true") {
		return new Response("Not Found", { status: 404 });
	}

	let body: ChatRequestBody;
	try {
		body = (await req.json()) as ChatRequestBody;
	} catch {
		return new Response("Bad request", { status: 400 });
	}

	const { messages, model, spaceId } = body;
	if (
		!Array.isArray(messages) ||
		typeof model !== "string" ||
		typeof spaceId !== "string"
	) {
		return new Response("Bad request", { status: 400 });
	}
	if (!isValidModelId(model)) {
		return new Response("Unknown model", { status: 400 });
	}

	// Bind the space to the authenticated user's own spaces. listSpaces() uses
	// the httpOnly cookie token; a failure means the request is unauthenticated.
	let space: { id: string; name: string } | undefined;
	try {
		const spaces = await listSpaces();
		space = spaces.find((s) => s.id === spaceId);
	} catch {
		return new Response("Unauthorized", { status: 401 });
	}
	if (!space) {
		return new Response("Invalid space", { status: 403 });
	}

	const system = PLAYGROUND_SYSTEM_PROMPT;

	const result = streamText({
		model: resolveModel(model),
		system,
		messages: await convertToModelMessages(messages),
		stopWhen: stepCountIs(3),
		// Smooth the token cadence into steady word-by-word output (typing feel).
		experimental_transform: smoothStream({ delayInMs: 15, chunking: "word" }),
		tools: {
			search_memory: tool({
				description:
					"Search the user's Crosmos memory for relevant facts, notes, and prior context. " +
					"Use this to ground answers before responding.",
				inputSchema: z.object({
					query: z.string().describe("Natural-language search query"),
					limit: z
						.number()
						.int()
						.min(1)
						.max(50)
						.optional()
						.describe("Max results to return (default 6)"),
				}),
				// spaceId is captured here — the model cannot target another space.
				execute: async ({ query, limit }) => {
					const startedAt = performance.now();
					try {
						const { candidates, tookMs } = await searchMemory({
							query,
							spaceId,
							limit,
						});
						return {
							count: candidates.length,
							tookMs: Math.round(tookMs),
							results: candidates.map((c) => ({
								id: c.memory_id,
								content: c.content.slice(0, MAX_CONTENT_CHARS),
								type: c.memory_type,
								score: Number(c.score.toFixed(3)),
							})),
						};
					} catch (err) {
						const totalMs = Math.round(performance.now() - startedAt);
						if (err instanceof CrosmosRetryableError) {
							return {
								error: "Memory search is temporarily unavailable.",
								retryable: true,
								tookMs: totalMs,
							};
						}
						return {
							error: "Memory search failed.",
							retryable: false,
							tookMs: totalMs,
						};
					}
				},
			}),
			save_memory: tool({
				description:
					"Persist a durable fact or preference the user has stated into their memory. " +
					"Only call this for information worth remembering across conversations.",
				inputSchema: z.object({
					content: z
						.string()
						.min(4)
						.describe("A concise statement of the fact to remember"),
				}),
				// spaceId captured — model cannot ingest into another space.
				execute: async ({ content }) => {
					const startedAt = performance.now();
					try {
						const { jobId, tookMs } = await saveMemory({ content, spaceId });
						return {
							status: "queued" as const,
							jobId,
							tookMs: Math.round(tookMs),
						};
					} catch (err) {
						const isTimeout =
							err instanceof DOMException && err.name === "TimeoutError";
						const isRetryable =
							isTimeout || err instanceof CrosmosRetryableError;
						return {
							error: isTimeout
								? "Save timed out."
								: "Failed to save to memory.",
							retryable: isRetryable,
							tookMs: Math.round(performance.now() - startedAt),
						};
					}
				},
			}),
		},
	});

	return result.toUIMessageStreamResponse();
}
