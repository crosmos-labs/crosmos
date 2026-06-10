"use client";

import { Kbd } from "@crosmos/ui/components/kbd";
import { IconCommand } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function HotkeyKbd() {
	// Default to Mac so SSR and the first client render match; correct post-mount.
	const [isMac, setIsMac] = useState(true);

	useEffect(() => {
		setIsMac(
			/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent),
		);
	}, []);

	return (
		<Kbd>
			{isMac ? <IconCommand /> : <span>Ctrl</span>}
			<span>K</span>
		</Kbd>
	);
}
