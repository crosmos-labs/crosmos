import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../cookie-config";

process.env.NEXT_PUBLIC_API_URL = "http://backend.test";

const realFetch = globalThis.fetch;
let fetchCalls = 0;

function mockRefresh(ok: boolean) {
	fetchCalls = 0;
	globalThis.fetch = (async () => {
		fetchCalls++;
		if (!ok) {
			return new Response(
				JSON.stringify({ error: { code: 401, message: "x" } }),
				{
					status: 401,
				},
			);
		}
		return new Response(
			JSON.stringify({
				access_token: "new.access.token",
				refresh_token: "new.refresh.token",
				active_org_id: "org1",
				user_id: "u1",
				email: "e@test.dev",
				name: "n",
				token_type: "bearer",
			}),
			{ status: 200 },
		);
	}) as typeof fetch;
}

afterEach(() => {
	globalThis.fetch = realFetch;
});

// Builds a JWT-shaped token whose `exp` is `seconds` from now.
function jwt(seconds: number): string {
	const payload = Buffer.from(
		JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds }),
	).toString("base64url");
	return `h.${payload}.s`;
}

function request(
	cookies: Record<string, string>,
	headers: Record<string, string> = {},
) {
	const cookie = Object.entries(cookies)
		.map(([k, v]) => `${k}=${v}`)
		.join("; ");
	return new NextRequest("https://app.test/dashboard", {
		headers: { cookie, ...headers },
	});
}

let proxy: typeof import("../../../proxy").proxy;
beforeEach(async () => {
	proxy = (await import("../../../proxy")).proxy;
});

describe("proxy refresh", () => {
	test("valid access token → no refresh, passes through", async () => {
		mockRefresh(true);
		const res = await proxy(
			request({ access_token: jwt(3600), refresh_token: "r" }),
		);
		expect(fetchCalls).toBe(0);
		expect(res.cookies.get(ACCESS_TOKEN_COOKIE)).toBeUndefined();
	});

	test("expired access token → refreshes and persists new cookies", async () => {
		mockRefresh(true);
		const res = await proxy(
			request({ access_token: jwt(-10), refresh_token: "r" }),
		);
		expect(fetchCalls).toBe(1);
		expect(res.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toBe(
			"new.access.token",
		);
		expect(res.cookies.get(REFRESH_TOKEN_COOKIE)?.value).toBe(
			"new.refresh.token",
		);
		expect(res.headers.get("cache-control")).toBe("no-store");
	});

	test("missing access token → refreshes", async () => {
		mockRefresh(true);
		const res = await proxy(request({ refresh_token: "r" }));
		expect(fetchCalls).toBe(1);
		expect(res.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toBe(
			"new.access.token",
		);
	});

	test("prefetch request → never refreshes", async () => {
		mockRefresh(true);
		await proxy(
			request(
				{ access_token: jwt(-10), refresh_token: "r" },
				{ "next-router-prefetch": "1" },
			),
		);
		expect(fetchCalls).toBe(0);
	});

	test("no refresh token → passes through", async () => {
		mockRefresh(true);
		await proxy(request({ access_token: jwt(-10) }));
		expect(fetchCalls).toBe(0);
	});

	test("refresh fails → clears cookies", async () => {
		mockRefresh(false);
		const res = await proxy(
			request({ access_token: jwt(-10), refresh_token: "r" }),
		);
		expect(fetchCalls).toBe(1);
		expect(res.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toBe("");
		expect(res.headers.get("cache-control")).toBe("no-store");
	});

	test("concurrent requests share one refresh", async () => {
		mockRefresh(true);
		await Promise.all([
			proxy(request({ access_token: jwt(-10), refresh_token: "r" })),
			proxy(request({ access_token: jwt(-10), refresh_token: "r" })),
			proxy(request({ access_token: jwt(-10), refresh_token: "r" })),
		]);
		expect(fetchCalls).toBe(1);
	});
});
