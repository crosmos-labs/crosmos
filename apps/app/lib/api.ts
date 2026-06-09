import "server-only";

import { redirect } from "next/navigation";
import { getAccessToken } from "./auth/cookies";
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
			// Backend envelope: { error: { code, message, error? } }
			if (typeof obj.error === "object" && obj.error !== null) {
				const error = obj.error as Record<string, unknown>;
				if (typeof error.error === "string") code = error.error;
				if (typeof error.message === "string") message = error.message;
			} else if (typeof obj.error === "string") {
				code = obj.error;
			}
			// Bare Starlette responses (e.g. 404/405) carry a string detail.
			if (typeof obj.detail === "string") message = obj.detail;
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
	options: RequestInit = {},
): Promise<T> {
	const accessToken = await getAccessToken();

	const headers = new Headers(options.headers);
	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}
	if (!headers.has("Content-Type") && options.body) {
		headers.set("Content-Type", "application/json");
	}

	const res = await fetch(`${API_URL}${path}`, {
		...options,
		headers,
		cache: options.cache ?? "no-store",
	});

	if (res.status === 401) {
		const refreshed = await refreshTokens();
		if (refreshed) {
			headers.set("Authorization", `Bearer ${refreshed.access_token}`);
			const retryRes = await fetch(`${API_URL}${path}`, {
				...options,
				headers,
				cache: options.cache ?? "no-store",
			});
			return parseResponse<T>(retryRes);
		}
		// Session is gone and can't be refreshed → sign in instead of surfacing a 401.
		redirect("/signup");
	}

	return parseResponse<T>(res);
}

async function parseResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const bodyText = await res.text();
		let body: unknown;
		try {
			body = JSON.parse(bodyText);
		} catch {
			body = bodyText;
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
