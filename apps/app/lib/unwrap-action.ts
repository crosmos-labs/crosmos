import type { ActionResult } from "@/lib/action-result";

// Thrown on the client so status/code survive the server-action boundary.
export function unwrapAction<T>(result: ActionResult<T>): T {
	if (!result.ok) {
		throw Object.assign(new Error(result.message), {
			status: result.status,
			code: result.code,
		});
	}
	return result.data;
}
