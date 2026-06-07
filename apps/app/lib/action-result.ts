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
