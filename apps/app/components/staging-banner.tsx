import { Alert, AlertDescription } from "@crosmos/ui/components/alert";
import { IconInfoCircle } from "@tabler/icons-react";

export function StagingBanner() {
	if (process.env.NODE_ENV === "production") {
		return null;
	}

	return (
		<Alert className="shrink-0 border-x-0 border-t-0 border-b border-sidebar-border bg-sidebar py-1.5">
			<AlertDescription className="flex items-center justify-center gap-2 text-sm text-sidebar-foreground">
				<IconInfoCircle className="size-4" />
				This is a staging version and may not reflect the final product.
			</AlertDescription>
		</Alert>
	);
}
