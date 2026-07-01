import { HashAvatar } from "@/components/shared/hash-avatar";

const PLAN_TONES: Record<string, string[]> = {
	free: ["#64748b"],
	developer: ["#3b82f6"],
	pro: ["#a855f7"],
};

export function PlanIcon({
	plan,
	size = 24,
	className,
}: {
	plan: string;
	size?: number;
	className?: string;
}) {
	return (
		<HashAvatar
			hash={`plan:${plan}`}
			size={size}
			shape="circle"
			animated
			tones={PLAN_TONES[plan]}
			label={`${plan} plan`}
			className={className}
		/>
	);
}
