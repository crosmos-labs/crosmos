"use client";

import { Spinner as CliSpinner } from "@agilek/cli-loaders";

export function PulseSpinner({ size = "1.1em" }: { size?: string }) {
	return <CliSpinner name="pulse" speed={1.5} size={size} />;
}
