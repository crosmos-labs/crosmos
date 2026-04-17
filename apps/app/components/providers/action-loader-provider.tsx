"use client";

import {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { toast } from "sonner";

type ActionResult = "idle" | "success" | "error";

interface ActionLoaderState {
	activeCount: number;
	result: ActionResult;
	fading: boolean;
}

interface ActionLoaderContextValue {
	runAction: <T>(
		action: () => Promise<T>,
		options?: {
			toast?: { success?: string; error?: string };
		},
	) => Promise<T>;
	state: ActionLoaderState;
}

const ActionLoaderContext = createContext<ActionLoaderContextValue | null>(
	null,
);

export function useActionLoader() {
	const ctx = useContext(ActionLoaderContext);
	if (!ctx)
		throw new Error("useActionLoader must be used within ActionLoaderProvider");
	return ctx;
}

export function useActionLoaderState() {
	const { state } = useActionLoader();
	return state;
}

export function ActionLoaderProvider({ children }: { children: ReactNode }) {
	const [activeCount, setActiveCount] = useState(0);
	const [result, setResult] = useState<ActionResult>("idle");
	const [fading, setFading] = useState(false);
	const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearTimers = useCallback(() => {
		if (resultTimerRef.current) {
			clearTimeout(resultTimerRef.current);
			resultTimerRef.current = null;
		}
		if (fadeTimerRef.current) {
			clearTimeout(fadeTimerRef.current);
			fadeTimerRef.current = null;
		}
	}, []);

	const runAction: ActionLoaderContextValue["runAction"] = useCallback(
		(action, options) => {
			clearTimers();
			setFading(false);
			setActiveCount((c) => c + 1);

			return action()
				.then((value) => {
					setActiveCount((c) => {
						const next = c - 1;
						if (next === 0) {
							setResult("success");
							resultTimerRef.current = setTimeout(() => {
								setFading(true);
								fadeTimerRef.current = setTimeout(() => {
									setResult("idle");
									setFading(false);
								}, 200);
							}, 5000);
						}
						return next;
					});
					if (options?.toast?.success) {
						toast.success(options.toast.success);
					}
					return value;
				})
				.catch((err: unknown) => {
					setActiveCount((c) => {
						const next = c - 1;
						if (next === 0) {
							setResult("error");
							resultTimerRef.current = setTimeout(() => {
								setFading(true);
								fadeTimerRef.current = setTimeout(() => {
									setResult("idle");
									setFading(false);
								}, 200);
							}, 5000);
						}
						return next;
					});
					if (options?.toast?.error) {
						toast.error(options.toast.error);
					}
					throw err;
				});
		},
		[clearTimers],
	);

	return (
		<ActionLoaderContext.Provider
			value={{ runAction, state: { activeCount, result, fading } }}
		>
			{children}
		</ActionLoaderContext.Provider>
	);
}
