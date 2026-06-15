/**
 * Test harness for the auth token lifecycle.
 *
 * Goal: run the REAL frontend code (lib/api.ts, lib/auth/session.ts,
 * lib/auth/cookies.ts — all unmodified) against:
 *   1. a faithful mock of the FastAPI backend's status-code behavior, and
 *   2. a Next.js cookie store that enforces the render/action phase rule.
 *
 * Every assumption about the backend is an AUDITABLE CONSTANT below. If your
 * reading of crosmos-mem differs, change the constant and re-run — the
 * diagnosis updates accordingly. Nothing here hard-codes a conclusion.
 *
 * Backend behavior is mirrored from (paths relative to ~/Work/crosmos/crosmos-mem):
 *   - HTTPBearer(auto_error=True) → 403 when the Authorization header is ABSENT,
 *     401 when a token is present but expired/invalid.
 *       app/api/auth/dependencies.py:55 (_bearer_scheme), :85 (expired), :87 (invalid)
 *   - Error envelope is rewritten to {"error": {"code", "message", "error"?}}.
 *       app/main.py:115-126 (HTTPException handler)
 *   - /auth/refresh returns a new pair or 401 (expired/revoked/invalid).
 *       app/api/auth/routes.py:68-105
 *   - /auth/me returns {user_id,email,name,org:{...}}.
 *       app/api/auth/routes.py:178-184
 *   - /auth/logout revokes the refresh token, access tokens stay valid to exp.
 *       app/api/auth/routes.py:138-161
 *   - Token TTLs: access = 7 days, refresh = 30 days.
 *       app/engine/config.py (jwt_access_token_expire_minutes = 60*24*7,
 *                             jwt_refresh_token_expire_days = 30)
 *
 * Next.js cookie rule verified via Context7 (/vercel/next.js):
 *   cookieStore.set/delete throw ReadonlyRequestCookiesError unless the request
 *   phase === 'action' (Server Action / Route Handler / Middleware). Render is
 *   read-only.
 */

// ── Auditable backend constants ─────────────────────────────────────────

/** FastAPI HTTPBearer returns this when the Authorization header is missing. */
export const MISSING_AUTH_STATUS = 403;

export const DAY_MS = 24 * 60 * 60 * 1000;
export const MIN_MS = 60 * 1000;

/** Mirrors app/engine/config.py. */
export const ACCESS_TTL_MS = 7 * DAY_MS;
export const REFRESH_TTL_MS = 30 * DAY_MS;

/** Simulated network latency per endpoint (ms of real wall-clock). */
export const LATENCY = {
	me: 25,
	refresh: 40,
	logout: 15,
	protected: 20,
};

// ── Virtual clock (simulates the passage of days) ───────────────────────

export interface Clock {
	now(): number;
	advance(ms: number): void;
	reset(): void;
	label(): string;
}

export function makeClock(): Clock {
	let t = 0;
	return {
		now: () => t,
		advance: (ms) => {
			t += ms;
		},
		reset: () => {
			t = 0;
		},
		label: () => `T+${(t / DAY_MS).toFixed(2)}d`,
	};
}

// ── Tracer (flow + timing) ──────────────────────────────────────────────

interface TraceEvent {
	dt: number;
	kind: string;
	msg: string;
}

export class Tracer {
	private start = 0;
	private events: TraceEvent[] = [];
	private clock: Clock;

	constructor(clock: Clock) {
		this.clock = clock;
	}

	begin() {
		this.start = performance.now();
		this.events = [];
	}

	log(kind: string, msg: string) {
		this.events.push({
			dt: performance.now() - this.start,
			kind,
			msg,
		});
	}

	dump(title: string, summary: Record<string, unknown>) {
		const lines = [`\n┌─ ${title}  (clock ${this.clock.label()})`];
		for (const e of this.events) {
			const t = `+${e.dt.toFixed(1)}ms`.padEnd(10);
			lines.push(`│ ${t} ${e.kind.padEnd(14)} ${e.msg}`);
		}
		const sum = Object.entries(summary)
			.map(([k, v]) => `${k}=${JSON.stringify(v)}`)
			.join("  ");
		lines.push(`└─ ${sum}\n`);
		console.log(lines.join("\n"));
	}
}

