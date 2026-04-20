"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
// import { setActiveOrgCookie } from "@/lib/auth/cookies";
import type { OrgDetailResponse } from "@/lib/types/org";

interface OrgListResponse {
	orgs: OrgDetailResponse[];
	next_cursor: string | null;
}

export async function listOrgs(): Promise<OrgDetailResponse[]> {
	const data = await apiFetch<OrgListResponse>("/orgs");
	return data.orgs;
}

export async function setActiveOrg(orgId: number): Promise<void> {
    // TODO: Implement org selection
	revalidatePath("/");
}
