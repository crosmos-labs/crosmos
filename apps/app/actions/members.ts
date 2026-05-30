"use server";

import { apiFetch } from "@/lib/api";
import type {
	CreateInviteRequest,
	InviteListResponse,
	InviteResponse,
	MemberListResponse,
	MemberResponse,
} from "@/lib/types/org";

// TEMP: set to true to serve hardcoded data while the backend endpoints are not live.
// Flip to false once GET /members and GET /invites are reachable.
const USE_MOCK = false;

const MOCK_MEMBERS: MemberResponse[] = [
	{
		user_id: "019e5198-b827-7443-8af4-f39adb634b4e",
		email: "aditya@crosmos.dev",
		name: "Aditya Chaudhary",
		role: "owner",
		joined_at: "2025-09-04T08:15:00Z",
	},
	{
		user_id: "mock-aicha",
		email: "aicha.diallo@ketl.co",
		name: "Aïcha Diallo",
		role: "admin",
		joined_at: "2025-10-21T14:42:00Z",
	},
	{
		user_id: "mock-mateo",
		email: "mateo.fernandez@nimbus.io",
		name: "Mateo Fernández",
		role: "member",
		joined_at: "2026-01-09T11:05:00Z",
	},
	{
		user_id: "mock-yuki",
		email: "yuki.tanaka@harbor.dev",
		name: "Yuki Tanaka",
		role: "admin",
		joined_at: "2025-12-30T19:20:00Z",
	},
	{
		user_id: "mock-priya",
		email: "priya@lumen.app",
		name: "Priya Nair",
		role: "member",
		joined_at: "2026-03-27T16:48:00Z",
	},
];

const MOCK_INVITES: InviteResponse[] = [
	{
		id: "mock-invite-1",
		email: "devon.carter@brightlabs.io",
		role: "member",
		invited_by: "019e5198-b827-7443-8af4-f39adb634b4e",
		expires_at: "2026-06-18T10:00:00Z",
		status: "pending",
	},
	{
		id: "mock-invite-2",
		email: "nina.kowalski@orbit.net",
		role: "admin",
		invited_by: "mock-aicha",
		expires_at: "2026-04-29T10:00:00Z",
		status: "expired",
	},
];

export async function listMembers(orgId: string): Promise<MemberResponse[]> {
	if (USE_MOCK) return MOCK_MEMBERS;
	const data = await apiFetch<MemberListResponse>(`/orgs/${orgId}/members`);
	return data.members;
}

export async function changeMemberRole(
	orgId: string,
	userId: string,
	role: "admin" | "member",
): Promise<MemberResponse> {
	if (USE_MOCK) {
		const member = MOCK_MEMBERS.find((m) => m.user_id === userId);
		if (!member) throw new Error("Member not found");
		return { ...member, role };
	}
	return apiFetch<MemberResponse>(`/orgs/${orgId}/members/${userId}`, {
		method: "PATCH",
		body: JSON.stringify({ role }),
	});
}

export async function removeMember(
	orgId: string,
	userId: string,
): Promise<void> {
	if (USE_MOCK) return;
	await apiFetch(`/orgs/${orgId}/members/${userId}`, {
		method: "DELETE",
	});
}

export async function listInvites(orgId: string): Promise<InviteResponse[]> {
	if (USE_MOCK) return MOCK_INVITES;
	const data = await apiFetch<InviteListResponse>(`/orgs/${orgId}/invites`);
	return data.invites;
}

export async function createInvite(
	orgId: string,
	email: string,
	role: CreateInviteRequest["role"],
): Promise<InviteResponse> {
	if (USE_MOCK) {
		return {
			id: `mock-invite-${Date.now()}`,
			email,
			role,
			invited_by: "019e5198-b827-7443-8af4-f39adb634b4e",
			expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
			status: "pending",
		};
	}
	return apiFetch<InviteResponse>(`/orgs/${orgId}/invites`, {
		method: "POST",
		body: JSON.stringify({ email, role } satisfies CreateInviteRequest),
	});
}

export async function revokeInvite(
	orgId: string,
	inviteId: string,
): Promise<void> {
	if (USE_MOCK) return;
	await apiFetch(`/orgs/${orgId}/invites/${inviteId}`, {
		method: "DELETE",
	});
}
