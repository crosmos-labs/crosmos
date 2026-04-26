"use server";

import { apiFetch } from "@/lib/api";

export interface DashboardStatus {
	hasSpaces: boolean;
	hasActiveKey: boolean;
}

export async function getDashboardStatus(): Promise<DashboardStatus> {
	const [spacesRes, keysRes] = await Promise.all([
		apiFetch<{ spaces: { id: string }[] }>("/spaces"),
		apiFetch<{ keys: { id: number; is_active: boolean }[] }>("/auth/keys"),
	]);

	return {
		hasSpaces: spacesRes.spaces.length > 0,
		hasActiveKey: keysRes.keys.some((k) => k.is_active),
	};
}
