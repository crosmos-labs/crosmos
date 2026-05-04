"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
	const lenisRef = useRef<Lenis | null>(null);

	useEffect(() => {
		const lenis = new Lenis({
			smoothWheel: true,
			duration: 1.2,
		});
		lenisRef.current = lenis;

		lenis.on("scroll", ScrollTrigger.update);

		let rafId: number;
		const raf = (time: number) => {
			lenis.raf(time);
			rafId = requestAnimationFrame(raf);
		};
		rafId = requestAnimationFrame(raf);

		const handleClick = (e: MouseEvent) => {
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

		return () => {
			cancelAnimationFrame(rafId);
			document.removeEventListener("click", handleClick);
			lenis.destroy();
			lenisRef.current = null;
		};
	}, []);

	return <>{children}</>;
}
