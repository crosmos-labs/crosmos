"use client";

import { Skeleton } from "@crosmos/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crosmos/ui/components/table";

const COLUMNS = ["Name", "Email", "Role", "Status", "Joined"];

function SkeletonRow() {
	return (
		<TableRow className="hover:bg-transparent">
			<TableCell>
				<div className="flex items-center gap-3">
					<Skeleton className="size-8 rounded-full" />
					<Skeleton className="h-4 w-32" />
				</div>
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-44" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-5 w-14 rounded-4xl" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-5 w-16 rounded-4xl" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-16" />
			</TableCell>
			<TableCell className="w-10" />
		</TableRow>
	);
}

export function MembersTableSkeleton() {
	return (
		<Table>
			<TableHeader>
				<TableRow className="hover:bg-transparent">
					{COLUMNS.map((c) => (
						<TableHead key={c} className="text-muted-foreground font-normal">
							{c}
						</TableHead>
					))}
					<TableHead className="w-10" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{["a", "b", "c", "d"].map((k) => (
					<SkeletonRow key={k} />
				))}
			</TableBody>
		</Table>
	);
}
