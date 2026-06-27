"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TocSection } from "@/lib/toc";

const SCROLL_LOCK_MS = 800;
const ACTIVE_OFFSET_PX = 120;

export function Toc({
	sections,
	className,
}: {
	sections: TocSection[];
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

		let rafId: number | null = null;

		const compute = () => {
			rafId = null;
			if (lockedRef.current) return;

			const threshold = ACTIVE_OFFSET_PX;
			const scrollBottom = window.innerHeight + window.scrollY;
			const docBottom = document.documentElement.scrollHeight;
			const atBottom = scrollBottom >= docBottom - 2;

			let currentId: string | null = elements[0]?.id ?? null;

			if (atBottom) {
				currentId = elements[elements.length - 1]?.id ?? currentId;
			} else {
				for (const el of elements) {
					const top = el.getBoundingClientRect().top;
					if (top - threshold <= 0) {
						currentId = el.id;
					} else {
						break;
					}
				}
			}

			if (currentId) {
				setActiveId((prev) => (prev === currentId ? prev : currentId));
			}
		};

		const onScroll = () => {
			if (rafId !== null) return;
			rafId = window.requestAnimationFrame(compute);
		};

		compute();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);

		const onHashChange = () => {
			const id = window.location.hash.slice(1);
			if (id && sections.some((s) => s.id === id)) {
				lockTo(id);
			}
		};
		window.addEventListener("hashchange", onHashChange);

		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			window.removeEventListener("hashchange", onHashChange);
			if (rafId !== null) window.cancelAnimationFrame(rafId);
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
			<ul className="relative border-l border-muted-foreground/30">
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
