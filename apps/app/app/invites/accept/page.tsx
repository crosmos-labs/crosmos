import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { previewInvite } from "@/actions/invites";
import { peekUser } from "@/lib/auth/session";
import { AcceptInviteCard } from "./accept-invite-card";

export default async function AcceptInvitePage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) {
	const { token } = await searchParams;
	if (!token) redirect("/");

	const user = await peekUser();
	if (!user) redirect(`/signup?invite=${encodeURIComponent(token)}`);

	const result = await previewInvite(token);

	return (
		<div className="flex flex-1 flex-col p-6 sm:p-8">
			<Link href="/" className="w-fit">
				<Image
					src="/banner_light.svg"
					alt="Crosmos"
					width={120}
					height={32}
					className="h-6 sm:h-8 block dark:hidden"
					style={{ width: "auto" }}
					priority
					unoptimized
				/>
				<Image
					src="/banner_dark.svg"
					alt="Crosmos"
					width={120}
					height={32}
					className="h-6 sm:h-8 hidden dark:block"
					style={{ width: "auto" }}
					priority
					unoptimized
				/>
			</Link>

			<main className="flex flex-1 items-center justify-center">
				{result.ok ? (
					<AcceptInviteCard
						token={token}
						preview={result.data}
						userName={user.name}
						userEmail={user.email}
					/>
				) : (
					<DeadInvite status={result.status} />
				)}
			</main>
		</div>
	);
}

function DeadInvite({ status }: { status: number }) {
	const copy =
		status === 410
			? {
					title: "Invitation expired",
					message:
						"This invitation is no longer valid. Ask an organization admin to send a new one.",
				}
			: status === 409
				? {
						title: "Invitation already used",
						message:
							"This invitation has already been accepted. Try signing in instead.",
					}
				: {
						title: "Invitation not found",
						message:
							"This invitation link is invalid. Double-check the link or ask for a new invite.",
					};

	return (
		<div className="flex flex-col items-center gap-2 text-center">
			<h1 className="text-xl font-semibold tracking-tight">{copy.title}</h1>
			<p className="max-w-sm text-muted-foreground">{copy.message}</p>
		</div>
	);
}
