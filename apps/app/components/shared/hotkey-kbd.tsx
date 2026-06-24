"use client";

import { Kbd } from "@crosmos/ui/components/kbd";
import { IconCommand } from "@tabler/icons-react";
import { useSyncExternalStore } from "react";

// Platform is fixed for the session, so subscribe never fires.
const subscribe = () => () => {};
const getSnapshot = () =>
	/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
// Default to Mac on the server so the first client render matches.
const getServerSnapshot = () => true;

export function HotkeyKbd() {
	const isMac = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	return (
		<Kbd>
			{isMac ? <IconCommand /> : <span>Ctrl</span>}
			<span>K</span>
		</Kbd>
	);
}
