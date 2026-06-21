import { Avatar, AvatarFallback } from "@crosmos/ui/components/avatar";
import { avatarColor, getInitials } from "@/lib/members";

export function GroupAvatar({
	name,
	seed,
	size = "default",
	className,
}: {
	name: string;
	seed: string;
	size?: "default" | "sm" | "lg";
	className?: string;
}) {
	return (
		<Avatar size={size} className={className}>
			<AvatarFallback style={avatarColor(seed)}>
				{getInitials(name)}
			</AvatarFallback>
		</Avatar>
	);
}
