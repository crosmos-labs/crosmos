"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { LINKS } from "@/config/links";

gsap.registerPlugin(ScrollTrigger);

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>{}[]";
const FONT_SIZE = 64;
const SCROLL_DISTANCE = "200vh";

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform float uProgress;
uniform float uPixelSize;
uniform vec2 uPlaneSize;
uniform sampler2D uChars;
uniform float uCharCount;
varying vec2 vUv;

float random(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float randomIndex(vec2 id) {
	return floor(random(id) * uCharCount);
}

void main() {
	vec2 gridSize = uPlaneSize / uPixelSize;
	vec2 pixelId = floor(vUv * gridSize);
	vec2 gridUv = pixelId / gridSize;

	float blockRand = random(pixelId);
	float rowRand = random(vec2(0.0, pixelId.y));
	float progressY = gridUv.y;

	// Phase 1: appear bottom-to-top (uProgress 0 → 1.0)
	float appearReveal = uProgress - (progressY + 0.35 * blockRand + 0.05 * rowRand);
	float isAppeared = step(0.0, appearReveal);

	// Phase 2: dissolve bottom-to-top (uProgress 1.0 → 2.0)
	float disappearProgress = max(0.0, uProgress - 1.0);
	float disappearReveal = disappearProgress - (progressY + 0.35 * blockRand + 0.05 * rowRand);
	float isNotDisappeared = step(disappearReveal, 0.0);

	float blockAlpha = isAppeared * isNotDisappeared;

	float letterAppearThresholdBase = -0.22;
	float letterAppearThreshold = letterAppearThresholdBase + 0.06 * blockRand;
	float letterShow = smoothstep(letterAppearThreshold, 0.0, appearReveal) * isAppeared * isNotDisappeared;
	letterShow *= step(0.001, uProgress);

	if (blockAlpha < 0.5) discard;

	vec2 gridFrac = fract(vUv * gridSize);
	float charIndex = randomIndex(pixelId + mod(uProgress * 123.1, 192.6));
	float fontMargin = 0.09 + 0.09 * random(pixelId + uProgress);

	vec2 charUV = vec2(
		gridFrac.x * (1.0 - 2.0 * fontMargin) + fontMargin,
		(charIndex + gridFrac.y) / uCharCount
	);

	vec4 charColor = texture2D(uChars, charUV);
	float letterMask = charColor.r;

	float letterAlpha = step(0.29 + 0.08 * random(pixelId + 333.0), letterMask) * pow(letterShow, 0.69 + 0.3 * random(pixelId + 544.0));

	if (letterAlpha < 0.5 && random(pixelId + uProgress * 7.577) > 0.65) {
		float charIndex2 = mod(charIndex + 1.0, uCharCount);
		vec2 charUV2 = vec2(charUV.x, (charIndex2 + gridFrac.y) / uCharCount);
		vec4 charColor2 = texture2D(uChars, charUV2);
		float letterAlpha2 = step(0.29, charColor2.r) * letterShow;
		letterAlpha = max(letterAlpha, letterAlpha2 * 0.6);
	}

	vec3 brandColor = vec3(0.255, 0.620, 0.431);
	vec3 blockFill = mix(vec3(0.02, 0.06, 0.04), brandColor * 0.25, blockRand);
	vec3 charColorFinal = mix(brandColor * 0.85, vec3(1.0), 0.2 + 0.3 * random(pixelId + 999.0));

	gl_FragColor = mix(vec4(blockFill, 1.0), vec4(charColorFinal, 1.0), letterAlpha);
}
`;

function makeCharsTexture(): { texture: THREE.Texture; count: number } {
	const n = CHARS.length;
	const canvas = document.createElement("canvas");
	canvas.width = FONT_SIZE;
	canvas.height = FONT_SIZE * n;

	// biome-ignore lint/style/noNonNullAssertion: canvas 2d context always available
	const ctx = canvas.getContext("2d")!;
	ctx.font = `bold ${FONT_SIZE * 0.55}px monospace`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	for (let i = 0; i < n; i++) {
		ctx.clearRect(0, i * FONT_SIZE, FONT_SIZE, FONT_SIZE);
		ctx.fillStyle = Math.random() < 0.35 ? "#e6e6e6" : "#fff";
		ctx.fillText(CHARS[i] as string, FONT_SIZE / 2, (i + 0.5) * FONT_SIZE);
	}

	const texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	return { texture, count: n };
}

function splitToChars(text: string): { char: string; key: string }[] {
	return text.split("").map((char, i) => ({
		char: char === " " ? "\u00A0" : char,
		key: `ch-${i}-${char}`,
	}));
}

function LinkArrow() {
	return (
		<svg
			className="size-4 -rotate-45"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<title>Arrow Right</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M13 7l5 5m0 0l-5 5m5-5H6"
			/>
		</svg>
	);
}

export function HeroSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const section = sectionRef.current;
		const content = contentRef.current;
		const container = canvasContainerRef.current;
		if (!section || !content || !container) return;

		// --- Three.js setup ---
		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: false,
		});
		renderer.setClearColor(0x000000, 0);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(renderer.domElement);

		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const scene = new THREE.Scene();
		const geometry = new THREE.PlaneGeometry(2, 2);
		const charsData = makeCharsTexture();

		const coverMaterial = new THREE.ShaderMaterial({
			uniforms: {
				uProgress: { value: 0.0 },
				uPixelSize: { value: 16.0 * renderer.getPixelRatio() },
				uPlaneSize: {
					value: new THREE.Vector2(
						container.clientWidth * renderer.getPixelRatio(),
						container.clientHeight * renderer.getPixelRatio(),
					),
				},
				uChars: { value: charsData.texture },
				uCharCount: { value: charsData.count },
			},
			vertexShader: VERTEX_SHADER,
			fragmentShader: FRAGMENT_SHADER,
			transparent: true,
		});

		// Extract uniform references for type-safe access
		const uProgress = coverMaterial.uniforms.uProgress;
		const uPixelSize = coverMaterial.uniforms.uPixelSize;
		const coverPlaneSize = coverMaterial.uniforms.uPlaneSize;

		const coverMesh = new THREE.Mesh(geometry, coverMaterial);
		scene.add(coverMesh);

		// Pause rendering when offscreen
		let isVisible = true;
		const observer = new IntersectionObserver(
			([entry]) => {
				isVisible = entry?.isIntersecting ?? false;
			},
			{ threshold: 0 },
		);
		observer.observe(section);

		let raf = 0;
		const animate = () => {
			raf = requestAnimationFrame(animate);
			if (!isVisible) return;
			renderer.render(scene, camera);
		};
		raf = requestAnimationFrame(animate);

		// Handle resize
		const onResize = () => {
			const w = container.clientWidth || 1;
			const h = container.clientHeight || 1;
			renderer.setSize(w, h, false);
			const pr = renderer.getPixelRatio();
			// biome-ignore lint/style/noNonNullAssertion: uniform exists by construction
			coverPlaneSize!.value.set(w * pr, h * pr);
			// biome-ignore lint/style/noNonNullAssertion: uniform exists by construction
			uPixelSize!.value = 16.0 * pr;
		};
		const resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(container);

		// --- GSAP: ScrollTrigger pin + scrubbed animations ---
		// gsap.context scopes all selectors + enables ctx.revert() for cleanup
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: section,
					start: "top top",
					end: `+=${SCROLL_DISTANCE}`,
					pin: true,
					scrub: 1,
				},
			});

			// Phase 1: Per-letter staggered fade for heading + subtitle
			const heroChars = gsap.utils.toArray<HTMLElement>(".hero-char", content);
			if (heroChars.length > 0) {
				tl.to(
					heroChars,
					{
						autoAlpha: 0,
						duration: 0.25,
						stagger: 0.0015,
						ease: "power2.out",
					},
					0,
				);
			}

			// CTA buttons fade
			const ctaGroup = content.querySelector<HTMLElement>(".cta-group");
			if (ctaGroup) {
				tl.to(
					ctaGroup,
					{
						autoAlpha: 0,
						duration: 0.2,
						ease: "power2.out",
					},
					0.12,
				);
			}

			// Shader progress: 0 → 2.0 (appear bottom→top, dissolve bottom→top)
			tl.to(
				// biome-ignore lint/style/noNonNullAssertion: uniform exists by construction
				uProgress!,
				{
					value: 2.0,
					ease: "none",
					duration: 1,
				},
				0,
			);

			// Bg fades as matrix fully covers viewport
			const heroBg = section.querySelector<HTMLElement>(".hero-bg");
			if (heroBg) {
				tl.to(
					heroBg,
					{
						opacity: 0,
						duration: 0.1,
					},
					0.9,
				);
			}

			// Section bg-black fades so features shows through during dissolve
			tl.to(
				section,
				{
					backgroundColor: "transparent",
					duration: 0.1,
				},
				0.9,
			);

			// Canvas container fades during dissolve
			tl.to(
				container,
				{
					opacity: 0,
					duration: 0.15,
					ease: "power1.in",
				},
				0.85,
			);
		}, section);

		return () => {
			ctx.revert();
			cancelAnimationFrame(raf);
			resizeObserver.disconnect();
			observer.disconnect();
			geometry.dispose();
			coverMaterial.dispose();
			charsData.texture.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			if (container.contains(renderer.domElement)) {
				container.removeChild(renderer.domElement);
			}
			if (container) {
				container.style.opacity = "";
			}
			if (section) {
				section.style.backgroundColor = "";
			}
		};
	}, []);

	const headingLine1 = "Agents Forget,";
	const headingLine2 = "Crosmos Doesn\u2019t";
	const subtitle =
		"Stateful, self-improving memory infrastructure for AI agents. Memory layer that compounds intelligence \u2014 so agents get better, not just bigger";

	return (
		<section
			ref={sectionRef}
			className="relative min-h-screen flex flex-col overflow-hidden z-20 bg-black"
		>
			<Image
				src="/bg.png"
				alt=""
				fill
				className="hero-bg object-cover -z-10"
				priority
			/>

			<div
				ref={contentRef}
				className="relative z-10 flex flex-col items-center justify-start px-6 lg:px-8 xl:px-0 pt-24 sm:pt-28 md:pt-30"
			>
				<div className="max-w-7xl mx-auto w-full text-center">
					<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-none text-foreground text-balance">
						{splitToChars(headingLine1).map(({ char, key }) => (
							<span key={key} className="hero-char inline-block">
								{char}
							</span>
						))}
						<br />
						{splitToChars(headingLine2).map(({ char, key }) => (
							<span key={key} className="hero-char inline-block">
								{char}
							</span>
						))}
					</h1>

					<p className="mt-6 text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto">
						{splitToChars(subtitle).map(({ char, key }) => (
							<span key={key} className="hero-char inline-block">
								{char}
							</span>
						))}
					</p>

					<div className="cta-group mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							href={LINKS.product.console}
							target="_blank"
							rel="noopener noreferrer"
							className="h-full bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded font-semibold text-base transition-colors flex items-center gap-2 select-none"
						>
							Get Started
							<LinkArrow />
						</Link>
						<Link
							href={LINKS.documentation.getStarted}
							className="bg-foreground/10 hover:bg-foreground/20 text-foreground h-full px-6 py-3 rounded font-semibold text-base transition-colors flex items-center gap-2 select-none"
						>
							Docs
							<LinkArrow />
						</Link>
					</div>
				</div>
			</div>

			<div
				ref={canvasContainerRef}
				className="absolute inset-0 z-30 pointer-events-none"
			/>
		</section>
	);
}
