import { useCurrentUser } from "@/hooks/use-current-user";

export function useActiveOrgId(): string | null {
	const { data: user } = useCurrentUser();
	return user?.active_org_id ?? null;
}
