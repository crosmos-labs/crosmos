"use server";

import { type ActionResult, toActionError } from "@/lib/action-result";
import { apiFetch } from "@/lib/api";
import { disabledFeatureResult, isSettingsDisabled } from "@/lib/features";
import type { OrgDetailResponse, OrgResponse } from "@/lib/types/org";

interface OrgListResponse {
	orgs: OrgDetailResponse[];
	next_cursor: string | null;
}

export async function listOrgs(): Promise<OrgDetailResponse[]> {
	const data = await apiFetch<OrgListResponse>("/orgs");
	return data.orgs;
}

export async function getOrg(orgId: string): Promise<OrgDetailResponse> {
	return apiFetch<OrgDetailResponse>(`/orgs/${orgId}`);
}

export async function updateOrg(
	orgId: string,
	patch: { name?: string; slug?: string; billing_email?: string | null },
): Promise<ActionResult<OrgResponse>> {
	if (isSettingsDisabled) return disabledFeatureResult("Settings");

	try {
		const data = await apiFetch<OrgResponse>(`/orgs/${orgId}`, {
			method: "PATCH",
			body: JSON.stringify(patch),
		});
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}
