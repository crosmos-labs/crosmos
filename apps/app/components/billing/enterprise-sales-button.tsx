"use client";

import { Button } from "@crosmos/ui/components/button";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useMemo } from "react";
import { useCalApi } from "@/hooks/use-cal-api";
import { useOrgRole } from "@/hooks/use-org-role";

const SALES_CAL_NAMESPACE = "30min";
const SALES_CAL_LINK = "crosmos/30min";

export function EnterpriseSalesButton({
	className,
	onClick,
}: {
	className?: string;
	onClick?: () => void;
}) {
	const { user } = useOrgRole();
	const initCal = useCalApi(SALES_CAL_NAMESPACE);

	const salesCalConfig = useMemo(
		() =>
			JSON.stringify({
				layout: "month_view",
				useSlotsViewOnSmallScreen: "true",
				...(user?.name ? { name: user.name } : {}),
				...(user?.email ? { email: user.email } : {}),
			}),
		[user?.name, user?.email],
	);

	return (
		<Button
			variant="ghost"
			size="sm"
			className={className}
			data-cal-namespace={SALES_CAL_NAMESPACE}
			data-cal-link={SALES_CAL_LINK}
			data-cal-config={salesCalConfig}
			onPointerEnter={initCal}
			onFocus={initCal}
			onClick={onClick}
		>
			Talk to sales about Enterprise
			<IconArrowUpRight data-icon="inline-end" />
		</Button>
	);
}
