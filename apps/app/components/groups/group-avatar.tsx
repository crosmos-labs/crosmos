import { HashAvatar } from "@/components/shared/hash-avatar";

const SIZE_PX = { xs: 20, sm: 24, default: 32, lg: 40 } as const;

export function GroupAvatar({
	name,
	seed,
	size = "default",
	className,
}: {
	name: string;
	seed: string;
	size?: keyof typeof SIZE_PX;
	className?: string;
}) {
	return (
		<HashAvatar
			hash={seed}
			size={SIZE_PX[size]}
			label={`${name} avatar`}
			className={className}
		/>
	);
}
