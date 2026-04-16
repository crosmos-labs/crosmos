import type { ComponentType } from "react";
import {
	IconHome,
	IconDatabase,
	IconTopologyStarRing3,
	IconBrain,
	IconChartBar,
	IconActivity,
	IconKey,
	IconPlayerPlay,
	IconCreditCard,
	IconSettings,
	IconBook,
} from "@tabler/icons-react";

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
	icon: IconHome,
};

export const navGroups: NavGroup[] = [
	{
		label: "MEMORY",
		items: [
			{ label: "Spaces", href: "/spaces", icon: IconDatabase },
			{ label: "Entities", href: "/entities", icon: IconTopologyStarRing3 },
			{ label: "Memories", href: "/memories", icon: IconBrain },
		],
	},
	{
		label: "INSIGHTS",
		items: [
			{ label: "Analytics", href: "/analytics", icon: IconChartBar },
			{ label: "Activity", href: "/activity", icon: IconActivity },
		],
	},
	{
		label: "DEVELOPER",
		items: [
			{ label: "API Key", href: "/api-key", icon: IconKey },
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

export const externalItems: NavItem[] = [
	{
		label: "Documentation",
		href: "https://docs.crosmos.ai",
		icon: IconBook,
		external: true,
	},
];
