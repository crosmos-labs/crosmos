import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crosmos/ui/components/empty";
import type { ComponentType } from "react";

interface EmptyStateProps {
	icon: ComponentType<{ className?: string }>;
	title: string;
	description: string;
	children?: React.ReactNode;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	children,
}: EmptyStateProps) {
	return (
		<Empty className="gap-6 p-12">
			<EmptyHeader className="gap-4">
				<EmptyMedia
					variant="icon"
					className="size-10 [&_svg:not([class*='size-'])]:size-6"
				>
					<Icon />
				</EmptyMedia>
				<EmptyTitle className="text-xl">{title}</EmptyTitle>
				<EmptyDescription className="max-w-sm text-base/relaxed">
					{description}
				</EmptyDescription>
			</EmptyHeader>
			{children}
		</Empty>
	);
}
