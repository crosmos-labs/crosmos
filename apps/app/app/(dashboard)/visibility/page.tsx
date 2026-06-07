import { notFound } from "next/navigation";
import VisibilityClient from "@/app/(dashboard)/visibility/visibility-client";
import { isVisibilityDisabled } from "@/lib/features";

export default function VisibilityPage() {
	if (isVisibilityDisabled) notFound();

	return <VisibilityClient />;
}
