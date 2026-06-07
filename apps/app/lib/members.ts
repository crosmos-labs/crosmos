import type { InviteResponse, MemberResponse, OrgRole } from "@/lib/types/org";

export type RowStatus = "active" | "pending" | "expired";
export type SortColumn = "name" | "email" | "role" | "status" | "joined";
export type SortDirection = "asc" | "desc";

export interface MemberRow {
	/** "member" for an active member, "invite" for a pending/expired invite. */
	kind: "member" | "invite";
	/** Stable row id: user_id for members, invite id for invites. */
	id: string;
	/** Present only for active members; null for invites. */
	userId: string | null;
	/** Display name — the member's name, or the invited email for invites. */
	name: string;
	email: string;
	role: OrgRole;
	status: RowStatus;
	/** member.joined_at; null for invites. */
	joinedAt: string | null;
	/** invite.expires_at; null for members. */
	expiresAt: string | null;
}

/** Merge active members and (pending/expired) invites into one row model. */
export function toMemberRows(
	members: MemberResponse[],
	invites: InviteResponse[],
): MemberRow[] {
	const memberRows: MemberRow[] = members.map((m) => ({
		kind: "member",
		id: m.user_id,
		userId: m.user_id,
		name: m.name || m.email,
		email: m.email,
		role: m.role,
		status: "active",
		joinedAt: m.joined_at,
		expiresAt: null,
	}));

	const inviteRows: MemberRow[] = invites
		// Accepted invites are dropped server-side, but guard anyway.
		.filter((i) => i.status !== "accepted")
		.map((i) => ({
			kind: "invite",
			id: i.id,
			userId: null,
			name: i.email,
			email: i.email,
			role: i.role,
			status: i.status === "expired" ? "expired" : "pending",
			joinedAt: null,
			expiresAt: i.expires_at,
		}));

	return [...memberRows, ...inviteRows];
}

const ROLE_RANK: Record<OrgRole, number> = { owner: 0, admin: 1, member: 2 };
const STATUS_RANK: Record<RowStatus, number> = {
	active: 0,
	pending: 1,
	expired: 2,
};

/** Compare two rows by the given column. Nulls (e.g. invite joined date) sort last regardless of direction. */
export function compareRows(
	a: MemberRow,
	b: MemberRow,
	column: SortColumn,
	direction: SortDirection,
): number {
	const dir = direction === "asc" ? 1 : -1;

	switch (column) {
		case "name":
			return (
				dir * a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
			);
		case "email":
			return (
				dir * a.email.localeCompare(b.email, undefined, { sensitivity: "base" })
			);
		case "role":
			return dir * (ROLE_RANK[a.role] - ROLE_RANK[b.role]);
		case "status":
			return dir * (STATUS_RANK[a.status] - STATUS_RANK[b.status]);
		case "joined": {
			if (a.joinedAt === b.joinedAt) return 0;
			if (a.joinedAt === null) return 1;
			if (b.joinedAt === null) return -1;
			return (
				dir * (new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
			);
		}
		default:
			return 0;
	}
}

/** Up to two initials from a display name, falling back to the email. */
export function getInitials(seed: string): string {
	const trimmed = seed.trim();
	if (!trimmed) return "?";
	const parts = trimmed.split(/\s+/).filter(Boolean);
	const first = parts[0] ?? "";
	if (parts.length >= 2) {
		const second = parts[1] ?? "";
		return ((first[0] ?? "") + (second[0] ?? "")).toUpperCase();
	}
	// Single token (a name or an email local-part).
	const token = first.includes("@") ? (first.split("@")[0] ?? first) : first;
	return token.slice(0, 2).toUpperCase() || "?";
}

/** Deterministic, readable avatar color derived from a seed (name/email). */
export function avatarColor(seed: string): {
	backgroundColor: string;
	color: string;
} {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = seed.charCodeAt(i) + ((hash << 5) - hash);
		hash |= 0;
	}
	const hue = Math.abs(hash) % 360;
	return {
		backgroundColor: `oklch(0.62 0.13 ${hue})`,
		color: "oklch(0.98 0 0)",
	};
}
