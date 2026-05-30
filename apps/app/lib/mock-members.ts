// TEMP: mock data for the Members section until the backend endpoints are live.
// Delete this file and its usages in app/(dashboard)/settings/page.tsx (the
// `USE_MOCK_DATA` block) once GET /members and GET /invites return real data.
import type { InviteResponse, MemberResponse } from "@/lib/types/org";

export function mockMembers(self?: {
	userId: string | null;
	email?: string;
	name?: string;
}): MemberResponse[] {
	return [
		{
			user_id: self?.userId ?? "mock-self",
			email: self?.email ?? "you@example.com",
			name: self?.name || "You",
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
}

export const MOCK_INVITES: InviteResponse[] = [
	{
		id: "mock-invite-1",
		email: "devon.carter@brightlabs.io",
		role: "member",
		invited_by: "mock-self",
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
