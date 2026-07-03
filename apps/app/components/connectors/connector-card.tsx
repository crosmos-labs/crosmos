"use client";

import type { Connector } from "@/config/connectors";

export function ConnectorCard({
	connector,
	itemLabel,
	onInstall,
}: {
	connector: Connector;
	itemLabel: string;
	onInstall: () => void;
}) {
	const Logo = connector.logo;

	return (
		<button
			type="button"
			onClick={onInstall}
			aria-label={`Install ${connector.name}`}
			className="group flex cursor-pointer flex-col gap-3 rounded-2xl border bg-card p-4 text-left transition-colors duration-150 hover:transition-none hover:border-ring hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:translate-y-px"
		>
			<span className="flex items-center gap-2.5">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:group-hover:scale-105">
					<Logo className="size-5.5" />
				</span>
				<span className="flex min-w-0 flex-col">
					<span className="font-medium">{connector.name}</span>
					<span className="text-xs text-muted-foreground">{itemLabel}</span>
				</span>
			</span>
			<span className="mt-auto text-sm text-muted-foreground">
				{connector.description}
			</span>
		</button>
	);
}

export function ConnectorTeaserCard() {
	return (
		<div className="flex min-h-36 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed p-4 text-center">
			<span className="text-sm font-medium">More on the way</span>
			<span className="max-w-52 text-sm text-muted-foreground">
				New connectors and integrations are coming soon.
			</span>
		</div>
	);
}
