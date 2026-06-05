import useSWR from "swr";
import {
	getVisibilityPreview,
	listGrants,
	listGroupMembers,
	listGroups,
} from "@/actions/visibility";
import type {
	GroupMember,
	VisibilityGrant,
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

export function visibilityPreviewKey(orgId: string, userId: string): string {
	return `/orgs/${orgId}/visibility/preview?user_id=${userId}`;
}

// Synthetic key for the enforcement switch. There is no GET settings endpoint;
// the flag is read off the current user's preview but kept under its own key so
// the per-user Preview sheet (visibilityPreviewKey) never clobbers it.
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
			return result.data;
		},
		{ revalidateOnFocus: true },
	);
}

export function useGrants(orgId: string | null | undefined) {
	return useSWR<VisibilityGrant[]>(
		orgId ? visibilityGrantsKey(orgId) : null,
		() => listGrants(orgId as string),
		{ revalidateOnFocus: true },
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

// Per-user preview for the Preview sheet (independent of the switch's read).
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
