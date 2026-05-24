"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LegalSection } from "@/lib/legal";

const SCROLL_LOCK_MS = 1400;

export function LegalToc({
	sections,
	className,
}: {
	sections: LegalSection[];
	className?: string;
}) {
	const [activeId, setActiveId] = useState<string | null>(
		sections[0]?.id ?? null,
	);
	const lockedRef = useRef(false);
	const unlockTimerRef = useRef<number | null>(null);

	const lockTo = useCallback((id: string) => {
		setActiveId(id);
		lockedRef.current = true;
		if (unlockTimerRef.current !== null) {
			window.clearTimeout(unlockTimerRef.current);
		}
		unlockTimerRef.current = window.setTimeout(() => {
			lockedRef.current = false;
			unlockTimerRef.current = null;
		}, SCROLL_LOCK_MS);
	}, []);

	useEffect(() => {
		if (sections.length === 0) return;

		const elements = sections
			.map((s) => document.getElementById(s.id))
			.filter((el): el is HTMLElement => el !== null);

		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (lockedRef.current) return;
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) {
					setActiveId(visible[0].target.id);
				}
			},
			{
				rootMargin: "-96px 0px -60% 0px",
				threshold: [0, 1],
			},
		);

		for (const el of elements) observer.observe(el);

		const onHashChange = () => {
			const id = window.location.hash.slice(1);
			if (id && sections.some((s) => s.id === id)) {
				lockTo(id);
			}
		};
		window.addEventListener("hashchange", onHashChange);

		return () => {
			observer.disconnect();
			window.removeEventListener("hashchange", onHashChange);
			if (unlockTimerRef.current !== null) {
				window.clearTimeout(unlockTimerRef.current);
				unlockTimerRef.current = null;
			}
		};
	}, [sections, lockTo]);

	if (sections.length === 0) return null;

	return (
		<nav aria-label="Table of contents" className={className}>
			<p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80 mb-5">
				On this page
			</p>
			<ul className="relative border-l border-border/60">
				{sections.map((s) => {
					const isActive = s.id === activeId;
					const isSub = s.depth === 3;
					return (
						<li key={s.id}>
							<a
								href={`#${s.id}`}
								onClick={() => lockTo(s.id)}
								aria-current={isActive ? "location" : undefined}
								className={[
									"block py-2 text-sm leading-snug -ml-px border-l-2 transition-colors outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0",
									isSub ? "pl-8" : "pl-4",
									isActive
										? "border-foreground text-foreground"
										: "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
								].join(" ")}
							>
								{s.title}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
