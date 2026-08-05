"use client";

import { Button } from "@crosmos/ui/components/button";
import { Input } from "@crosmos/ui/components/input";
import { Label } from "@crosmos/ui/components/label";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { updateOrg } from "@/actions/orgs";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { useCurrentUser } from "@/hooks/use-current-user";
import { orgKey, useOrg } from "@/hooks/use-org";
import { orgsKey } from "@/hooks/use-orgs";
import type { OrgDetailResponse } from "@/lib/types/org";
import { unwrapAction } from "@/lib/unwrap-action";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export function OrganizationSettings() {
	const { data: user } = useCurrentUser();
	const orgId = user?.active_org_id ?? null;
	const { data: org, error, isLoading } = useOrg(orgId);
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	const canManage = org?.your_role === "owner" || org?.your_role === "admin";

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [billingEmail, setBillingEmail] = useState("");
	const [slugError, setSlugError] = useState<string | null>(null);

	// Re-seed when the org first loads or after a save changes it (updated_at).
	useEffect(() => {
		if (!org) return;
		setName(org.name);
		setSlug(org.slug);
		setBillingEmail(org.billing_email ?? "");
		setSlugError(null);
	}, [org]);

	if (error) {
		return (
			<DataFetchError
				message={error.message}
				onRetry={() => (orgId ? mutate(orgKey(orgId)) : Promise.resolve())}
			/>
		);
	}

	if (isLoading && !org) {
		return (
			<div className="flex max-w-md flex-col gap-6">
				{["name", "slug", "billing"].map((k) => (
					<div key={k} className="flex flex-col gap-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-9 w-full" />
					</div>
				))}
			</div>
		);
	}

	if (!org) return null;

	const trimmedName = name.trim();
	const trimmedSlug = slug.trim();
	const trimmedEmail = billingEmail.trim();
	const slugValid = SLUG_RE.test(trimmedSlug);
	const dirty =
		trimmedName !== org.name ||
		trimmedSlug !== org.slug ||
		trimmedEmail !== (org.billing_email ?? "");
	const actionBusy = activeCount > 0;
	const canSave =
		canManage && dirty && trimmedName !== "" && slugValid && !actionBusy;

	async function handleSave() {
		if (!orgId || !canSave || !org) return;
		setSlugError(null);

		const patch: {
			name?: string;
			slug?: string;
			billing_email?: string | null;
		} = {};
		if (trimmedName !== org.name) patch.name = trimmedName;
		if (trimmedSlug !== org.slug) patch.slug = trimmedSlug;
		if (trimmedEmail !== (org.billing_email ?? ""))
			patch.billing_email = trimmedEmail === "" ? null : trimmedEmail;

		runAction(
			async () => {
				const result = await updateOrg(orgId, patch);
				if (!result.ok && result.code === "slug_taken") {
					setSlugError("That slug is already taken.");
				}
				const data = unwrapAction(result);
				// The org-detail revalidation is independent of the list cache, so it
				// runs alongside the optimistic list patch; the list revalidation must
				// follow the optimistic write so it overwrites it with server truth.
				await Promise.all([
					mutate(orgKey(orgId)),
					mutate(
						orgsKey,
						(current: OrgDetailResponse[] | undefined) =>
							current?.map((item) =>
								item.id === orgId ? { ...item, ...data } : item,
							),
						{ revalidate: false },
					),
				]);
				await mutate(orgsKey);
			},
			{ toast: { success: "Organization updated" } },
		).catch((err: unknown) => {
			const code =
				err && typeof err === "object" && "code" in err
					? (err as { code: unknown }).code
					: null;
			if (code !== "slug_taken") {
				toast.error("Couldn't update organization");
			}
		});
	}

	return (
		<div className="flex max-w-md flex-col gap-6">
			{!canManage && (
				<p className="text-sm text-muted-foreground">
					Only owners and admins can edit organization settings.
				</p>
			)}

			<div className="flex flex-col gap-2">
				<Label htmlFor="org-name">Name</Label>
				<Input
					id="org-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={!canManage || actionBusy}
					className="focus-visible:border-input focus-visible:ring-0"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="org-slug">Slug</Label>
				<Input
					id="org-slug"
					value={slug}
					onChange={(e) => {
						setSlug(e.target.value);
						setSlugError(null);
					}}
					disabled={!canManage || actionBusy}
					aria-invalid={
						slugError !== null || (trimmedSlug !== "" && !slugValid)
					}
					className="focus-visible:border-input focus-visible:ring-0"
				/>
				{slugError ? (
					<p className="text-xs text-destructive">{slugError}</p>
				) : trimmedSlug !== "" && !slugValid ? (
					<p className="text-xs text-muted-foreground">
						Lowercase letters, numbers and hyphens only; can't start or end with
						a hyphen.
					</p>
				) : null}
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="org-billing-email">Billing email</Label>
				<Input
					id="org-billing-email"
					type="email"
					value={billingEmail}
					onChange={(e) => setBillingEmail(e.target.value)}
					disabled={!canManage || actionBusy}
					placeholder="billing@example.com"
					className="focus-visible:border-input focus-visible:ring-0"
				/>
			</div>

			{canManage && (
				<div>
					<Button onClick={handleSave} disabled={!canSave}>
						Save changes
					</Button>
				</div>
			)}
		</div>
	);
}
