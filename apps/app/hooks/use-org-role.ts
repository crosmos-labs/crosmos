import { useCurrentUser } from "@/hooks/use-current-user";

export function useOrgRole() {
	const { data: user } = useCurrentUser();
	const orgId = user?.active_org_id ?? null;
	const role = user?.active_org?.your_role;
	return {
		user,
		orgId,
		role,
		isOwnerAdmin: role === "owner" || role === "admin",
	};
}
