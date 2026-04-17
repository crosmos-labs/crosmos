"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crosmos/ui/components/alert";
import { Button } from "@crosmos/ui/components/button";
import { CopyButton } from "@crosmos/ui/components/copy-button";
import { IconCircleCheck, IconX } from "@tabler/icons-react";

export function NewKeyBanner({
	createdKey,
	onDismiss,
}: {
	createdKey: {
		key_id: number;
		name: string;
		raw_key: string;
	};
	onDismiss: (keyId: number) => void;
}) {
	return (
		<Alert className="border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400">
			<IconCircleCheck className="text-green-500" />
			<AlertTitle>API Key is ready! - {createdKey.name}</AlertTitle>
			<AlertDescription className="flex items-center gap-1.5">
				<code className="font-mono text-xs">{createdKey.raw_key}</code>
				<CopyButton value={createdKey.raw_key} />
			</AlertDescription>
			<AlertAction>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => onDismiss(createdKey.key_id)}
					className="text-green-700/50 hover:!bg-transparent hover:text-green-700 dark:text-green-400/50 dark:hover:text-green-400"
				>
					<IconX className="size-4" />
				</Button>
			</AlertAction>
		</Alert>
	);
}
