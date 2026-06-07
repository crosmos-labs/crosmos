import { notFound } from "next/navigation";
import SettingsClient from "@/app/(dashboard)/settings/settings-client";
import { isSettingsDisabled } from "@/lib/features";

export default function SettingsPage() {
	if (isSettingsDisabled) notFound();

	return <SettingsClient />;
}
