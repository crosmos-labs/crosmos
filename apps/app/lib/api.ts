import "server-only";

import { getAccessToken } from "./auth/cookies";

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
