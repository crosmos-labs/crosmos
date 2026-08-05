"use client";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crosmos/ui/components/dialog";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useRef } from "react";
import { InstallSteps } from "@/components/connectors/install-steps";
import type { Connector } from "@/config/connectors";

export function ConnectorInstallDialog({
	connector,
	onOpenChange,
}: {
	connector: Connector | null;
	onOpenChange: (open: boolean) => void;
}) {
	// Keeps the body rendered while the close animation plays out.
	const lastConnector = useRef(connector);
	if (connector) lastConnector.current = connector;
	const shown = connector ?? lastConnector.current;

	return (
		<Dialog open={connector !== null} onOpenChange={onOpenChange}>
			<DialogContent aria-describedby={undefined}>
				{shown && (
					<>
						<DialogHeader className="flex-row items-center gap-2.5">
							<span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
								<shown.logo className="size-5" />
							</span>
							<DialogTitle>Install for {shown.name}</DialogTitle>
						</DialogHeader>
						<InstallSteps connector={shown} />
						<DialogFooter>
							<a
								href={shown.docsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 self-end text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								Docs
								<IconArrowUpRight size={14} />
							</a>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
