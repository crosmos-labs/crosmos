import {
	IconActivity,
	IconBook,
	IconChartBar,
	IconCreditCard,
	IconDatabase,
	IconEye,
	IconFileImport,
	IconGalaxy,
	IconKey,
	IconSettings,
	IconSparkles,
	IconTopologyComplex,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import type { OrgRole } from "@/lib/types/org";

export interface NavItem {
	label: string;
	href: string;
	icon: ComponentType<{ className?: string }>;
	disabled?: boolean;
	external?: boolean;
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
			{
				label: "Visibility",
				href: "/visibility",
				icon: IconEye,
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
			{ label: "Playground", href: "/playground", icon: IconSparkles, disabled: true },
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
			},
		],
	},
];

export const breadcrumbLabelMap: Record<string, string> = {
	"/": "Home",
	"/spaces": "Spaces",
	"/sources": "Sources",
	"/graph": "Graph",
	"/visibility": "Visibility",
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