// ── Fake Next.js cookie store (render vs action phase) ───────────────────

export type Phase = "render" | "action" | "route";

export class ReadonlyRequestCookiesError extends Error {
	constructor() {
		super(
			"Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options",
		);
		this.name = "ReadonlyRequestCookiesError";
	}
}

interface StoredCookie {
	value: string;
	maxAgeMs: number;
	setAtMs: number;
}

export class CookieStore {
	private map = new Map<string, StoredCookie>();
	phase: Phase = "action";
	writeOk = 0;
	writeThrew = 0;

	constructor(
		private clock: Clock,
		private tracer: Tracer,
	) {}

	private evicted(_name: string, c: StoredCookie): boolean {
		return this.clock.now() > c.setAtMs + c.maxAgeMs;
	}

	get(name: string): { name: string; value: string } | undefined {
		const c = this.map.get(name);
		if (!c) {
			this.tracer.log("cookie.get", `${name} → absent`);
			return undefined;
		}
		if (this.evicted(name, c)) {
			const age = ((this.clock.now() - c.setAtMs) / DAY_MS).toFixed(2);
			this.tracer.log(
				"cookie.get",
				`${name} → EVICTED (age ${age}d > maxAge ${(c.maxAgeMs / DAY_MS).toFixed(0)}d)`,
			);
			return undefined;
		}
		this.tracer.log("cookie.get", `${name} → present`);
		return { name, value: c.value };
	}

	set(name: string, value: string, opts?: { maxAge?: number }) {
		if (this.phase === "render") {
			this.writeThrew++;
			this.tracer.log(
				"cookie.set",
				`${name} ✖ THROW ReadonlyRequestCookiesError (phase=render)`,
			);
			throw new ReadonlyRequestCookiesError();
		}
		this.map.set(name, {
			value,
			maxAgeMs: (opts?.maxAge ?? 0) * 1000,
			setAtMs: this.clock.now(),
		});
		this.writeOk++;
		this.tracer.log(
			"cookie.set",
			`${name} ✓ (maxAge ${((opts?.maxAge ?? 0) / 86400).toFixed(0)}d)`,
		);
	}

	delete(name: string) {
		if (this.phase === "render") {
			this.writeThrew++;
			this.tracer.log(
				"cookie.del",
				`${name} ✖ THROW ReadonlyRequestCookiesError (phase=render)`,
			);
			throw new ReadonlyRequestCookiesError();
		}
		this.map.delete(name);
		this.writeOk++;
		this.tracer.log("cookie.del", `${name} ✓`);
	}

	snapshot(): Record<string, string> {
		const out: Record<string, string> = {};
		for (const [name, c] of this.map) {
			if (!this.evicted(name, c)) out[name] = c.value;
		}
		return out;
	}
}

// ── Fake backend (mirrors crosmos-mem status codes + envelopes) ──────────

interface BackendCall {
	method: string;
	path: string;
	status: number;
}

export interface BackendConfig {
	accessTtlMs?: number;
	refreshTtlMs?: number;
}

export class FakeBackend {
	calls: BackendCall[] = [];
	private revoked = new Set<string>();
	private jti = 0;
	private accessTtl: number;
	private refreshTtl: number;

	constructor(
		private clock: Clock,
		private tracer: Tracer,
		cfg: BackendConfig = {},
	) {
		this.accessTtl = cfg.accessTtlMs ?? ACCESS_TTL_MS;
		this.refreshTtl = cfg.refreshTtlMs ?? REFRESH_TTL_MS;
	}

	count(path: string): number {
		return this.calls.filter((c) => c.path === path).length;
	}

	/** Mint a token pair as the backend would (used to seed a "logged in" state). */
	mint(userId = "u1", orgId = "org1") {
		const access = `acc.${userId}.${orgId}.${this.clock.now() + this.accessTtl}`;
		const jti = `j${++this.jti}`;
		const refresh = `ref.${userId}.${jti}.${this.clock.now() + this.refreshTtl}`;
		return { access_token: access, refresh_token: refresh };
	}

	private envelope(code: number, message: string) {
		return JSON.stringify({ error: { code, message } });
	}

