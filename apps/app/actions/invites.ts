"use server";

import { ApiError, apiFetch } from "@/lib/api";
import type {
	AcceptInviteRequest,
	AcceptInviteResponse,
	InvitePreviewResponse,
} from "@/lib/types/org";

// Returns a typed result instead of throwing so the client can branch on the
// exact status/slug (thrown server-action errors are redacted across the boundary).
export type InviteResult<T> =
	| { ok: true; data: T }
	| { ok: false; status: number; code: string | null; message: string };

function toError(err: unknown): {
	ok: false;
	status: number;
	code: string | null;
	message: string;
} {
	if (err instanceof ApiError) {
		return {
			ok: false,
			status: err.status,
			code: err.code,
			message: err.message,
		};
	}
	return { ok: false, status: 0, code: null, message: "Something went wrong" };
}

export async function previewInvite(
	token: string,
): Promise<InviteResult<InvitePreviewResponse>> {
	try {
		const data = await apiFetch<InvitePreviewResponse>(
			`/orgs/invites/preview?token=${encodeURIComponent(token)}`,
		);
		return { ok: true, data };
	} catch (err) {
		return toError(err);
	}
}

export async function acceptInvite(
	token: string,
): Promise<InviteResult<AcceptInviteResponse>> {
	try {
		const data = await apiFetch<AcceptInviteResponse>("/orgs/invites/accept", {
			method: "POST",
			body: JSON.stringify({ token } satisfies AcceptInviteRequest),
		});
		return { ok: true, data };
	} catch (err) {
		return toError(err);
	}
}
