"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crosmos/ui/components/alert";
import { Avatar, AvatarFallback } from "@crosmos/ui/components/avatar";
import { Button } from "@crosmos/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crosmos/ui/components/dialog";
import { Kbd } from "@crosmos/ui/components/kbd";
import { ScrollArea } from "@crosmos/ui/components/scroll-area";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { cn } from "@crosmos/ui/lib/utils";
import {
	IconAlertTriangle,
	IconChevronRight,
	IconCornerDownLeft,
	IconPlus,
	IconRefresh,
	IconShieldCheck,
	IconUsersGroup,
	IconX,
} from "@tabler/icons-react";
import { motion, type PanInfo, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { createGrant } from "@/actions/visibility";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import {
	useGrantImpactPreview,
	visibilityGrantsKey,
} from "@/hooks/use-visibility";
import { avatarColor, getInitials } from "@/lib/members";
import { optimisticInsert } from "@/lib/optimistic";
import type { VisibilityGrant, VisibilityGroup } from "@/lib/types/visibility";

type SlotKey = "viewer" | "subject";

export function AddRuleDialog({
	orgId,
	groups,
	grants,
	rulesEnabled,
	open,
	onOpenChange,
	disabled = false,
}: {
	orgId: string;
	groups: VisibilityGroup[];
	grants: VisibilityGrant[];
	rulesEnabled: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	disabled?: boolean;
}) {
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();
	const reduceMotion = useReducedMotion();
	const [viewerId, setViewerId] = useState("");
	const [subjectId, setSubjectId] = useState("");
	const [hoverSlot, setHoverSlot] = useState<SlotKey | null>(null);
	const [shakeSlot, setShakeSlot] = useState<SlotKey | null>(null);
	// Bumped per chip on a successful drop so the chip remounts instantly at its
	// origin instead of animating back via dragSnapToOrigin.
	const [nonces, setNonces] = useState<Record<string, number>>({});
	// While a chip is being dragged we unclip the (scrollable) palette so the
	// chip can travel to the slots, compensating for the current scroll offset
	// so the rest of the list doesn't jump.
	const [paletteDragging, setPaletteDragging] = useState(false);
	const [scrollComp, setScrollComp] = useState(0);
	const actionBusy = activeCount > 0;

	const viewerSlotRef = useRef<HTMLDivElement>(null);
	const subjectSlotRef = useRef<HTMLDivElement>(null);
	const paletteRef = useRef<HTMLDivElement>(null);

	const alreadyGranted = useMemo(() => {
		const set = new Set<string>();
		for (const g of grants)
			set.add(`${g.viewer_group_id}:${g.subject_group_id}`);
		return set;
	}, [grants]);

	// Block self / duplicate / direct inverse up front; transitive cycles are
	// left to the server.
	type PairStatus = "ok" | "self" | "duplicate" | "inverse";
	function pairState(viewer: string, subject: string): PairStatus {
		if (!viewer || !subject) return "ok";
		if (viewer === subject) return "self";
		if (alreadyGranted.has(`${viewer}:${subject}`)) return "duplicate";
		if (alreadyGranted.has(`${subject}:${viewer}`)) return "inverse";
		return "ok";
	}

	const pairStatus = pairState(viewerId, subjectId);
	const pairInvalid = !!viewerId && !!subjectId && pairStatus !== "ok";

	const {
		data: impact,
		isLoading: impactLoading,
		error: impactError,
		mutate: retryImpact,
	} = useGrantImpactPreview(
		open && !pairInvalid ? orgId : null,
		open && !pairInvalid ? viewerId : null,
		open && !pairInvalid ? subjectId : null,
	);

	const groupById = useMemo(() => {
		const map = new Map<string, VisibilityGroup>();
		for (const g of groups) map.set(g.id, g);
		return map;
	}, [groups]);

	function isAllowed(slot: SlotKey, groupId: string): boolean {
		if (slot === "viewer") {
			if (!subjectId) return true;
			return pairState(groupId, subjectId) === "ok";
		}
		if (!viewerId) return true;
		return pairState(viewerId, groupId) === "ok";
	}

	function isChipBlocked(groupId: string): boolean {
		if (groupId === viewerId || groupId === subjectId) return true;
		const openSlots: SlotKey[] = [];
		if (!viewerId) openSlots.push("viewer");
		if (!subjectId) openSlots.push("subject");
		if (openSlots.length === 0) return true;
		return !openSlots.some((slot) => isAllowed(slot, groupId));
	}

	function assign(slot: SlotKey, groupId: string) {
		if (slot === "viewer") {
			setViewerId(groupId);
			if (subjectId === groupId) setSubjectId("");
		} else {
			setSubjectId(groupId);
			if (viewerId === groupId) setViewerId("");
		}
	}

	function rejectDrop(slot: SlotKey) {
		setShakeSlot(slot);
		setTimeout(() => setShakeSlot(null), 350);
	}

	function slotAtPoint(x: number, y: number): SlotKey | null {
		const refs: [SlotKey, HTMLDivElement | null][] = [
			["viewer", viewerSlotRef.current],
			["subject", subjectSlotRef.current],
		];
		for (const [slot, el] of refs) {
			if (!el) continue;
			const r = el.getBoundingClientRect();
			if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
				return slot;
			}
		}
		return null;
	}

	function handleChipDragStart() {
		setScrollComp(paletteRef.current?.scrollTop ?? 0);
		setPaletteDragging(true);
	}

	function handleDrag(_e: unknown, info: PanInfo) {
		setHoverSlot(slotAtPoint(info.point.x, info.point.y));
	}

	function handleDragEnd(groupId: string, info: PanInfo) {
		const slot = slotAtPoint(info.point.x, info.point.y);
		setHoverSlot(null);
		setPaletteDragging(false);
		setScrollComp(0);
		if (!slot) return;
		if (!isAllowed(slot, groupId)) {
			rejectDrop(slot);
			return;
		}
		assign(slot, groupId);
		setNonces((n) => ({ ...n, [groupId]: (n[groupId] ?? 0) + 1 }));
	}

	// Click-to-place fallback for the keyboard / no-drag path.
	function placeNext(groupId: string) {
		if (!viewerId && isAllowed("viewer", groupId)) {
			assign("viewer", groupId);
			return;
		}
		if (!subjectId && isAllowed("subject", groupId)) {
			assign("subject", groupId);
			return;
		}
		if (!viewerId) {
			assign("viewer", groupId);
			return;
		}
		if (!subjectId) assign("subject", groupId);
	}

	function swap() {
		setViewerId(subjectId);
		setSubjectId(viewerId);
	}

	function reset() {
		setViewerId("");
		setSubjectId("");
		setHoverSlot(null);
		setShakeSlot(null);
	}

	function handleClose() {
		reset();
		onOpenChange(false);
	}

	function handleCreate() {
		if (
			!viewerId ||
			!subjectId ||
			disabled ||
			actionBusy ||
			pairInvalid ||
			impactLoading ||
			impactError ||
			!impact
		) {
			return;
		}
		const viewerGroup = groupById.get(viewerId);
		const subjectGroup = groupById.get(subjectId);
		if (!viewerGroup || !subjectGroup) return;
		const now = new Date().toISOString();
		const tempGrant: VisibilityGrant = {
			id: `optimistic-${Date.now()}`,
			viewer_group_id: viewerId,
			viewer_group_slug: viewerGroup.slug,
			subject_group_id: subjectId,
			subject_group_slug: subjectGroup.slug,
			created_at: now,
		};
		const nextViewerId = viewerId;
		const nextSubjectId = subjectId;
		reset();
		onOpenChange(false);
		runAction(
			() =>
				optimisticInsert(
					mutate,
					visibilityGrantsKey(orgId),
					tempGrant,
					async () => {
						const result = await createGrant(
							orgId,
							nextViewerId,
							nextSubjectId,
						);
						if (!result.ok) {
							throw Object.assign(new Error(result.message), {
								code: result.code,
							});
						}
						return result.data;
					},
				),
			{ toast: { success: "Rule added" } },
		).catch((err: unknown) => {
			const code =
				err && typeof err === "object" && "code" in err
					? (err as { code: unknown }).code
					: null;
			if (code === "grant_cycle") {
				toast.error("That would create a circular access rule.");
			} else if (code === "duplicate_grant") {
				toast.error("That rule already exists.");
			} else if (code === "self_grant") {
				toast.error("A group already sees its own members.");
			} else {
				toast.error(err instanceof Error ? err.message : "Couldn't add rule");
			}
		});
	}

	const impactErrorCode =
		impactError && typeof impactError === "object" && "code" in impactError
			? (impactError as { code?: unknown }).code
			: null;
	// Transitive cycles surface from the preview call, not the pair check.
	const impactCycle = impactErrorCode === "grant_cycle";

	const bothFilled = !!viewerId && !!subjectId;
	const impactReady = bothFilled && !pairInvalid;
	const canCreate =
		impactReady &&
		!disabled &&
		!actionBusy &&
		!impactLoading &&
		!impactError &&
		!!impact;
	const viewerGroup = groupById.get(viewerId);
	const subjectGroup = groupById.get(subjectId);
	const viewerName = viewerGroup?.name ?? viewerGroup?.slug ?? "This group";
	const subjectName =
		subjectGroup?.name ?? subjectGroup?.slug ?? "the selected group";

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Grant access</DialogTitle>
					<DialogDescription>
						Drag a group into each slot to let one group read another group's
						private memories.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-5 md:grid-cols-[minmax(0,12rem)_1fr]">
					<div className="flex flex-col gap-2">
						<p className="text-xs font-medium text-muted-foreground">Groups</p>
						<div
							ref={paletteRef}
							className={cn(
								"max-h-64 md:max-h-80",
								paletteDragging ? "overflow-visible" : "overflow-y-auto",
							)}
						>
							<div
								className="flex flex-wrap gap-2 pr-1 md:flex-col"
								style={
									paletteDragging
										? { transform: `translateY(${-scrollComp}px)` }
										: undefined
								}
							>
								{groups.map((g) => {
									const blocked = isChipBlocked(g.id);
									return (
										<motion.div
											key={`${g.id}-${nonces[g.id] ?? 0}`}
											drag={!blocked && !disabled && !actionBusy}
											dragSnapToOrigin
											dragElastic={0.2}
											whileDrag={
												reduceMotion
													? undefined
													: { scale: 1.05, zIndex: 50, cursor: "grabbing" }
											}
											onDragStart={handleChipDragStart}
											onDrag={handleDrag}
											onDragEnd={(_e, info) => handleDragEnd(g.id, info)}
											className={cn(
												"group flex touch-none items-center justify-between gap-2 rounded-md border bg-card px-2.5 py-1.5 text-sm",
												blocked
													? "cursor-not-allowed opacity-40"
													: "cursor-grab active:cursor-grabbing",
											)}
										>
											<span className="flex min-w-0 items-center gap-1.5">
												<IconUsersGroup className="size-3.5 shrink-0 text-muted-foreground" />
												<span className="truncate">{g.name}</span>
											</span>
											<button
												type="button"
												aria-label={`Place ${g.name}`}
												disabled={blocked || disabled || actionBusy}
												onPointerDown={(e) => e.stopPropagation()}
												onClick={() => placeNext(g.id)}
												className="inline-flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none"
											>
												<IconPlus className="size-3.5" />
											</button>
										</motion.div>
									);
								})}
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
							<DropSlot
								ref={viewerSlotRef}
								label="Viewer"
								placeholder="Drop a group"
								group={viewerGroup}
								hovered={hoverSlot === "viewer"}
								shake={shakeSlot === "viewer"}
								onClear={() => setViewerId("")}
								disabled={disabled || actionBusy}
							/>
							<div className="flex flex-col items-center gap-1">
								<span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
									can read
								</span>
								{(() => {
									const active = bothFilled && !pairInvalid;
									return (
										<div className="flex items-center">
											<div
												className={cn(
													"h-px w-10 transition-colors",
													active ? "bg-primary" : "bg-border",
												)}
											/>
											<IconChevronRight
												className={cn(
													"-ml-1.5 size-3.5 transition-colors",
													active ? "text-primary" : "text-border",
												)}
											/>
										</div>
									);
								})()}
								<button
									type="button"
									aria-label="Swap viewer and subject"
									disabled={!bothFilled || disabled || actionBusy}
									onClick={swap}
									className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
								>
									<IconRefresh className="size-3" />
									Swap
								</button>
							</div>
							<DropSlot
								ref={subjectSlotRef}
								label="Subject"
								placeholder="Drop a group"
								group={subjectGroup}
								hovered={hoverSlot === "subject"}
								shake={shakeSlot === "subject"}
								onClear={() => setSubjectId("")}
								disabled={disabled || actionBusy}
							/>
						</div>

						<div className="flex min-w-0 flex-col gap-3">
							{pairInvalid ? (
								<Alert variant="destructive">
									<IconAlertTriangle />
									<AlertTitle>Can't add this rule</AlertTitle>
									<AlertDescription>
										{pairStatus === "self"
											? "A group can't read its own members."
											: pairStatus === "duplicate"
												? "That rule already exists."
												: `${subjectName} can already read ${viewerName}, so the reverse would create a cycle.`}
									</AlertDescription>
								</Alert>
							) : !impactReady ? (
								<Alert>
									<IconShieldCheck />
									<AlertTitle>Preview access impact</AlertTitle>
									<AlertDescription>
										Fill both slots to see whose private memories this rule
										affects.
									</AlertDescription>
								</Alert>
							) : impactLoading ? (
								<div className="flex flex-col gap-2">
									<Skeleton className="h-4 w-44" />
									<div className="flex flex-col gap-3 rounded-md border p-2">
										{["a", "b", "c"].map((k) => (
											<div
												key={k}
												className="flex items-center gap-3 px-2 py-1"
											>
												<Skeleton className="size-7 shrink-0 rounded-full" />
												<div className="flex flex-col gap-1.5">
													<Skeleton className="h-3.5 w-32" />
													<Skeleton className="h-3 w-44" />
												</div>
											</div>
										))}
									</div>
								</div>
							) : impactCycle ? (
								<Alert variant="destructive">
									<IconAlertTriangle />
									<AlertTitle>Can't add this rule</AlertTitle>
									<AlertDescription>
										This would create a circular access rule — {viewerName} can
										already be reached from {subjectName} through existing
										grants.
									</AlertDescription>
								</Alert>
							) : impactError ? (
								<Alert variant="destructive">
									<IconAlertTriangle />
									<AlertTitle>Impact preview failed</AlertTitle>
									<AlertDescription>
										Refresh the preview before adding this rule.
									</AlertDescription>
									<AlertAction>
										<Button
											size="sm"
											variant="outline"
											onClick={() => retryImpact()}
											disabled={actionBusy}
										>
											<IconRefresh data-icon="inline-start" />
											Retry
										</Button>
									</AlertAction>
								</Alert>
							) : impact ? (
								<Alert>
									<IconShieldCheck />
									<AlertTitle>Affected members</AlertTitle>
									<AlertDescription>
										{viewerName} can read private memories owned by{" "}
										{subjectName}.
										{impact.newly_visible.length === 0
											? " No current memory owners are added by this rule. Future group changes can affect access."
											: null}
									</AlertDescription>
								</Alert>
							) : null}

							{!pairInvalid && impact && impact.newly_visible.length > 0 && (
								<div className="flex min-w-0 flex-col gap-2">
									<p className="text-sm font-medium">Memory owners affected</p>
									<ScrollArea className="max-h-48 rounded-md border">
										<ul className="flex flex-col p-2">
											{impact.newly_visible.map((member) => (
												<li
													key={member.user_id}
													className="flex items-center gap-3 rounded-md px-2 py-2"
												>
													<Avatar size="sm">
														<AvatarFallback style={avatarColor(member.email)}>
															{getInitials(member.name || member.email)}
														</AvatarFallback>
													</Avatar>
													<div className="flex min-w-0 flex-col">
														<span className="truncate text-sm">
															{member.name || member.email}
														</span>
														<span className="truncate text-xs text-muted-foreground">
															{member.email}
														</span>
													</div>
												</li>
											))}
										</ul>
									</ScrollArea>
								</div>
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					{!pairInvalid && impact && (
						<p className="mr-auto self-center text-xs text-muted-foreground">
							{rulesEnabled
								? "This rule applies immediately."
								: "This rule is staged until group access rules are activated."}
						</p>
					)}
					<Button variant="ghost" onClick={handleClose} disabled={actionBusy}>
						Cancel <Kbd>Esc</Kbd>
					</Button>
					<Button onClick={handleCreate} disabled={!canCreate}>
						Add rule{" "}
						<Kbd>
							<IconCornerDownLeft />
						</Kbd>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function DropSlot({
	ref,
	label,
	placeholder,
	group,
	hovered,
	shake,
	onClear,
	disabled,
}: {
	ref: React.Ref<HTMLDivElement>;
	label: string;
	placeholder: string;
	group: VisibilityGroup | undefined;
	hovered: boolean;
	shake: boolean;
	onClear: () => void;
	disabled: boolean;
}) {
	return (
		<motion.div
			ref={ref}
			animate={shake ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
			transition={{ duration: 0.3 }}
			className={cn(
				"flex h-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-2 text-center transition-colors",
				hovered && "border-primary bg-primary/5",
				group && "border-solid bg-card",
			)}
		>
			<span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</span>
			{group ? (
				<span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
					<IconUsersGroup className="size-3.5 shrink-0 text-muted-foreground" />
					<span className="truncate">{group.name}</span>
					<button
						type="button"
						aria-label={`Clear ${label.toLowerCase()}`}
						disabled={disabled}
						onClick={onClear}
						className="inline-flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none"
					>
						<IconX className="size-3" />
					</button>
				</span>
			) : (
				<span className="text-xs text-muted-foreground">{placeholder}</span>
			)}
		</motion.div>
	);
}
