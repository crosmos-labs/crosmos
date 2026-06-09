import { unstable_rethrow } from "next/navigation";
import { ApiError } from "@/lib/api";

// Returned by server actions instead of throwing, so the client can branch on
// the exact status/slug — thrown server-action errors are redacted across the
// server/client boundary in production.
export type ActionResult<T> =
	| { ok: true; data: T }
	| { ok: false; status: number; code: string | null; message: string };

export function toActionError(err: unknown): {
	ok: false;
	status: number;
	code: string | null;
	message: string;
} {
	// Let framework errors (e.g. the redirect thrown by apiFetch on an
	// unrefreshable 401) propagate instead of becoming a generic action error.
	unstable_rethrow(err);
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
