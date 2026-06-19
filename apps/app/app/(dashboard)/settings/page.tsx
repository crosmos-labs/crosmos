import { notFound } from "next/navigation";
import { Settings } from "@/components/settings/settings";
import { isSettingsDisabled } from "@/lib/features";

export default function SettingsPage() {
	if (isSettingsDisabled) notFound();

	return <Settings />;
}
