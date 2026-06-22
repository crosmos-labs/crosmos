import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isVisibilityDisabled } from "@/lib/features";

export default function GroupsLayout({ children }: { children: ReactNode }) {
	if (isVisibilityDisabled) notFound();

	return children;
}
