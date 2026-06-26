import { HashAvatar } from "@/components/shared/hash-avatar";

export function OrgAvatar({
	name,
	size = 20,
	className,
}: {
	name: string;
	size?: number;
	className?: string;
}) {
	return (
		<HashAvatar
			hash={name}
			size={size}
			label={`${name} avatar`}
			className={className}
		/>
	);
}
