"use client";

import { useEffect, useRef } from "react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
	const cleanupRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const isTouch = window.matchMedia("(pointer: coarse)").matches;

		if (reducedMotion || isTouch) {
			const handleAnchorClick = (e: MouseEvent) => {
				if (!(e.target instanceof HTMLElement)) return;
				const anchor = e.target.closest("a[href^='#']");
				if (!anchor) return;
				const href = anchor.getAttribute("href");
				if (!href) return;
				const el = document.querySelector<HTMLElement>(href);
				if (el) {
					e.preventDefault();
					el.scrollIntoView({
						behavior: reducedMotion ? "auto" : "smooth",
						block: "start",
					});
				}
			};
			document.addEventListener("click", handleAnchorClick);
			cleanupRef.current = () => {
				document.removeEventListener("click", handleAnchorClick);
			};
			return () => cleanupRef.current?.();
		}

		let disposed = false;
		let rafId: number | null = null;
		let handleClick: ((e: MouseEvent) => void) | null = null;
		let lenisInstance: { destroy: () => void } | null = null;

		void (async () => {
			const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] =
				await Promise.all([
					import("lenis"),
					import("gsap"),
					import("gsap/ScrollTrigger"),
				]);
			if (disposed) return;

			gsap.registerPlugin(ScrollTrigger);

			const lenis = new Lenis({
				smoothWheel: true,
				duration: 1.2,
			});
			lenisInstance = lenis;

			lenis.on("scroll", ScrollTrigger.update);

			const raf = (time: number) => {
				lenis.raf(time);
				rafId = requestAnimationFrame(raf);
			};
			rafId = requestAnimationFrame(raf);

			handleClick = (e: MouseEvent) => {
				if (!(e.target instanceof HTMLElement)) return;
				const anchor = e.target.closest("a[href^='#']");
				if (!anchor) return;
				const href = anchor.getAttribute("href");
				if (!href) return;
				const el = document.querySelector<HTMLElement>(href);
				if (el) {
					e.preventDefault();
					lenis.scrollTo(el, { offset: 0, duration: 1.2 });
				}
			};
			document.addEventListener("click", handleClick);
		})();

		return () => {
			disposed = true;
			if (rafId !== null) cancelAnimationFrame(rafId);
			if (handleClick) document.removeEventListener("click", handleClick);
			lenisInstance?.destroy();
		};
	}, []);

	return <>{children}</>;
}
