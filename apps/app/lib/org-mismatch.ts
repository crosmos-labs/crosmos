// The API returns 404 `not_found` for org-scoped routes when the path org isn't
// the token's active org (anti-enumeration). During normal use that usually
// means the active org changed in another tab, not that the resource is gone —
// a recoverable "refresh" state rather than a hard error.
//
// Duck-typed (not `instanceof ApiError`): this runs in client components, and
// `lib/api` is server-only. The SWR fetchers that feed this throw a client-side
// error carrying `status`/`code` (see hooks/use-visibility.ts).
export function isOrgScopeMismatch(err: unknown): boolean {
	return (
		typeof err === "object" &&
		err !== null &&
		"status" in err &&
		(err as { status?: unknown }).status === 404 &&
		"code" in err &&
		(err as { code?: unknown }).code === "not_found"
	);
}
