"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crosmos/ui/components/empty";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function DashboardError({
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const message =
		error instanceof Error ? error.message : "Something went wrong";

	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<IconAlertTriangle />
				</EmptyMedia>
				<EmptyTitle>Something went wrong</EmptyTitle>
				<EmptyDescription>{message}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button variant="outline" onClick={() => { window.location.href = "/" }}>
					Go Home
				</Button>
				<Button onClick={() => { window.location.reload() }}>
					Try Again
				</Button>
			</EmptyContent>
		</Empty>
	);
}
