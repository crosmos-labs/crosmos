"use server";

import { apiFetch } from "@/lib/api";
import type { Usage } from "@/lib/types/usage";

export async function getUsage(): Promise<Usage> {
	return apiFetch<Usage>("/usage");
}