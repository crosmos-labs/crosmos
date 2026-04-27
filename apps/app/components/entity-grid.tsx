"use client";

import { Badge } from "@crosmos/ui/components/badge";
import {
	Card,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@crosmos/ui/components/card";
import { IconTopologyStarRing3 } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/empty-state";
import type { Entity } from "@/lib/types/entity";

const ENTITY_TYPE_LABELS: Record<string, string> = {
	person: "Person",
	organization: "Organization",
	technology: "Technology",
	project: "Project",
	concept: "Concept",
	location: "Location",
	object: "Object",
};

export function EntityGrid({ entities }: { entities: Entity[] }) {
	if (entities.length === 0) {
		return (
			<EmptyState
				icon={IconTopologyStarRing3}
				title="No entities yet"
				description="Entities will appear here once data is ingested into this space."
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{entities.map((entity) => {
				const label =
					ENTITY_TYPE_LABELS[entity.entity_type ?? "object"] ??
					entity.entity_type ??
					"Unknown";
				return (
					<Card key={entity.id} size="sm" className="rounded">
						<CardHeader>
							<CardTitle className="line-clamp-1">{entity.name}</CardTitle>
							<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
								<span>└─</span>
								<Badge variant="outline">{label}</Badge>
							</div>
						</CardHeader>
						<CardFooter>
							<span className="text-xs text-muted-foreground">
								{entity.edge_count}{" "}
								{entity.edge_count === 1 ? "connection" : "connections"}
							</span>
							<span className="ml-auto text-xs text-muted-foreground">
								{formatDistanceToNow(new Date(entity.created_at), {
									addSuffix: true,
								})}
							</span>
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
}
