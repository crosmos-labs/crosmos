"use client";

import Link from "next/link";
import { useState } from "react";
import {
	ConnectorCard,
	ConnectorTeaserCard,
} from "@/components/connectors/connector-card";
import { ConnectorInstallDialog } from "@/components/connectors/connector-install-dialog";
import {
	type Connector,
	connectorCategories,
	connectors,
} from "@/config/connectors";

export default function ConnectorsPage() {
	const [installTarget, setInstallTarget] = useState<Connector | null>(null);
	const sections = connectorCategories
		.map((category) => ({
			category,
			items: connectors.filter((c) => c.category === category.id),
		}))
		.filter(({ items }) => items.length > 0);
	const teaserCategoryId = sections.at(-1)?.category.id;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Connectors</h1>
				<p className="text-sm text-muted-foreground">
					Bring Crosmos memory to the tools where you already work. Every
					connector authenticates with your{" "}
					<Link
						href="/api-key"
						className="text-foreground underline underline-offset-3 hover:no-underline"
					>
						API key
					</Link>
					.
				</p>
			</div>
			{sections.map(({ category, items }) => (
				<section key={category.id} className="flex flex-col gap-3">
					<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						{category.label}
					</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{items.map((connector) => (
							<ConnectorCard
								key={connector.id}
								connector={connector}
								itemLabel={category.itemLabel}
								onInstall={() => setInstallTarget(connector)}
							/>
						))}
						{category.id === teaserCategoryId && <ConnectorTeaserCard />}
					</div>
				</section>
			))}
			<ConnectorInstallDialog
				connector={installTarget}
				onOpenChange={(open) => {
					if (!open) setInstallTarget(null);
				}}
			/>
		</div>
	);
}
