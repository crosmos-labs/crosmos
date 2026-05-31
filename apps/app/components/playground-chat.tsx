"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
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
import { cn } from "@crosmos/ui/lib/utils";
import { IconArrowUp, IconMicrophone, IconPlus } from "@tabler/icons-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PlaygroundArrow } from "@/components/playground-arrow";
import { ClaudeAI, Gemini, OpenAI } from "@/components/provider-logos";

interface MockModel {
	id: string;
	label: string;
	provider: "anthropic" | "openai" | "google";
}

const MOCK_MODELS: MockModel[] = [
	{ id: "claude-opus-4-8", label: "Claude Opus 4.8", provider: "anthropic" },
	{
		id: "claude-sonnet-4-6",
		label: "Claude Sonnet 4.6",
		provider: "anthropic",
	},
	{ id: "claude-haiku-4-5", label: "Claude Haiku 4.5", provider: "anthropic" },
	{ id: "gpt-4o", label: "GPT-4o", provider: "openai" },
	{ id: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "openai" },
	{ id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "openai" },
	{ id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "google" },
	{ id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "google" },
	{ id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "google" },
];

const PROVIDER_LABELS: Record<MockModel["provider"], string> = {
	anthropic: "Anthropic",
	openai: "OpenAI",
	google: "Google",
};

const PROVIDER_LOGOS: Record<MockModel["provider"], typeof ClaudeAI> = {
	anthropic: ClaudeAI,
	openai: OpenAI,
	google: Gemini,
};

const MOCK_SPACES = [
	{ id: "sp-1", name: "coolspace" },
	{ id: "sp-2", name: "work-notes" },
	{ id: "sp-3", name: "research" },
];

// Shared spring so position, height, and the button reflow all morph in unison.
const SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;

type Phase = "idle" | "active";

export function PlaygroundChat() {
	const [phase, setPhase] = useState<Phase>("idle");
	const [value, setValue] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [selectedModel, setSelectedModel] = useState(MOCK_MODELS[0]?.id);
	const [selectedSpace, setSelectedSpace] = useState(MOCK_SPACES[0]?.id);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const sendingTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

	const isActive = phase === "active";
	const canSend = value.trim().length > 0 && !isSending;

	// Auto-focus on mount; clean up the sending timer on unmount.
	useEffect(() => {
		textareaRef.current?.focus();
		return () => {
			if (sendingTimeout.current) clearTimeout(sendingTimeout.current);
		};
	}, []);

	const handleSubmit = () => {
		if (!canSend) return;
		setPhase("active");
		setValue("");
		setIsSending(true);
		if (sendingTimeout.current) clearTimeout(sendingTimeout.current);
		sendingTimeout.current = setTimeout(() => setIsSending(false), 900);
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
			<div className="flex min-h-[calc(100svh-6.5rem)] w-full flex-col items-center">
				{/* Top flexible area: optical-centered when idle, fills to push the composer down when active. */}
				<div
					className={cn("basis-0", isActive ? "grow" : "grow-[2]")}
					aria-hidden
				/>

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

				{/* Composer — morphs from centered to bottom-pinned. The + button sits
				    flush against the textarea in the active state (gap removed via -ml-1),
				    so its slot is just size-8 = 32px. Widening the centered composer by
				    2 × 32 = 64px shifts its left edge out by exactly 32px — keeping the
				    textarea's left edge fixed (no x-axis movement). */}
				<motion.div
					layout
					className={cn(
						"w-full shrink-0",
						isActive ? "max-w-[46rem]" : "max-w-2xl",
					)}
				>
					<div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-1.5">
						{/* Input box — reflows from textarea-over-buttons to a single inline row. */}
						<motion.div
							layout
							className="flex flex-wrap items-center gap-1 rounded-2xl border border-border/60 bg-background/60 p-1.5"
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
										"field-sizing-content w-full resize-none bg-transparent px-2.5 text-lg text-foreground outline-none placeholder:text-muted-foreground/60",
										isActive
											? "max-h-40 min-h-0 py-1.5"
											: "max-h-72 min-h-28 pt-2",
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
									onClick={handleSubmit}
									disabled={!canSend}
									className="rounded-full bg-foreground text-background hover:bg-foreground/85 disabled:opacity-40"
									aria-label="Send message"
								>
									{isSending ? (
										<AnimatedSpinner
											name="pulse"
											size="1.1em"
											color="var(--background)"
										/>
									) : (
										<IconArrowUp />
									)}
								</Button>
							</motion.div>
						</motion.div>

						{/* Model + space selectors — unchanged, stays under the input box. */}
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
									{(["anthropic", "openai", "google"] as const).map(
										(provider) => {
											const ProviderLogo = PROVIDER_LOGOS[provider];
											return (
												<SelectGroup key={provider}>
													<SelectLabel>{PROVIDER_LABELS[provider]}</SelectLabel>
													{MOCK_MODELS.filter(
														(m) => m.provider === provider,
													).map((model) => (
														<SelectItem key={model.id} value={model.id}>
															<ProviderLogo className="size-4 shrink-0" />
															{model.label}
														</SelectItem>
													))}
												</SelectGroup>
											);
										},
									)}
								</SelectContent>
							</Select>

							<Select value={selectedSpace} onValueChange={setSelectedSpace}>
								<SelectTrigger
									size="sm"
									className="h-7 rounded-full border-transparent bg-transparent px-3 text-sm hover:bg-muted/60 focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-muted/60"
									aria-label="Select space"
								>
									<SelectValue placeholder="Select space" />
								</SelectTrigger>
								<SelectContent>
									{MOCK_SPACES.map((space) => (
										<SelectItem key={space.id} value={space.id}>
											{space.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</motion.div>

				{!isActive && <div className="grow-[3] basis-0" aria-hidden />}
			</div>
		</MotionConfig>
	);
}
