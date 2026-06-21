import {
	IconActivity,
	IconBook,
	IconChartBar,
	IconCreditCard,
	IconCube,
	IconDatabase,
	IconEye,
	IconFileImport,
	IconGalaxy,
	IconKey,
	IconSettings,
	IconSparkles,
	IconTopologyComplex,
	IconUsers,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import {
	isPlaygroundDisabled,
	isSettingsDisabled,
	isVisibilityDisabled,
} from "@/lib/features";
import type { OrgRole } from "@/lib/types/org";

export interface NavItem {
	label: string;
	href: string;
	icon: ComponentType<{ className?: string }>;
	disabled?: boolean;
	external?: boolean;
	hidden?: boolean;
	roles?: OrgRole[];
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const homeItem: NavItem = {
	label: "Home",
	href: "/",
	icon: IconGalaxy,
};

export const navGroups: NavGroup[] = [
	{
		label: "MEMORY",
		items: [
			{ label: "Spaces", href: "/spaces", icon: IconDatabase },
			{ label: "Sources", href: "/sources", icon: IconFileImport },
			{ label: "Graph", href: "/graph", icon: IconTopologyComplex },
		],
	},
	{
		label: "WORKSPACE",
		items: [
			{
				label: "Members",
				href: "/members",
				icon: IconUsers,
				hidden: isSettingsDisabled,
			},
			{
				label: "Groups",
				href: "/groups",
				icon: IconCube,
				hidden: isVisibilityDisabled,
				roles: ["owner", "admin"],
			},
			{
				label: "Access",
				href: "/access",
				icon: IconEye,
				hidden: isVisibilityDisabled,
				roles: ["owner", "admin"],
			},
		],
	},
	{
		label: "INSIGHTS",
		items: [
			{
				label: "Analytics",
				href: "/analytics",
				icon: IconChartBar,
				disabled: true,
			},
			{
				label: "Activity",
				href: "/activity",
				icon: IconActivity,
				disabled: true,
			},
		],
	},
	{
		label: "DEVELOPER",
		items: [
			{
				label: "Playground",
				href: "/playground",
				icon: IconSparkles,
				hidden: isPlaygroundDisabled,
			},
			{ label: "API Keys", href: "/api-key", icon: IconKey },
		],
	},
	{
		label: "ACCOUNT",
		items: [
			{
				label: "Billing",
				href: "/billing",
				icon: IconCreditCard,
			},
			{
				label: "Settings",
				href: "/settings",
				icon: IconSettings,
				hidden: isSettingsDisabled,
			},
		],
	},
];

export const breadcrumbLabelMap: Record<string, string> = {
	"/": "Home",
	"/spaces": "Spaces",
	"/sources": "Sources",
	"/graph": "Graph",
	"/members": "Members",
	"/groups": "Groups",
	"/access": "Access",
	"/playground": "Playground",
	"/analytics": "Analytics",
	"/activity": "Activity",
	"/api-key": "API Keys",
	"/billing": "Billing",
	"/settings": "Settings",
};

export const externalItems: NavItem[] = [
	{
		label: "Documentation",
		href: "https://docs.crosmos.dev",
		icon: IconBook,
		external: true,
	},
];
