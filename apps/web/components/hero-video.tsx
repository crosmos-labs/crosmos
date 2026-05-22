"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [shouldAutoplay, setShouldAutoplay] = useState(false);

	useEffect(() => {
		const allowMotion = window.matchMedia(
			"(prefers-reduced-motion: no-preference)",
		).matches;
		setShouldAutoplay(allowMotion);
	}, []);

	useEffect(() => {
		if (!shouldAutoplay) return;
		const el = videoRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					el.play().catch(() => {});
				} else {
					el.pause();
				}
			},
			{ threshold: 0.25 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [shouldAutoplay]);

	return (
		<video
			ref={videoRef}
			src="/showcase.mp4"
			poster="/showcase-poster.avif"
			autoPlay={shouldAutoplay}
			loop
			muted
			playsInline
			preload="metadata"
			aria-label="Crosmos product showcase"
			className="w-full rounded object-cover"
		/>
	);
}
