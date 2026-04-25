"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { setActiveOrgCookie } from "@/lib/auth/cookies";
import type { OrgDetailResponse } from "@/lib/types/org";

interface OrgListResponse {
	orgs: OrgDetailResponse[];
	next_cursor: string | null;
}

export async function listOrgs(): Promise<OrgDetailResponse[]> {
	const data = await apiFetch<OrgListResponse>("/orgs", { skipOrgScope: true });
	return data.orgs;
}

export async function setActiveOrg(orgId: string): Promise<void> {
	await setActiveOrgCookie(orgId);
	revalidatePath("/");
}
