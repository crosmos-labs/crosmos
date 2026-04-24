import {
	IconActivity,
	IconBook,
	IconBrain,
	IconChartBar,
	IconCreditCard,
	IconDatabase,
	IconGalaxy,
	IconKey,
	IconPlayerPlay,
	IconSettings,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export interface NavItem {
	label: string;
	href: string;
	icon: ComponentType<{ className?: string }>;
	disabled?: boolean;
	external?: boolean;
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
			// {
			// 	label: "Entities",
			// 	href: "/entities",
			// 	icon: IconTopologyStarRing3,
			// 	disabled: true,
			// },
			{
				label: "Memories",
				href: "/memories",
				icon: IconBrain,
				disabled: true,
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
			{ label: "API Keys", href: "/api-key", icon: IconKey },
			{
				label: "Playground",
				href: "/playground",
				icon: IconPlayerPlay,
				disabled: true,
			},
		],
	},
	{
		label: "ACCOUNT",
		items: [
			{
				label: "Billing",
				href: "/billing",
				icon: IconCreditCard,
				disabled: true,
			},
			{
				label: "Settings",
				href: "/settings",
				icon: IconSettings,
				disabled: true,
			},
		],
	},
];

export const breadcrumbLabelMap: Record<string, string> = {
	"/": "Home",
	"/spaces": "Spaces",
	"/entities": "Entities",
	"/memories": "Memories",
	"/analytics": "Analytics",
	"/activity": "Activity",
	"/api-key": "API Keys",
	"/playground": "Playground",
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
