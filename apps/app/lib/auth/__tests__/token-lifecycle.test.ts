/**
 * Data-layer behaviour — runs the REAL api.ts / session.ts / cookies.ts against
 * the faithful backend + cookie-phase mocks in ./harness.ts. Covers refresh in
 * writable phases (server actions / route handler), concurrent dedup, terminal
 * logout, the P4 residual, and ApiError envelope parsing. Render-phase refresh
 * is the proxy's job and is covered in proxy.test.ts.
 *
 * Run:  bun test apps/app/lib/auth/__tests__/token-lifecycle.test.ts
 */

import { beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	type Clock,
	CookieStore,
	DAY_MS,
	FakeBackend,
	makeClock,
	Tracer,
} from "./harness";

// ── Wire the mocks BEFORE importing the code under test ──────────────────

process.env.NEXT_PUBLIC_API_URL = "http://backend.test";

const cookieController = { current: null as unknown as CookieStore };

mock.module("server-only", () => ({}));
mock.module("next/headers", () => ({
	cookies: async () => cookieController.current,
}));
mock.module("next/navigation", () => ({
	redirect: (url: string) => {
		throw new Error(`NEXT_REDIRECT:${url}`);
	},
}));

// Code under test (imported dynamically after mocks are installed).
type ApiMod = typeof import("../../api");
type SessionMod = typeof import("../session");
type CookiesMod = typeof import("../cookies");
let api: ApiMod;
let session: SessionMod;
let cookies: CookiesMod;

beforeAll(async () => {
	api = await import("../../api");
	session = await import("../session");
	cookies = await import("../cookies");
});

// ── Per-scenario setup ───────────────────────────────────────────────────

let clock: Clock;
let tracer: Tracer;
let store: CookieStore;
let backend: FakeBackend;

function setup(cfg?: { accessTtlMs?: number; refreshTtlMs?: number }) {
	clock = makeClock();
	tracer = new Tracer(clock);
	store = new CookieStore(clock, tracer);
	backend = new FakeBackend(clock, tracer, cfg ?? {});
	cookieController.current = store;
	globalThis.fetch = backend.fetch as typeof fetch;
	tracer.begin();
}

/** Simulate a fresh login: backend mints a pair, real cookies.ts persists it. */
async function seedLogin() {
	store.phase = "action";
	const pair = backend.mint();
	await cookies.setAuthCookies(pair.access_token, pair.refresh_token);
}

function summary(extra: Record<string, unknown>) {
	return {
		me: backend.count("/auth/me"),
		refresh: backend.count("/auth/refresh"),
		protected: backend.count("/orgs"),
		"cookie.writeOk": store.writeOk,
		"cookie.writeThrew": store.writeThrew,
		...extra,
	};
}

beforeEach(() => setup());

// ─────────────────────────────────────────────────────────────────────────

