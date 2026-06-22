import { IconLock } from "@tabler/icons-react";
import { EmptyState } from "@/components/shared/empty-state";

export function RestrictedState({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return <EmptyState icon={IconLock} title={title} description={description} />;
}
