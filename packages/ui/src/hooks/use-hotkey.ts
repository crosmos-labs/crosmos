import * as React from "react";

/** Runs `callback` when the user presses Cmd/Ctrl + `key`. */
export function useHotkey(key: string, callback: () => void) {
	const callbackRef = React.useRef(callback);
	callbackRef.current = callback;

	React.useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (
				(event.metaKey || event.ctrlKey) &&
				event.key.toLowerCase() === key.toLowerCase()
			) {
				event.preventDefault();
				callbackRef.current();
			}
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [key]);
}
