import "server-only";
import { getAccessToken } from "./auth/cookies";
import { refreshTokens } from "./auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

export class ApiError extends Error {
	constructor(
		public status: number,
		public body: unknown,
	) {
		super(`API error ${status}`);
		this.name = "ApiError";
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

	let res = await fetch(`${API_URL}${path}`, {
		...options,
		headers,
		cache: options.cache ?? "no-store",
	});

	if (res.status === 401 && accessToken) {
		const refreshed = await refreshTokens();
		if (refreshed) {
			headers.set("Authorization", `Bearer ${refreshed.access_token}`);
			res = await fetch(`${API_URL}${path}`, {
				...options,
				headers,
				cache: options.cache ?? "no-store",
			});
		}
	}

	if (!res.ok) {
		const body = await res.text();
		throw new ApiError(res.status, body);
	}

	return res.json() as Promise<T>;
}
