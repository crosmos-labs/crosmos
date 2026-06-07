"use server";

import { type ActionResult, toActionError } from "@/lib/action-result";
import { apiFetch } from "@/lib/api";
import {
	assertFeatureEnabled,
	disabledFeatureResult,
	isVisibilityDisabled,
} from "@/lib/features";
import type {
	GroupMember,
	VisibilityGrant,
	VisibilityGroup,
	VisibilityPreview,
	VisibilitySettings,
} from "@/lib/types/visibility";

const base = (orgId: string) => `/orgs/${orgId}/visibility`;

// --- Groups ---

// Returns a typed result so the SWR fetcher can re-throw a client-side error
// carrying status/code — used to detect a stale active org (see isOrgScopeMismatch).
export async function listGroups(
	orgId: string,
): Promise<ActionResult<VisibilityGroup[]>> {
	if (isVisibilityDisabled) return disabledFeatureResult("Visibility");

	try {
		const data = await apiFetch<{ groups: VisibilityGroup[] }>(
			`${base(orgId)}/groups`,
		);
		return { ok: true, data: data.groups };
	} catch (err) {
		return toActionError(err);
	}
}

export async function createGroup(
	orgId: string,
	name: string,
	slug?: string,
): Promise<ActionResult<VisibilityGroup>> {
	if (isVisibilityDisabled) return disabledFeatureResult("Visibility");

	try {
		const data = await apiFetch<VisibilityGroup>(`${base(orgId)}/groups`, {
			method: "POST",
			body: JSON.stringify(slug ? { name, slug } : { name }),
		});
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}

export async function updateGroup(
	orgId: string,
	groupId: string,
	patch: { name?: string; slug?: string },
): Promise<ActionResult<VisibilityGroup>> {
	if (isVisibilityDisabled) return disabledFeatureResult("Visibility");

	try {
		const data = await apiFetch<VisibilityGroup>(
			`${base(orgId)}/groups/${groupId}`,
			{ method: "PATCH", body: JSON.stringify(patch) },
		);
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}

export async function deleteGroup(
	orgId: string,
	groupId: string,
): Promise<void> {
	assertFeatureEnabled(isVisibilityDisabled, "Visibility");

	await apiFetch(`${base(orgId)}/groups/${groupId}`, { method: "DELETE" });
}

// --- Group members ---

export async function listGroupMembers(
	orgId: string,
	groupId: string,
): Promise<GroupMember[]> {
	assertFeatureEnabled(isVisibilityDisabled, "Visibility");

	const data = await apiFetch<{ members: GroupMember[] }>(
		`${base(orgId)}/groups/${groupId}/members`,
	);
	return data.members;
}

export async function addGroupMember(
	orgId: string,
	groupId: string,
	userId: string,
): Promise<void> {
	assertFeatureEnabled(isVisibilityDisabled, "Visibility");

	await apiFetch(`${base(orgId)}/groups/${groupId}/members/${userId}`, {
		method: "POST",
	});
}

export async function removeGroupMember(
	orgId: string,
	groupId: string,
	userId: string,
): Promise<void> {
	assertFeatureEnabled(isVisibilityDisabled, "Visibility");

	await apiFetch(`${base(orgId)}/groups/${groupId}/members/${userId}`, {
		method: "DELETE",
	});
}

// --- Grants (access rules) ---

export async function listGrants(orgId: string): Promise<VisibilityGrant[]> {
	assertFeatureEnabled(isVisibilityDisabled, "Visibility");

	const data = await apiFetch<{ grants: VisibilityGrant[] }>(
		`${base(orgId)}/grants`,
	);
	return data.grants;
}

export async function createGrant(
	orgId: string,
	viewerGroupId: string,
	subjectGroupId: string,
): Promise<ActionResult<VisibilityGrant>> {
	if (isVisibilityDisabled) return disabledFeatureResult("Visibility");

	try {
		const data = await apiFetch<VisibilityGrant>(`${base(orgId)}/grants`, {
			method: "POST",
			body: JSON.stringify({
				viewer_group_id: viewerGroupId,
				subject_group_id: subjectGroupId,
			}),
		});
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}

export async function deleteGrant(
	orgId: string,
	grantId: string,
): Promise<void> {
	assertFeatureEnabled(isVisibilityDisabled, "Visibility");

	await apiFetch(`${base(orgId)}/grants/${grantId}`, { method: "DELETE" });
}

// --- Preview & settings ---

export async function getVisibilityPreview(
	orgId: string,
	userId: string,
): Promise<VisibilityPreview> {
	assertFeatureEnabled(isVisibilityDisabled, "Visibility");

	return apiFetch<VisibilityPreview>(
		`${base(orgId)}/preview?user_id=${encodeURIComponent(userId)}`,
	);
}

export async function updateVisibilitySettings(
	orgId: string,
	enabled: boolean,
): Promise<ActionResult<VisibilitySettings>> {
	if (isVisibilityDisabled) return disabledFeatureResult("Visibility");

	try {
		const data = await apiFetch<VisibilitySettings>(`${base(orgId)}/settings`, {
			method: "PATCH",
			body: JSON.stringify({ enabled }),
		});
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}
