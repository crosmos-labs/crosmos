"use server";

import { apiFetch } from "@/lib/api";
import type { OrgDetailResponse } from "@/lib/types/org";

interface OrgListResponse {
	orgs: OrgDetailResponse[];
	next_cursor: string | null;
}

export async function listOrgs(): Promise<OrgDetailResponse[]> {
	const data = await apiFetch<OrgListResponse>("/orgs");
	return data.orgs;
}