describe("token lifecycle", () => {
	test("S1 happy path — valid access JWT, render phase", async () => {
		await seedLogin();
		store.phase = "render";
		store.writeOk = 0; // reset counters after seed
		store.writeThrew = 0;
		tracer.begin();

		const user = await session.verifyAuth();

		tracer.dump("S1 happy path (render)", summary({ user: user?.user_id }));

		// Valid token → /auth/me once, no refresh, no cookie writes attempted.
		expect(user).not.toBeNull();
		expect(user?.active_org).toEqual({
			id: "org1",
			slug: "test",
			name: "Test Org",
			your_role: "owner",
		});
		expect(backend.count("/auth/me")).toBe(1);
		expect(backend.count("/auth/refresh")).toBe(0);
		expect(store.writeThrew).toBe(0);
	});

	test("S3 access JWT expired, cookie present, ACTION → apiFetch refreshes & retries", async () => {
		await seedLogin();
		await reseedExpiredAccessButCookiePresent();
		store.phase = "action";
		store.writeOk = 0;
		store.writeThrew = 0;
		tracer.begin();

		const data = await api.apiFetch<{ ok: boolean }>("/orgs");

		tracer.dump(
			"S3 expired JWT, cookie present, ACTION (apiFetch)",
			summary({ data }),
		);

		// 1st /orgs → 401, refresh → 200, retry /orgs → 200. Cookies updated.
		expect(data).toEqual({ ok: true, data: [] } as never);
		expect(backend.count("/auth/refresh")).toBe(1);
		expect(backend.count("/orgs")).toBe(2);
		expect(store.writeThrew).toBe(0);
		expect(store.writeOk).toBeGreaterThan(0);
	});

	test("S4 (P2 FIXED via maxAge align) access cookie aged 8d, ACTION → still present → 401 → refresh", async () => {
		await seedLogin();
		clock.advance(8 * DAY_MS); // PRE-FIX: access cookie (7d) evicted → 403. NOW maxAge=30d → present.
		store.phase = "action";
		store.writeOk = 0;
		store.writeThrew = 0;
		tracer.begin();

		const data = await api.apiFetch<{ ok: boolean }>("/orgs");

		tracer.dump(
			"S4 access cookie aged 8d, ACTION (apiFetch)",
			summary({ data }),
		);

		// Access cookie no longer evicted before the refresh cookie → an expired
		// token is still sent → 401 → refresh → retry 200 (no unrefreshable 403).
		expect(data).toEqual({ ok: true, data: [] } as never);
		expect(backend.count("/auth/refresh")).toBe(1);
		expect(backend.count("/orgs")).toBe(2);
	});

	test("S6 access cookie absent, ACTION → verifyAuth proactive refresh persists", async () => {
		await seedLogin();
		store.phase = "action";
		store.delete("access_token");
		store.writeOk = 0;
		store.writeThrew = 0;
		tracer.begin();

		const user = await session.verifyAuth();

		tracer.dump(
			"S6 access cookie absent, ACTION (verifyAuth)",
			summary({ user: user?.user_id }),
		);

		// Writable phase → refresh persists → /auth/me 200 → user.
		expect(user).not.toBeNull();
		expect(backend.count("/auth/refresh")).toBe(1);
		expect(backend.count("/auth/me")).toBe(1);
		expect(store.writeThrew).toBe(0);
		expect(store.writeOk).toBeGreaterThan(0);
	});

	test("S7 refresh token revoked, ACTION → clears cookies + redirects to sign in", async () => {
		await seedLogin();
		// Revoke the refresh token (as /auth/logout would), keep access expired.
		const refresh = store.snapshot().refresh_token;
		await backend.fetch("http://backend.test/auth/logout", {
			method: "POST",
			body: JSON.stringify({ refresh_token: refresh }),
		});
		await reseedExpiredAccessButCookiePresent();
		store.phase = "action";
		store.writeOk = 0;
		store.writeThrew = 0;
		tracer.begin();

		let err: unknown;
		try {
			await api.apiFetch("/orgs");
		} catch (e) {
			err = e;
		}

		tracer.dump(
			"S7 refresh revoked, ACTION",
			summary({
				thrown: (err as Error)?.message,
				cookiesAfter: Object.keys(store.snapshot()),
			}),
		);

		// 401 → refresh → 401 (revoked) → clearAuthCookies → redirect to sign in.
		expect((err as Error).message).toBe("NEXT_REDIRECT:/signup");
		expect(backend.count("/auth/refresh")).toBe(1);
		expect(Object.keys(store.snapshot())).toHaveLength(0); // cookies cleared
	});

	test("S9 concurrent apiFetch dedupes into a single /auth/refresh", async () => {
		await seedLogin();
		await reseedExpiredAccessButCookiePresent();
		store.phase = "action";
		store.writeOk = 0;
		store.writeThrew = 0;
		tracer.begin();

		const results = await Promise.all([
			api.apiFetch<{ ok: boolean }>("/orgs"),
			api.apiFetch<{ ok: boolean }>("/orgs"),
			api.apiFetch<{ ok: boolean }>("/orgs"),
		]);

		tracer.dump(
			"S9 concurrent refresh dedup",
			summary({ results: results.length }),
		);

		// inFlightRefresh dedup → 3 concurrent 401s share ONE refresh.
		expect(results).toHaveLength(3);
		expect(backend.count("/auth/refresh")).toBe(1);
	});

	test("S10 (issue #1) logout revokes refresh but the access token still works", async () => {
		await seedLogin();
		const access = store.snapshot().access_token;
		const refresh = store.snapshot().refresh_token;

		// Logout: backend revokes the refresh token.
		await backend.fetch("http://backend.test/auth/logout", {
			method: "POST",
			body: JSON.stringify({ refresh_token: refresh }),
		});
		clock.advance(1 * DAY_MS); // well within the 7-day access TTL
		store.phase = "action";
		backend.calls = [];
		tracer.begin();

		// The access token is still in the cookie and still validates server-side.
		const ok = await api.apiFetch<{ ok: boolean }>("/orgs");
		// And the (revoked) refresh token can no longer mint new tokens.
		const refreshAfterLogout = await backend.fetch(
			"http://backend.test/auth/refresh",
			{
				method: "POST",
				body: JSON.stringify({ refresh_token: refresh }),
			},
		);

		tracer.dump(
			"S10 access token outlives logout",
			summary({
				accessStillAccepted: !!ok,
				refreshAfterLogoutStatus: refreshAfterLogout.status,
				accessTokenPrefix: access.slice(0, 12),
			}),
		);

		// Core of issue #1: logout revokes the refresh token, but a 7-day access
		// token keeps working until its natural expiry.
		expect(ok).toEqual({ ok: true, data: [] } as never);
		expect(refreshAfterLogout.status).toBe(401);
	});
});

describe("ApiError envelope parsing (P5/P6)", () => {
	test("structured error → code + message", () => {
		const err = new api.ApiError(409, {
			error: { code: 409, error: "slug_taken", message: "Slug already taken" },
		});
		expect(err.code).toBe("slug_taken");
		expect(err.message).toBe("Slug already taken");
	});

	test("message-only envelope → message, no code", () => {
		const err = new api.ApiError(401, {
			error: { code: 401, message: "Token has expired" },
		});
		expect(err.code).toBeNull();
		expect(err.message).toBe("Token has expired");
	});

	test("bare Starlette detail string → message", () => {
		const err = new api.ApiError(404, { detail: "Not Found" });
		expect(err.message).toBe("Not Found");
	});

	test("non-object body → generic message", () => {
		const err = new api.ApiError(500, "boom");
		expect(err.code).toBeNull();
		expect(err.message).toBe("API error 500");
	});
});

// ── helpers ──────────────────────────────────────────────────────────────

/** Access cookie present but its JWT already expired; refresh cookie left valid. */
async function reseedExpiredAccessButCookiePresent() {
	const prevPhase = store.phase;
	store.phase = "action";
	const expiredAccess = `acc.u1.org1.${clock.now() - 1000}`;
	await cookies.setAccessTokenCookie(expiredAccess);
	store.phase = prevPhase;
}
