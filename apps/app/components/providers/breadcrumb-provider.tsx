"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useState,
} from "react";

interface BreadcrumbData {
	label: string;
	parent?: {
		label: string;
		href: string;
	};
}

interface BreadcrumbContextValue {
	breadcrumb: BreadcrumbData | null;
	setBreadcrumb: (data: BreadcrumbData | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function useBreadcrumb() {
	const ctx = useContext(BreadcrumbContext);
	if (!ctx)
		throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
	return ctx;
}

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
	const [breadcrumb, setBreadcrumb] = useState<BreadcrumbData | null>(null);

	const contextValue = useMemo<BreadcrumbContextValue>(
		() => ({ breadcrumb, setBreadcrumb }),
		[breadcrumb],
	);

	return (
		<BreadcrumbContext.Provider value={contextValue}>
			{children}
		</BreadcrumbContext.Provider>
	);
}
