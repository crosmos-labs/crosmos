"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
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

function scheduleResultTimers(
	resultTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
	fadeTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
	onFadeStart: () => void,
	onFadeEnd: () => void,
) {
	resultTimerRef.current = setTimeout(() => {
		onFadeStart();
		fadeTimerRef.current = setTimeout(() => {
			onFadeEnd();
		}, 200);
	}, 5000);
}

export function ActionLoaderProvider({ children }: { children: ReactNode }) {
	const [activeCount, setActiveCount] = useState(0);
	const [result, setResult] = useState<ActionResult>("idle");
	const [fading, setFading] = useState(false);
	const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hasErrorRef = useRef(false);

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

	useEffect(() => {
		if (activeCount !== 0) return;
		if (result === "idle") return;

		scheduleResultTimers(
			resultTimerRef,
			fadeTimerRef,
			() => setFading(true),
			() => {
				setResult("idle");
				setFading(false);
			},
		);

		return clearTimers;
	}, [activeCount, result, clearTimers]);

	const runAction: ActionLoaderContextValue["runAction"] = useCallback(
		(action, options) => {
			clearTimers();
			setFading(false);
			setActiveCount((c) => c + 1);

			return action()
				.then((value) => {
					if (options?.toast?.success) {
						toast.success(options.toast.success);
					}
					setActiveCount((c) => {
						const next = c - 1;
						if (next === 0) {
							setResult(hasErrorRef.current ? "error" : "success");
							hasErrorRef.current = false;
						}
						return next;
					});
					return value;
				})
				.catch((err: unknown) => {
					if (options?.toast?.error) {
						toast.error(options.toast.error);
					}
					hasErrorRef.current = true;
					setActiveCount((c) => {
						const next = c - 1;
						if (next === 0) {
							setResult("error");
							hasErrorRef.current = false;
						}
						return next;
					});
					throw err;
				});
		},
		[clearTimers],
	);

	const contextValue = useMemo<ActionLoaderContextValue>(
		() => ({ runAction, state: { activeCount, result, fading } }),
		[runAction, activeCount, result, fading],
	);

	return (
		<ActionLoaderContext.Provider value={contextValue}>
			{children}
		</ActionLoaderContext.Provider>
	);
}
