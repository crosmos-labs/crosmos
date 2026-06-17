import { notFound } from "next/navigation";
import { Visibility } from "@/components/visibility/visibility";
import { isVisibilityDisabled } from "@/lib/features";

export default function VisibilityPage() {
	if (isVisibilityDisabled) notFound();

	return <Visibility />;
}
