"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { Button } from "@crosmos/ui/components/button";
import { Input } from "@crosmos/ui/components/input";
import { Label } from "@crosmos/ui/components/label";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { updateProfile } from "@/actions/auth";
import { useCurrentUser } from "@/hooks/use-current-user";

export function ProfileSettings() {
	const { data: user, isLoading } = useCurrentUser();
	const { mutate } = useSWRConfig();
	const router = useRouter();

	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (user) setName(user.name);
	}, [user]);

	if (isLoading && !user) {
		return (
			<div className="flex max-w-md flex-col gap-6">
				{["name", "email"].map((k) => (
					<div key={k} className="flex flex-col gap-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-9 w-full" />
					</div>
				))}
			</div>
		);
	}

	if (!user) return null;

	const trimmedName = name.trim();
	const dirty = trimmedName !== user.name;
	const canSave = dirty && trimmedName !== "" && !saving;

	async function handleSave() {
		if (!canSave) return;
		setSaving(true);
		try {
			await updateProfile(trimmedName);
			toast.success("Profile updated");
			await mutate("/auth/me");
			// Refresh the server-rendered sidebar/greeting.
			router.refresh();
		} catch {
			toast.error("Couldn't update profile");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="flex max-w-md flex-col gap-6">
			<div className="flex flex-col gap-2">
				<Label htmlFor="profile-name">Name</Label>
				<Input
					id="profile-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="focus-visible:border-input focus-visible:ring-0"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="profile-email">Email</Label>
				<Input id="profile-email" value={user.email} disabled readOnly />
				<p className="text-xs text-muted-foreground">
					Your email is tied to your sign-in and can't be changed here.
				</p>
			</div>

			<div>
				<Button onClick={handleSave} disabled={!canSave}>
					{saving ? (
						<AnimatedSpinner name="pulse" color="currentColor" />
					) : (
						"Save changes"
					)}
				</Button>
			</div>
		</div>
	);
}
