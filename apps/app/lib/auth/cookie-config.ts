// Cookie names, options, and lifetimes shared by the server-only cookie helpers
// (lib/auth/cookies.ts) and the proxy (proxy.ts), so the two stay in sync.

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const OAUTH_STATE_COOKIE = "oauth_state";
export const ACTIVE_ORG_COOKIE = "active_org_id";
export const INVITE_TOKEN_COOKIE = "invite_token";
export const AUTH_ERROR_COOKIE = "auth_error";

const DAY = 24 * 60 * 60;
export const REFRESH_TOKEN_MAX_AGE = 30 * DAY;
// Matched to the refresh cookie so the (possibly expired) access token is always
// sent, yielding a refreshable 401 instead of a 403 on a missing header.
export const ACCESS_TOKEN_MAX_AGE = REFRESH_TOKEN_MAX_AGE;
export const ACTIVE_ORG_MAX_AGE = 365 * DAY;
export const AUTH_ERROR_MAX_AGE = 60;

export const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const,
	path: "/",
};

// Client-readable on purpose: the signup page consumes (reads + deletes) the
// flash error slug in the browser; it carries no sensitive data.
export const FLASH_COOKIE_OPTIONS = {
	...COOKIE_OPTIONS,
	httpOnly: false,
};
