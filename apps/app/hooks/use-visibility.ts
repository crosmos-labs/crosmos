import useSWR from "swr";
import {
	getVisibilityPreview,
	listGrants,
	listGroupMembers,
	listGroups,
	previewGrantImpact,
} from "@/actions/visibility";
import { byCreatedAtDesc } from "@/lib/sort";
import type {
	GroupMember,
	VisibilityGrant,
	VisibilityGrantImpact,
	VisibilityGroup,
	VisibilityPreview,
	VisibilitySettings,
} from "@/lib/types/visibility";

export function visibilityGroupsKey(orgId: string): string {
	return `/orgs/${orgId}/visibility/groups`;
}

export function visibilityGroupMembersKey(
	orgId: string,
	groupId: string,
): string {
	return `/orgs/${orgId}/visibility/groups/${groupId}/members`;
}

export function visibilityGrantsKey(orgId: string): string {
	return `/orgs/${orgId}/visibility/grants`;
}

export function visibilityGrantImpactKey(
	orgId: string,
	viewerGroupId: string,
	subjectGroupId: string,
): string {
	return `/orgs/${orgId}/visibility/grants/preview?viewer_group_id=${viewerGroupId}&subject_group_id=${subjectGroupId}`;
}

export function visibilityPreviewKey(orgId: string, userId: string): string {
	return `/orgs/${orgId}/visibility/preview?user_id=${userId}`;
}

// Synthetic key for the enforcement switch. There is no GET settings endpoint;
// the flag is read off the current user's preview but kept under its own key so
// the per-user preview read (visibilityPreviewKey) never clobbers it.
export function visibilitySettingsKey(orgId: string): string {
	return `/orgs/${orgId}/visibility/settings`;
}

export function useGroups(orgId: string | null | undefined) {
	return useSWR<VisibilityGroup[]>(
		orgId ? visibilityGroupsKey(orgId) : null,
		async () => {
			const result = await listGroups(orgId as string);
			if (!result.ok) {
				// Throw on the client so status/code survive for isOrgScopeMismatch.
				throw Object.assign(new Error(result.message), {
					status: result.status,
					code: result.code,
				});
			}
			// Newest-first so optimistic top-inserts match the order after refetch (API returns created_at ASC).
			return byCreatedAtDesc(result.data);
		},
		{ revalidateOnFocus: true },
	);
}

export function useGrants(orgId: string | null | undefined) {
	return useSWR<VisibilityGrant[]>(
		orgId ? visibilityGrantsKey(orgId) : null,
		// Newest-first so optimistic top-inserts match the order after refetch (API returns created_at ASC).
		async () => byCreatedAtDesc(await listGrants(orgId as string)),
		{ revalidateOnFocus: true },
	);
}

export function useGrantImpactPreview(
	orgId: string | null | undefined,
	viewerGroupId: string | null | undefined,
	subjectGroupId: string | null | undefined,
) {
	return useSWR<VisibilityGrantImpact>(
		orgId && viewerGroupId && subjectGroupId
			? visibilityGrantImpactKey(orgId, viewerGroupId, subjectGroupId)
			: null,
		async () => {
			const result = await previewGrantImpact(
				orgId as string,
				viewerGroupId as string,
				subjectGroupId as string,
			);
			if (!result.ok) {
				throw Object.assign(new Error(result.message), {
					status: result.status,
					code: result.code,
				});
			}
			return result.data;
		},
		// Don't auto-retry on failure; the dialog surfaces a manual Retry button
		// that calls mutate() explicitly.
		{ revalidateOnFocus: false, shouldRetryOnError: false },
	);
}

// Fetches only when a group is selected (sheet open).
export function useGroupMembers(
	orgId: string | null | undefined,
	groupId: string | null | undefined,
) {
	return useSWR<GroupMember[]>(
		orgId && groupId ? visibilityGroupMembersKey(orgId, groupId) : null,
		() => listGroupMembers(orgId as string, groupId as string),
		{ revalidateOnFocus: false },
	);
}

// Enforcement-switch state, derived from the current user's preview.
export function useVisibilitySettings(
	orgId: string | null | undefined,
	currentUserId: string | null | undefined,
) {
	return useSWR<VisibilitySettings>(
		orgId && currentUserId ? visibilitySettingsKey(orgId) : null,
		async () => {
			const preview = await getVisibilityPreview(
				orgId as string,
				currentUserId as string,
			);
			return { visibility_enabled: preview.visibility_enabled };
		},
		{ revalidateOnFocus: false },
	);
}

// Per-user preview, independent of the enforcement switch's read.
export function useVisibilityPreview(
	orgId: string | null | undefined,
	userId: string | null | undefined,
) {
	return useSWR<VisibilityPreview>(
		orgId && userId ? visibilityPreviewKey(orgId, userId) : null,
		() => getVisibilityPreview(orgId as string, userId as string),
		{ revalidateOnFocus: false },
	);
}
