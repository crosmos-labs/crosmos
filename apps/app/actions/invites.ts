"use server";

import { setActiveOrg } from "@/actions/auth";
import { type ActionResult, toActionError } from "@/lib/action-result";
import { apiFetch } from "@/lib/api";
import type {
	AcceptInviteRequest,
	AcceptInviteResponse,
	InvitePreviewResponse,
} from "@/lib/types/org";

export async function previewInvite(
	token: string,
): Promise<ActionResult<InvitePreviewResponse>> {
	try {
		const data = await apiFetch<InvitePreviewResponse>(
			`/orgs/invites/preview?token=${encodeURIComponent(token)}`,
		);
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}

export async function acceptInvite(
	token: string,
): Promise<ActionResult<AcceptInviteResponse>> {
	try {
		const data = await apiFetch<AcceptInviteResponse>("/orgs/invites/accept", {
			method: "POST",
			body: JSON.stringify({ token } satisfies AcceptInviteRequest),
		});
		// Switch the session to the just-joined org (best-effort — the user has
		// joined regardless; the accept page reloads into "/" afterwards).
		try {
			await setActiveOrg(data.org.id);
		} catch {}
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}
