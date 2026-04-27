"use client";

import { Button } from "@crosmos/ui/components/button";
import { IconBarrierBlock } from "@tabler/icons-react";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";

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
			<EmptyState
				icon={IconBarrierBlock}
				title="Something went wrong"
				description="We hit an unexpected error. Try refreshing or head back home."
			>
				{message && (
					<code className="max-w-lg rounded-md bg-muted px-3 py-2 font-mono text-sm text-muted-foreground">
						{message}
					</code>
				)}
				<div className="flex items-center gap-2.5">
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
				</div>
			</EmptyState>
		</div>
	);
}