	private checkAccess(
		auth: string | null,
	):
		| { ok: true; userId: string; orgId: string }
		| { ok: false; res: Response } {
		if (!auth) {
			return {
				ok: false,
				res: new Response(
					this.envelope(MISSING_AUTH_STATUS, "Not authenticated"),
					{
						status: MISSING_AUTH_STATUS,
					},
				),
			};
		}
		const token = auth.replace(/^Bearer\s+/i, "");
		const parts = token.split(".");
		if (parts[0] !== "acc") {
			return {
				ok: false,
				res: new Response(this.envelope(401, "Invalid token"), { status: 401 }),
			};
		}
		const expMs = Number(parts[3]);
		if (expMs <= this.clock.now()) {
			return {
				ok: false,
				res: new Response(this.envelope(401, "Token has expired"), {
					status: 401,
				}),
			};
		}
		return { ok: true, userId: parts[1], orgId: parts[2] };
	}

	private meBody(userId: string, orgId: string) {
		return JSON.stringify({
			user_id: userId,
			email: "u@test.dev",
			name: "Test User",
			org: { id: orgId, slug: "test", name: "Test Org", role: "owner" },
		});
	}

	/** Drop-in replacement for global fetch. */
	fetch = async (
		url: string | URL | Request,
		init: RequestInit = {},
	): Promise<Response> => {
		const u = typeof url === "string" ? url : url.toString();
		const path = new URL(u).pathname;
		const method = (init.method ?? "GET").toUpperCase();
		const headers = new Headers(init.headers as HeadersInit);
		const auth = headers.get("authorization");

		const record = (status: number) => {
			this.calls.push({ method, path, status });
			this.tracer.log("net.recv", `${status} ← ${method} ${path}`);
		};

		// /auth/me  (and the generic protected route /orgs)
		if (path === "/auth/me" || path === "/orgs") {
			this.tracer.log(
				"net.send",
				`${method} ${path}  Authorization=${auth ? "Bearer …" : "(none)"}`,
			);
			await sleep(path === "/auth/me" ? LATENCY.me : LATENCY.protected);
			const v = this.checkAccess(auth);
			if (!v.ok) {
				record(v.res.status);
				return v.res;
			}
			record(200);
			const body =
				path === "/auth/me"
					? this.meBody(v.userId, v.orgId)
					: JSON.stringify({ ok: true, data: [] });
			return new Response(body, { status: 200 });
		}

		// /auth/refresh
		if (path === "/auth/refresh") {
			this.tracer.log("net.send", `POST /auth/refresh`);
			await sleep(LATENCY.refresh);
			const body = JSON.parse((init.body as string) ?? "{}");
			const parts = String(body.refresh_token ?? "").split(".");
			if (parts[0] !== "ref") {
				record(401);
				return new Response(this.envelope(401, "Invalid refresh token"), {
					status: 401,
				});
			}
			const jti = parts[2];
			const expMs = Number(parts[3]);
			if (this.revoked.has(jti)) {
				record(401);
				return new Response(
					this.envelope(401, "Refresh token has been revoked"),
					{
						status: 401,
					},
				);
			}
			if (expMs <= this.clock.now()) {
				record(401);
				return new Response(this.envelope(401, "Refresh token has expired"), {
					status: 401,
				});
			}
			const orgId = body.active_org_id ?? "org1";
			const pair = this.mint(parts[1], orgId);
			record(200);
			return new Response(
				JSON.stringify({
					...pair,
					user_id: parts[1],
					email: "u@test.dev",
					name: "Test User",
					token_type: "bearer",
					active_org_id: orgId,
				}),
				{ status: 200 },
			);
		}

		// /auth/logout
		if (path === "/auth/logout") {
			this.tracer.log("net.send", `POST /auth/logout`);
			await sleep(LATENCY.logout);
			const body = JSON.parse((init.body as string) ?? "{}");
			const parts = String(body.refresh_token ?? "").split(".");
			if (parts[0] === "ref") this.revoked.add(parts[2]);
			record(204);
			return new Response(null, { status: 204 });
		}

		record(404);
		return new Response(this.envelope(404, "Not Found"), { status: 404 });
	};
}

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}
