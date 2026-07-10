"use client";

import { Chat, useChat } from "@ai-sdk/react";
import { Button } from "@crosmos/ui/components/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@crosmos/ui/components/select";
import { ShimmeringText } from "@crosmos/ui/components/shimmering-text";
import { Spinner } from "@crosmos/ui/components/spinner";
import { cn } from "@crosmos/ui/lib/utils";
import {
	IconArrowDown,
	IconArrowUp,
	IconMicrophone,
	IconPlus,
	IconRefresh,
} from "@tabler/icons-react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ChatResponse } from "@/components/playground/chat-response";
import { PlaygroundArrow } from "@/components/playground/playground-arrow";
import {
	MemorySaveChip,
	MemorySearchCard,
} from "@/components/playground/tool-cards";
import { ClaudeAI } from "@/components/shared/provider-logos";
import { useSpaces } from "@/hooks/use-spaces";
import {
	DEFAULT_MODEL_ID,
	MAX_INPUT_CHARS,
	MODELS,
	PROVIDER_LABELS,
	PROVIDER_ORDER,
	type ProviderId,
} from "@/lib/ai/models";

const PROVIDER_LOGOS: Record<ProviderId, typeof ClaudeAI> = {
	anthropic: ClaudeAI,
};

// Shared spring so position, height, and the button reflow all morph in unison.
const SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;

const RELEASE_EPS = 1; // px decrease that counts as user intent
const CLAMP_EPS = 1; // decrease landing at dist <= 1 is a shrink-clamp, not intent
const REENGAGE_PX = 40; // return-to-bottom distance that re-engages follow

// The dashboard's scroll container (parent of #main-content) is the scrollbar.
const getScroller = () =>
	document.getElementById("main-content")?.parentElement ?? null;

function formatResetIn(resetMs: number): string {
	const mins = Math.max(0, Math.round((resetMs - Date.now()) / 60000));
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return h > 0
		? `${h} hour${h === 1 ? "" : "s"} ${m} min${m === 1 ? "" : "s"}`
		: `${m} min${m === 1 ? "" : "s"}`;
}

// Module-level Chat instance — lives outside the React tree so messages survive
// client-side navigation. Gone on page refresh (session-only, by design).
const playgroundChat = new Chat({
	transport: new DefaultChatTransport({
		api: "/api/chat",
		// Surface the server's error message (rate limit, too long, etc.) to onError.
		fetch: async (input, init) => {
			const res = await globalThis.fetch(input, init);
			if (!res.ok) {
				const body = (await res
					.clone()
					.json()
					.catch(() => ({}))) as { error?: string; reset?: number };
				const fallbackText =
					body.error === undefined
						? await res
								.clone()
								.text()
								.catch(() => "")
						: "";
				let message = `${res.status} ${res.statusText}: ${
					body.error ?? (fallbackText || "Something went wrong. Try again.")
				}`;
				if (typeof body.reset === "number") {
					message += ` Resets in ${formatResetIn(body.reset)}.`;
				}
				throw new Error(message);
			}
			return res;
		},
	}),
});

