import { HashAvatar } from "@/components/shared/hash-avatar";

export function OrgAvatar({
	slug,
	size = 20,
	className,
}: {
	slug: string;
	size?: number;
	className?: string;
}) {
	return (
		<HashAvatar
			hash={slug}
			size={size}
			label={`${slug} avatar`}
			className={className}
		/>
	);
}
