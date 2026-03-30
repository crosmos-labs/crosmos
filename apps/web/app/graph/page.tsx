"use client";

import { IconLoader2 } from "@tabler/icons-react";
import dynamic from "next/dynamic";

const MemoryGraph = dynamic(() => import("@crosmos/graph"), {
	ssr: false,
	loading: () => (
		<div className="h-screen w-full flex justify-center items-center">
			<IconLoader2 className="size-6 animate-spin" />
		</div>
	),
});

export default function GraphPage() {
	return <MemoryGraph />;
}
