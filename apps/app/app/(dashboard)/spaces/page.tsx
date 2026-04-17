import { listSpaces } from "@/actions/spaces";
import { SpaceList } from "@/components/space-list";

export default async function SpacesPage() {
	const spaces = await listSpaces();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Spaces</h1>
				<p className="text-sm text-muted-foreground">
					Manage your memory spaces for storing and retrieving data.
				</p>
			</div>
			<SpaceList spaces={spaces} />
		</div>
	);
}
