import "server-only";
import { getAccessToken, getActiveOrgId } from "./auth/cookies";
import { refreshTokens } from "./auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

export class ApiError extends Error {
	public readonly status: number;
	public readonly body: unknown;
	public readonly code: string | null;

	constructor(status: number, body: unknown) {
		let code: string | null = null;
		let message = `API error ${status}`;

		if (typeof body === "object" && body !== null) {
			const obj = body as Record<string, unknown>;
			if (typeof obj.error === "string") code = obj.error;
			if (typeof obj.message === "string") message = obj.message;
		}

		super(message);
		this.name = "ApiError";
		this.status = status;
		this.body = body;
		this.code = code;
	}
}

export async function apiFetch<T>(
	path: string,
	options: RequestInit & { orgId?: number } = {},
): Promise<T> {
	const { orgId, ...fetchOptions } = options;
	const accessToken = await getAccessToken();
	const activeOrgId = orgId ?? (await getActiveOrgId());

	const headers = new Headers(fetchOptions.headers);
	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}
	if (activeOrgId) {
		headers.set("X-Org-Id", String(activeOrgId));
	}
	if (!headers.has("Content-Type") && fetchOptions.body) {
		headers.set("Content-Type", "application/json");
	}

	let res = await fetch(`${API_URL}${path}`, {
		...fetchOptions,
		headers,
		cache: fetchOptions.cache ?? "no-store",
	});

	if (res.status === 401 && accessToken) {
		const refreshed = await refreshTokens();
		if (refreshed) {
			headers.set("Authorization", `Bearer ${refreshed.access_token}`);
			res = await fetch(`${API_URL}${path}`, {
				...fetchOptions,
				headers,
				cache: fetchOptions.cache ?? "no-store",
			});
		}
	}

	if (!res.ok) {
		let body: unknown;
		try {
			body = await res.json();
		} catch {
			body = await res.text();
		}
		throw new ApiError(res.status, body);
	}

	if (res.status === 204) {
		return undefined as T;
	}

	const text = await res.text();
	if (text.trim() === "") {
		return undefined as T;
	}

	return JSON.parse(text) as T;
}
