"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { useSpaces } from "@/hooks/use-spaces";
import { SpaceList } from "@/components/space-list";

export default function SpacesPage() {
	const { data: spaces, isLoading, error } = useSpaces();

	if (isLoading) {
		return <AnimatedSpinner name="waverows" size="1.5rem" />;
	}

	if (error) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">Spaces</h1>
					<p className="text-sm text-muted-foreground">
						Manage your memory spaces for storing and retrieving data.
					</p>
				</div>
				<p className="text-sm text-red-500">
					Failed to load spaces. Please try again.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Spaces</h1>
				<p className="text-sm text-muted-foreground">
					Manage your memory spaces for storing and retrieving data.
				</p>
			</div>
			<SpaceList spaces={spaces ?? []} />
		</div>
	);
}