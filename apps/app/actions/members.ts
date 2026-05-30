"use server";

import { apiFetch } from "@/lib/api";
import type {
	CreateInviteRequest,
	InviteListResponse,
	InviteResponse,
	MemberListResponse,
	MemberResponse,
} from "@/lib/types/org";

export async function listMembers(orgId: string): Promise<MemberResponse[]> {
	const data = await apiFetch<MemberListResponse>(`/orgs/${orgId}/members`);
	return data.members;
}

export async function changeMemberRole(
	orgId: string,
	userId: string,
	role: "admin" | "member",
): Promise<MemberResponse> {
	return apiFetch<MemberResponse>(`/orgs/${orgId}/members/${userId}`, {
		method: "PATCH",
		body: JSON.stringify({ role }),
	});
}

export async function removeMember(
	orgId: string,
	userId: string,
): Promise<void> {
	await apiFetch(`/orgs/${orgId}/members/${userId}`, {
		method: "DELETE",
	});
}

export async function listInvites(orgId: string): Promise<InviteResponse[]> {
	const data = await apiFetch<InviteListResponse>(`/orgs/${orgId}/invites`);
	return data.invites;
}

export async function createInvite(
	orgId: string,
	email: string,
	role: CreateInviteRequest["role"],
): Promise<InviteResponse> {
	return apiFetch<InviteResponse>(`/orgs/${orgId}/invites`, {
		method: "POST",
		body: JSON.stringify({ email, role } satisfies CreateInviteRequest),
	});
}

export async function revokeInvite(
	orgId: string,
	inviteId: string,
): Promise<void> {
	await apiFetch(`/orgs/${orgId}/invites/${inviteId}`, {
		method: "DELETE",
	});
}
