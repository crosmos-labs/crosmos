import { listApiKeys } from "@/actions/api-keys";
import { ApiKeyList } from "@/components/api-key-list";

export default async function ApiKeyPage() {
	const keys = await listApiKeys();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
				<p className="text-sm text-muted-foreground">
					Manage your API keys for authenticating requests to the Crosmos API.
				</p>
			</div>
			<ApiKeyList keys={keys} />
		</div>
	);
}
