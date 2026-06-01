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

	const system =
		`You are Crosmos, a memory-augmented assistant for the user's space "${space.name}". ` +
		"When a question may depend on the user's stored context, preferences, or prior facts, " +
		"call the search_memory tool FIRST to ground your answer, then synthesize a concise reply " +
		"citing what you found. If search returns nothing relevant, say so briefly and answer from " +
		"general knowledge. Call save_memory ONLY when the user states a durable fact or preference " +
		"worth remembering, passing a single concise statement in the user's voice — never save " +
		"questions, small talk, or your own advice/explanations. Keep answers concise.";

	const result = streamText({
		model: resolveModel(model),
		system,
		messages: await convertToModelMessages(messages),
		stopWhen: stepCountIs(5),
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
					try {
						const candidates = await searchMemory({ query, spaceId, limit });
						return {
							count: candidates.length,
							results: candidates.map((c) => ({
								content: c.content.slice(0, MAX_CONTENT_CHARS),
								type: c.memory_type,
								score: Number(c.score.toFixed(3)),
							})),
						};
					} catch (err) {
						if (err instanceof CrosmosRetryableError) {
							return {
								error: "Memory search is temporarily unavailable.",
								retryable: true,
							};
						}
						return { error: "Memory search failed.", retryable: false };
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
					try {
						const { jobId } = await saveMemory({ content, spaceId });
						return { status: "queued" as const, jobId };
					} catch {
						return { error: "Failed to save to memory." };
					}
				},
			}),
		},
	});

	return result.toUIMessageStreamResponse();
}