export function PlaygroundChat() {
	const [value, setValue] = useState("");
	const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);
	const [selectedSpace, setSelectedSpace] = useState<string | undefined>(
		undefined,
	);
	const [following, setFollowingState] = useState(true);

	const { data: spaces } = useSpaces();
	const {
		messages,
		sendMessage,
		status,
		stop,
		error,
		setMessages,
		regenerate,
	} = useChat({
		chat: playgroundChat,
		// Batch high-frequency streaming updates so rendering stays smooth.
		experimental_throttle: 50,
	});

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	// Whether the view chases the live edge. The ref is the source of truth
	// (read synchronously by the scroll/resize callbacks, so a fast scroll-up
	// can't race a queued React state update); the state only drives UI.
	const followingRef = useRef(true);
	const lastTopRef = useRef(0);
	const setFollowing = useCallback((v: boolean) => {
		followingRef.current = v;
		setFollowingState(v);
	}, []);

	const isActive = messages.length > 0;
	const isBusy = status === "submitted" || status === "streaming";
	const inputWarn = value.length > MAX_INPUT_CHARS * 0.75;
	const inputOver = value.length > MAX_INPUT_CHARS;
	const canSend =
		value.trim().length > 0 && !isBusy && !!selectedSpace && !inputOver;

	const lastMessage = messages[messages.length - 1];
	// Show "Thinking" while busy and either: no assistant message yet, or the
	// assistant message exists but has no text part yet (covers the gap between
	// a tool call completing and the model starting to stream its reply).
	const lastAssistantHasText =
		lastMessage?.role === "assistant" &&
		lastMessage.parts.some((p) => p.type === "text");
	const showThinking = isBusy && !lastAssistantHasText;

	// Default the space selection to the first available space once loaded.
	useEffect(() => {
		const first = spaces?.[0];
		if (!selectedSpace && first) {
			setSelectedSpace(first.id);
		}
	}, [spaces, selectedSpace]);

	// Auto-focus on mount.
	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	// Follow the live edge while the reader is there; release on upward intent;
	// re-engage when they return to the bottom. Pinning runs off a
	// ResizeObserver so every growth source (stream ticks, thinking shimmer,
	// error row, accordion, layout animations) pins pre-paint, not a frame late.
	useEffect(() => {
		if (!isActive) return;
		const scroller = getScroller();
		const content = document.getElementById("main-content");
		if (!scroller || !content) return;

		// Native scroll anchoring adjusts scrollTop in ways that read as user
		// upward scrolls; the pin owns positioning while the thread is mounted.
		scroller.style.overflowAnchor = "none";
		lastTopRef.current = scroller.scrollTop;

		const onScroll = () => {
			const maxTop = scroller.scrollHeight - scroller.clientHeight;
			// Clamp: iOS rubber-banding reports out-of-range values.
			const top = Math.max(0, Math.min(scroller.scrollTop, maxTop));
			const dist = maxTop - top;
			const last = lastTopRef.current;
			lastTopRef.current = top;
			if (top < last - RELEASE_EPS) {
				// A decrease landing at the bottom is the browser clamping after
				// content shrank (e.g. accordion collapse), not user intent.
				if (dist > CLAMP_EPS) setFollowing(false);
			} else if (dist <= REENGAGE_PX) {
				setFollowing(true);
			}
		};

		// A wheel-up can be cancelled by a concurrent pin before it ever moves
		// scrollTop, so it must release directly, not via the scroll listener.
		const onWheel = (e: WheelEvent) => {
			if (e.deltaY < 0 && scroller.scrollHeight > scroller.clientHeight) {
				setFollowing(false);
			}
		};

		const ro = new ResizeObserver(() => {
			if (followingRef.current) scroller.scrollTop = scroller.scrollHeight;
		});
		ro.observe(content); // content growth: stream, shimmer, error, accordion
		ro.observe(scroller); // viewport height: window resize, mobile keyboard

		scroller.addEventListener("scroll", onScroll, { passive: true });
		scroller.addEventListener("wheel", onWheel, { passive: true });
		return () => {
			scroller.removeEventListener("scroll", onScroll);
			scroller.removeEventListener("wheel", onWheel);
			ro.disconnect();
			scroller.style.overflowAnchor = "";
		};
	}, [isActive, setFollowing]);

	const scrollToBottom = () => {
		setFollowing(true);
		const scroller = getScroller();
		if (!scroller) return;
		// Instant while streaming (the next pin supersedes a smooth animation
		// anyway) and under reduced motion (MotionConfig doesn't cover scrollTo).
		const smooth =
			!isBusy && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		scroller.scrollTo({
			top: scroller.scrollHeight,
			behavior: smooth ? "smooth" : "auto",
		});
	};

	const handleSubmit = () => {
		if (!canSend || !selectedSpace) return;
		const text = value;
		setValue("");
		// Sending is explicit intent to move to the live edge, even if scrolled up.
		setFollowing(true);
		const scroller = getScroller();
		if (scroller) scroller.scrollTop = scroller.scrollHeight;
		sendMessage(
			{ text },
			{ body: { model: selectedModel, spaceId: selectedSpace } },
		);
		requestAnimationFrame(() => textareaRef.current?.focus());
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<MotionConfig transition={SPRING} reducedMotion="user">
			<div className="flex min-h-[calc(100svh-6.5rem)] w-full flex-col items-stretch">
				{/* Top area: message thread when active, centering spacer when idle.
				    The thread is in normal flow so the dashboard page scrollbar scrolls
				    it; the composer below sticks to the viewport bottom as it grows. */}
				{isActive ? (
					<div className="w-full flex-1 space-y-5 py-6">
						{messages.map((message) => (
							<MessageBubble key={message.id} message={message} />
						))}
						{showThinking && (
							<ShimmeringText
								text="Thinking"
								className="px-1 text-base"
								startOnView={false}
							/>
						)}
						{error && (
							<div className="flex items-center gap-3 px-1">
								<p className="text-sm text-destructive">
									{error.message || "Something went wrong. Try again."}
								</p>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => regenerate()}
									className="h-7 shrink-0 px-3 text-sm"
								>
									Retry
								</Button>
							</div>
						)}
					</div>
				) : (
					<div className="basis-0 grow-[2]" aria-hidden />
				)}

				<AnimatePresence mode="popLayout">
					{!isActive && (
						<motion.div
							key="greeting"
							layout
							exit={{ opacity: 0, y: -8 }}
							className="relative flex items-center gap-3 self-center pb-10"
						>
							<PlaygroundArrow className="pointer-events-none absolute -top-28 left-full ml-2 hidden opacity-90 lg:block" />
							<Image
								src="/logo.svg"
								width={36}
								height={36}
								alt="Crosmos"
								className="size-9 shrink-0"
								unoptimized
							/>
							<h1 className="text-4xl font-semibold tracking-tight">
								Welcome to your context paradise
							</h1>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Composer — morphs from centered (idle) to bottom-pinned (active). */}
				<motion.div
					layout
					className={cn(
						"w-full shrink-0",
						// Active: pinned to the viewport bottom. `bottom-6` matches the
						// dashboard #main-content's p-6, so the resting and stuck positions
						// are identical (no jump on scroll). The 4rem-wider active box
						// compensates for the + button so the textarea's left edge doesn't
						// shift during the morph.
						isActive
							? "sticky bottom-6 bg-background"
							: "self-center max-w-[44rem]",
					)}
				>
					{/* Top fade so the scrolling thread dissolves into the composer. */}
					{isActive && (
						<div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-background to-transparent" />
					)}

					{/* Bottom cover: masks the thread bleeding through the gap below the
					    composer while scrolled up. Only rendered when scrolled away from the
					    bottom — otherwise this absolute strip extends past the content and
					    creates a spurious page scrollbar on short chats. */}
					{isActive && !following && (
						<div className="pointer-events-none absolute inset-x-0 top-full h-8 bg-background" />
					)}

					{/* Scroll-to-bottom button — only when the user has scrolled up. */}
					{isActive && !following && (
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={scrollToBottom}
							className="-top-12 -translate-x-1/2 absolute left-1/2 size-9 rounded-full border-border bg-card shadow-md"
							aria-label="Scroll to bottom"
						>
							<IconArrowDown />
						</Button>
					)}

					<div className="flex flex-col gap-1.5 rounded-4xl border border-border bg-card p-2">
						{/* Input box — reflows from textarea-over-buttons to a single inline row. */}
						<motion.div
							layout
							className="flex flex-wrap items-center gap-1 rounded-sm border border-border/60 bg-background/60 p-1.5"
						>
							{/* + (left) */}
							<motion.div
								layout
								className={cn("shrink-0", isActive ? "order-1" : "order-2")}
							>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									disabled
									className="text-muted-foreground"
									aria-label="Add attachment"
								>
									<IconPlus />
								</Button>
							</motion.div>

							{/* Textarea */}
							<motion.div
								layout="position"
								className={cn(
									"flex min-w-0 items-center",
									isActive ? "order-2 -ml-1 flex-1" : "order-1 w-full",
								)}
							>
								<textarea
									ref={textareaRef}
									value={value}
									onChange={(e) => setValue(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Ask anything..."
									rows={isActive ? 1 : 4}
									className={cn(
										"field-sizing-content w-full resize-none bg-transparent px-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground/60",
										isActive
											? "max-h-40 min-h-0 py-1.5"
											: "max-h-48 min-h-24 pt-2",
									)}
								/>
							</motion.div>

							{/* Spacer pushes mic/send to the right in the idle (stacked) layout. */}
							{!isActive && <div className="order-3 flex-1" aria-hidden />}

							{/* Mic (right) */}
							<motion.div
								layout
								className={cn("shrink-0", isActive ? "order-3" : "order-4")}
							>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									disabled
									className="text-muted-foreground"
									aria-label="Voice input"
								>
									<IconMicrophone />
								</Button>
							</motion.div>

							{/* Send (right) */}
							<motion.div
								layout
								className={cn("shrink-0", isActive ? "order-4" : "order-5")}
							>
								<Button
									type="button"
									size="icon"
									onClick={isBusy ? () => stop() : handleSubmit}
									disabled={!isBusy && !canSend}
									className="rounded-full bg-foreground text-background hover:bg-foreground/85 disabled:opacity-40"
									aria-label={isBusy ? "Stop generating" : "Send message"}
								>
									{isBusy ? (
										<Spinner className="size-4 text-background" />
									) : (
										<IconArrowUp />
									)}
								</Button>
							</motion.div>
						</motion.div>

						{/* Model + space selectors — stays under the input box. */}
						<div className="flex items-center gap-2 px-1 py-0.5">
							<Select value={selectedModel} onValueChange={setSelectedModel}>
								<SelectTrigger
									size="sm"
									className="h-7 rounded-full border-transparent bg-transparent px-3 text-sm hover:bg-muted/60 focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-muted/60"
									aria-label="Select model"
								>
									<SelectValue placeholder="Select model" />
								</SelectTrigger>
								<SelectContent>
									{PROVIDER_ORDER.map((provider) => {
										const providerModels = MODELS.filter(
											(m) => m.provider === provider,
										);
										if (providerModels.length === 0) return null;
										const ProviderLogo = PROVIDER_LOGOS[provider];
										return (
											<SelectGroup key={provider}>
												<SelectLabel>{PROVIDER_LABELS[provider]}</SelectLabel>
												{providerModels.map((model) => (
													<SelectItem key={model.id} value={model.id}>
														<ProviderLogo className="size-4 shrink-0" />
														{model.label}
													</SelectItem>
												))}
											</SelectGroup>
										);
									})}
								</SelectContent>
							</Select>

							<Select
								value={selectedSpace}
								onValueChange={(v) => {
									setSelectedSpace(v);
									setMessages([]);
								}}
								disabled={!spaces || spaces.length === 0}
							>
								<SelectTrigger
									size="sm"
									className="h-7 rounded-full border-transparent bg-transparent px-3 text-sm hover:bg-muted/60 focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-muted/60"
									aria-label="Select space"
								>
									<SelectValue
										placeholder={
											spaces && spaces.length === 0
												? "No spaces"
												: "Select space"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{(spaces ?? []).map((space) => (
										<SelectItem key={space.id} value={space.id}>
											{space.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<div className="ml-auto flex items-center gap-2">
								{isActive && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => {
											setMessages([]);
											requestAnimationFrame(() => textareaRef.current?.focus());
										}}
										className="h-7 border-transparent bg-transparent px-3 text-sm text-muted-foreground hover:bg-muted/60 dark:bg-transparent dark:hover:bg-muted/60"
									>
										<IconRefresh className="size-3.5" />
										Reset
									</Button>
								)}
								{inputWarn && (
									<span
										className={cn(
											"shrink-0 px-1 text-xs tabular-nums",
											inputOver ? "text-destructive" : "text-amber-500",
										)}
									>
										{value.length.toLocaleString()}
									</span>
								)}
							</div>
						</div>
					</div>
				</motion.div>

				{!isActive && <div className="grow-[3] basis-0" aria-hidden />}
			</div>
		</MotionConfig>
	);
}

type ChatMessage = ReturnType<typeof useChat>["messages"][number];

/**
 * Renders a turn: user text as a capped right-aligned bubble, assistant text as
 * full-column streaming Markdown (ChatResponse/Streamdown), plus memory/search
 * tool activity chips. Per-message copy/regenerate are a later UI phase.
 *
 * Memoized: settled messages keep reference identity across stream ticks
 * (the AI SDK clones only the streaming message), so only the last bubble
 * re-renders while streaming.
 */
const MessageBubble = memo(function MessageBubble({
	message,
}: {
	message: ChatMessage;
}) {
	const isUser = message.role === "user";
	return (
		<div className={cn("flex flex-col gap-1.5", isUser && "items-end")}>
			{message.parts.map((part, i) => {
				if (part.type === "text") {
					if (isUser) {
						return (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: parts are stable within a streamed message
								key={i}
								className="max-w-[80%] [overflow-wrap:anywhere] whitespace-pre-wrap rounded-2xl bg-muted px-3.5 py-2 text-base text-foreground"
							>
								{part.text}
							</div>
						);
					}
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: parts are stable within a streamed message
						<div key={i} className="w-full text-foreground">
							<ChatResponse text={part.text} />
						</div>
					);
				}
				if (part.type === "tool-search_memory") {
					// biome-ignore lint/suspicious/noArrayIndexKey: parts are stable within a streamed message
					return <MemorySearchCard key={i} part={part} />;
				}
				if (part.type === "tool-save_memory") {
					// biome-ignore lint/suspicious/noArrayIndexKey: parts are stable within a streamed message
					return <MemorySaveChip key={i} part={part} />;
				}
				return null;
			})}
		</div>
	);
});
