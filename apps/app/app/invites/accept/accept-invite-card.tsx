"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { Avatar, AvatarFallback } from "@crosmos/ui/components/avatar";
import { Button } from "@crosmos/ui/components/button";
import { IconLink } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { logout } from "@/actions/auth";
import { acceptInvite } from "@/actions/invites";
import { OrgAvatar } from "@/components/layout/org-avatar";
import { getInitials } from "@/lib/members";
import type { InvitePreviewResponse } from "@/lib/types/org";

function acceptErrorMessage(status: number, code: string | null): string {
	if (code === "already_member")
		return "You're already a member of this organization.";
	if (status === 410) return "This invitation has expired.";
	if (status === 409) return "This invitation has already been used.";
	if (status === 403) return "This invitation was sent to a different email.";
	if (status === 404) return "This invitation link is invalid.";
	return "Couldn't accept the invitation. Try again.";
}

export function AcceptInviteCard({
	token,
	preview,
	userName,
	userEmail,
}: {
	token: string;
	preview: InvitePreviewResponse;
	userName: string;
	userEmail: string;
}) {
	const router = useRouter();
	const [pending, setPending] = useState(false);

	const emailMatch =
		preview.email.trim().toLowerCase() === userEmail.trim().toLowerCase();
	const roleText = preview.role === "admin" ? "an admin" : "a member";

	async function handleAccept() {
		setPending(true);
		const result = await acceptInvite(token);
		if (!result.ok) {
			toast.error(acceptErrorMessage(result.status, result.code));
			setPending(false);
			return;
		}
		window.location.href = "/";
	}

	async function handleSwitchAccount() {
		setPending(true);
		await logout();
		router.push(`/signup?invite=${encodeURIComponent(token)}`);
	}

	return (
		<div className="flex flex-col items-center gap-10 text-center">
			<div className="flex items-center gap-8">
				<Avatar className="size-16">
					<AvatarFallback className="text-xl">
						{getInitials(userName || userEmail)}
					</AvatarFallback>
				</Avatar>
				<IconLink className="size-8 text-muted-foreground" />
				<OrgAvatar slug={preview.org_name} size={64} />
			</div>

			<p className="max-w-4xl text-2xl text-balance">
				{preview.inviter_name ? (
					<>
						<span className="font-medium">{preview.inviter_name}</span> has
						invited you to join{" "}
						<span className="font-medium">{preview.org_name}</span> as{" "}
						{roleText}.
					</>
				) : (
					<>
						You've been invited to join{" "}
						<span className="font-medium">{preview.org_name}</span> as{" "}
						{roleText}.
					</>
				)}
			</p>

			{emailMatch ? (
				<Button
					size="lg"
					onClick={handleAccept}
					disabled={pending}
					className="h-10 min-w-36 px-6 text-base"
				>
					{pending ? (
						<AnimatedSpinner name="pulse" color="currentColor" />
					) : (
						"Accept"
					)}
				</Button>
			) : (
				<div className="flex flex-col items-center gap-4">
					<p className="max-w-xl text-base text-muted-foreground">
						This invite was sent to{" "}
						<span className="font-medium text-foreground">{preview.email}</span>
						, not{" "}
						<span className="font-medium text-foreground">{userEmail}</span>.
					</p>
					<Button
						variant="outline"
						size="lg"
						onClick={handleSwitchAccount}
						disabled={pending}
						className="h-10 px-6 text-base"
					>
						Sign in with a different account
					</Button>
				</div>
			)}
		</div>
	);
}
