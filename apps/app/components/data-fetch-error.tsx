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
import { IconBarrierBlock } from "@tabler/icons-react";
import { useState } from "react";

export function DataFetchError({
	message,
	onRetry,
}: {
	message?: string;
	onRetry?: () => Promise<unknown>;
}) {
	const [retrying, setRetrying] = useState(false);

	const handleRetry = async () => {
		if (retrying) return;
		setRetrying(true);
		try {
			if (onRetry) {
				await onRetry();
			} else {
				window.location.reload();
			}
		} finally {
			setRetrying(false);
		}
	};

	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<Empty className="gap-6 p-12">
				<EmptyHeader className="gap-4">
					<EmptyMedia
						variant="icon"
						className="size-16 [&_svg:not([class*='size-'])]:size-8"
					>
						<IconBarrierBlock />
					</EmptyMedia>
					<EmptyTitle className="text-xl">Something went wrong</EmptyTitle>
					<EmptyDescription className="max-w-sm text-base/relaxed">
						We hit an unexpected error. Try refreshing or head back home.
					</EmptyDescription>
				</EmptyHeader>
				{message && (
					<code className="max-w-lg rounded-md bg-muted px-3 py-2 font-mono text-sm text-muted-foreground">
						{message}
					</code>
				)}
				<EmptyContent className="flex-row justify-center">
					<Button
						variant="outline"
						onClick={() => {
							window.location.href = "/";
						}}
					>
						Go Home
					</Button>
					<Button onClick={handleRetry} disabled={retrying}>
						Try Again
					</Button>
				</EmptyContent>
			</Empty>
		</div>
	);
}
