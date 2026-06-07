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
import { isValidModelId, MAX_INPUT_CHARS } from "@/lib/ai/models";
import { PLAYGROUND_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { checkPlaygroundLimit, DAILY_MESSAGE_LIMIT } from "@/lib/ai/rate-limit";
import { resolveModel } from "@/lib/ai/resolve-model";
import { verifyAuth } from "@/lib/auth/session";

// Search can block up to 30s on the Crosmos worker before the model generates.
export const maxDuration = 60;

interface ChatRequestBody {
	messages: UIMessage[];
	model: string;
	spaceId: string;
}

const MAX_CONTENT_CHARS = 600;
const MAX_OUTPUT_TOKENS = 1024;

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

	// verifyAuth() yields a server-verified user_id for the rate-limit key;
	// listSpaces() scopes the space. Both read the httpOnly cookie token.
	let user: Awaited<ReturnType<typeof verifyAuth>>;
	let space: { id: string; name: string } | undefined;
	try {
		const authedUser = await verifyAuth();
		user = authedUser;
	} catch {
		return new Response("Unauthorized", { status: 401 });
	}
	if (!user) {
		return new Response("Unauthorized", { status: 401 });
	}
	try {
		const spaces = await listSpaces();
		space = spaces.find((s) => s.id === spaceId);
	} catch {
		return new Response("Unable to load spaces", { status: 500 });
	}
	if (!space) {
		return new Response("Unable to load space", { status: 500 });
	}

	// Text-only playground: reject file/image parts whose token cost is decoupled
	// from the char cap below (a short URL can pull in a huge image or PDF).
	if (messages.some((m) => m.parts?.some((p) => p.type === "file"))) {
		return new Response("Unsupported message content", { status: 400 });
	}

	// Reject an over-length user message before consuming a daily credit.
	const lastUser = messages.filter((m) => m.role === "user").at(-1);
	const userChars =
		lastUser?.parts?.reduce(
			(n, p) => n + (p.type === "text" ? p.text.length : 0),
			0,
		) ?? 0;
	if (userChars > MAX_INPUT_CHARS) {
		return Response.json(
			{ error: "Message is too long. Please shorten it." },
			{ status: 413 },
		);
	}

	// Fail closed: any Redis error means we do not call the model.
	let limit: Awaited<ReturnType<typeof checkPlaygroundLimit>>;
	try {
		limit = await checkPlaygroundLimit(user.user_id);
	} catch {
		return Response.json(
			{ error: "Service temporarily unavailable. Please try again shortly." },
			{ status: 503 },
		);
	}
	if (!limit.success) {
		return Response.json(
			{
				error: `Daily message limit reached of ${DAILY_MESSAGE_LIMIT}/day.`,
				reset: limit.reset,
			},
			{ status: 429 },
		);
	}

	const system = PLAYGROUND_SYSTEM_PROMPT;

	const result = streamText({
		model: resolveModel(model),
		system,
		messages: await convertToModelMessages(messages),
		maxOutputTokens: MAX_OUTPUT_TOKENS,
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
					try {
						const { candidates } = await searchMemory({
							query,
							spaceId,
							limit,
						});
						return {
							count: candidates.length,
							results: candidates.map((c) => ({
								id: c.memory_id,
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
						return {
							error: "Memory search failed.",
							retryable: false,
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
					try {
						const { jobId } = await saveMemory({ content, spaceId });
						return {
							status: "queued" as const,
							jobId,
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
						};
					}
				},
			}),
		},
	});

	return result.toUIMessageStreamResponse();
}
