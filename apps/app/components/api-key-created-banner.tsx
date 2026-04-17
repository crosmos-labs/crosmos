"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crosmos/ui/components/alert";
import { Button } from "@crosmos/ui/components/button";
import {
	IconCheck,
	IconCircleCheck,
	IconCopy,
	IconX,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import type { CreateApiKeyResponse } from "@/actions/api-keys";

function KeyBanner({
	createdKey,
	onDismiss,
}: {
	createdKey: CreateApiKeyResponse;
	onDismiss: (keyId: number) => void;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(createdKey.raw_key);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [createdKey.raw_key]);

	return (
		<Alert className="border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400">
			<IconCircleCheck className="text-green-500" />
			<AlertTitle>API Key Created</AlertTitle>
			<AlertDescription>
				<code className="font-mono text-xs">{createdKey.raw_key}</code>
			</AlertDescription>
			<AlertDescription className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={handleCopy}
					className="text-green-700 hover:text-green-700 dark:text-green-400 dark:hover:text-green-400"
				>
					<span className="relative size-4">
						<IconCopy
							className={`absolute inset-0 size-4 transition-opacity duration-200 ${copied ? "opacity-0" : "opacity-100"}`}
						/>
						<IconCheck
							className={`absolute inset-0 size-4 transition-opacity duration-200 ${copied ? "opacity-100" : "opacity-0"}`}
						/>
					</span>
				</Button>
			</AlertDescription>
			<AlertAction>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => onDismiss(createdKey.key_id)}
					className="text-green-700/50 hover:text-green-700 dark:text-green-400/50 dark:hover:text-green-400"
				>
					<IconX className="size-4" />
				</Button>
			</AlertAction>
		</Alert>
	);
}

export function ApiKeyCreatedBanner({
	createdKeys,
	onDismiss,
}: {
	createdKeys: CreateApiKeyResponse[];
	onDismiss: (keyId: number) => void;
}) {
	if (createdKeys.length === 0) return null;

	return (
		<div className="flex flex-col gap-2">
			{createdKeys.map((key) => (
				<KeyBanner key={key.key_id} createdKey={key} onDismiss={onDismiss} />
			))}
		</div>
	);
}
