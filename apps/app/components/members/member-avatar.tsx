import { Avatar, AvatarFallback } from "@crosmos/ui/components/avatar";
import { getInitials } from "@/lib/members";

export function MemberAvatar({
	name,
	email,
	size = "default",
}: {
	name: string;
	email: string;
	size?: "default" | "sm" | "lg";
}) {
	return (
		<Avatar size={size}>
			<AvatarFallback>{getInitials(name || email)}</AvatarFallback>
		</Avatar>
	);
}
