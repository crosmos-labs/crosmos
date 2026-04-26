import useSWRImmutable from "swr/immutable";
import { getCurrentUser } from "@/actions/auth";
import type { AuthUser } from "@/lib/types/auth";

export function useCurrentUser() {
	return useSWRImmutable<AuthUser>("/auth/me", () => getCurrentUser());
}
