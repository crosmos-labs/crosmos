"use client";

import { Button } from "@crosmos/ui/components/button";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crosmos/ui/components/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crosmos/ui/components/tooltip";
import { cn } from "@crosmos/ui/lib/utils";
import {
	IconInfoCircle,
	IconPlus,
	IconTrash,
	IconUsersGroup,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import { deleteGrant } from "@/actions/visibility";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import {
	useGrants,
	useGroups,
	visibilityGrantsKey,
} from "@/hooks/use-visibility";
import { optimisticRemove } from "@/lib/optimistic";
import type { VisibilityGrant } from "@/lib/types/visibility";
import { AddRuleDialog } from "./add-rule-dialog";

function isOptimisticGrant(grant: VisibilityGrant) {
	return grant.id.startsWith("optimistic-");
}

export function AccessRulesSection({
	orgId,
	disabled = false,
}: {
	orgId: string;
	disabled?: boolean;
}) {
	const { data: grants, isLoading } = useGrants(orgId);
	const { data: groups } = useGroups(orgId);
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const [addOpen, setAddOpen] = useState(false);

	// Prefer group names over slugs for the sentence; fall back to the slug.
	const nameById = useMemo(() => {
		const map = new Map<string, string>();
		for (const g of groups ?? []) map.set(g.id, g.name);
		return map;
	}, [groups]);

	function handleDelete(grant: VisibilityGrant) {
		if (disabled) return;
		runAction(
			() =>
				optimisticRemove<VisibilityGrant>(
					mutate,
					visibilityGrantsKey(orgId),
					(g) => g.id === grant.id,
					() => deleteGrant(orgId, grant.id),
				),
			{ toast: { success: "Rule removed", error: "Couldn't remove rule" } },
		);
	}

	return (
		<section className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-semibold">Access rules</h2>
				<Button
					size="sm"
					onClick={() => setAddOpen(true)}
					disabled={disabled || (groups?.length ?? 0) < 2}
				>
					<IconPlus className="size-4" />
					Add rule
				</Button>
			</div>

			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead className="font-normal text-muted-foreground">
							Viewer group
						</TableHead>
						<TableHead className="font-normal text-muted-foreground">
							Subject group
						</TableHead>
						<TableHead className="font-normal text-muted-foreground">
							Scope
						</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading && !grants ? (
						["a", "b"].map((k) => (
							<TableRow key={k}>
								<TableCell>
									<Skeleton className="h-5 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-28" />
								</TableCell>
								<TableCell className="w-10">
									<Skeleton className="size-8" />
								</TableCell>
							</TableRow>
						))
					) : !grants || grants.length === 0 ? (
						<TableRow className="hover:bg-transparent">
							<TableCell
								colSpan={4}
								className="h-24 text-center text-muted-foreground"
							>
								No access rules yet. Add a rule to connect two groups.
							</TableCell>
						</TableRow>
					) : (
						grants.map((grant) => {
							const isOptimistic = isOptimisticGrant(grant);
							const viewer =
								nameById.get(grant.viewer_group_id) ?? grant.viewer_group_slug;
							const subject =
								nameById.get(grant.subject_group_id) ??
								grant.subject_group_slug;
							return (
								<TableRow
									key={grant.id}
									className={cn(
										"hover:transition-none",
										isOptimistic && "opacity-50",
									)}
								>
									<TableCell className="font-medium">{viewer}</TableCell>
									<TableCell className="font-medium">{subject}</TableCell>
									<TableCell className="text-muted-foreground">
										<span className="inline-flex items-center gap-1.5">
											Private memories
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														aria-label={`Explain access rule for ${viewer}`}
														className="inline-flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground"
													>
														<IconInfoCircle className="size-3.5" />
													</button>
												</TooltipTrigger>
												<TooltipContent className="max-w-none whitespace-nowrap">
													<span className="inline-flex align-middle items-center gap-1 font-medium text-foreground">
														<IconUsersGroup className="size-3.5 shrink-0 text-muted-foreground" />
														{viewer}
													</span>{" "}
													can read private memories created by{" "}
													<span className="inline-flex align-middle items-center gap-1 font-medium text-foreground">
														<IconUsersGroup className="size-3.5 shrink-0 text-muted-foreground" />
														{subject}
													</span>
													.
												</TooltipContent>
											</Tooltip>
										</span>
									</TableCell>
									<TableCell className="w-10">
										{!isOptimistic && (
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="Remove rule"
												disabled={disabled}
												onClick={() => handleDelete(grant)}
											>
												<IconTrash />
											</Button>
										)}
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>

			<AddRuleDialog
				orgId={orgId}
				groups={groups ?? []}
				grants={grants ?? []}
				open={addOpen}
				onOpenChange={setAddOpen}
				disabled={disabled}
			/>
		</section>
	);
}
