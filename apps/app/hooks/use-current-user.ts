import useSWR from "swr";
import { getCurrentUser } from "@/actions/auth";
import type { AuthUser } from "@/lib/types/auth";

export function useCurrentUser() {
	return useSWR<AuthUser>("/auth/me", () => getCurrentUser());
}
