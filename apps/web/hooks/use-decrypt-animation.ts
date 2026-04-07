import { useEffect, useRef, useState } from "react";

const GLYPHS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

export function useDecryptAnimation(targetLines: string[]) {
	const containerRef = useRef<HTMLPreElement>(null);
	const [displayGrid, setDisplayGrid] = useState<string[][]>(() =>
		targetLines.map((l) => l.split("")),
	);
	const displayGridRef = useRef(displayGrid);
	const [animatingTo, setAnimatingTo] = useState<string[] | null>(null);
	const prevTargetTextRef = useRef(targetLines.join("\n"));

	useEffect(() => {
		displayGridRef.current = displayGrid;
	}, [displayGrid]);

	useEffect(() => {
		const targetText = targetLines.join("\n");

		if (prevTargetTextRef.current !== targetText) {
			const oldLines = displayGridRef.current;
			const newLines = targetLines.map((l) => l.split(""));

			const maxLinesCount = Math.max(oldLines.length, newLines.length);
			const paddedGrid: string[][] = [];

			for (let i = 0; i < maxLinesCount; i++) {
				const oldLine = oldLines[i] || [];
				const newLine = newLines[i] || [];
				const maxLen = Math.max(oldLine.length, newLine.length);
				const line: string[] = [];
				for (let j = 0; j < maxLen; j++) {
					line.push(oldLine[j] ?? " ");
				}
				paddedGrid.push(line);
			}

			prevTargetTextRef.current = targetText;
			setDisplayGrid(paddedGrid);
			setAnimatingTo(targetLines);
		}
	}, [targetLines]);

	useEffect(() => {
		if (!animatingTo) return;

		const pre = containerRef.current;
		if (!pre) return;

		const spans = pre.querySelectorAll("span[data-l]");
		const startTime = performance.now();
		const animData = new Map();

		const lineLengths = new Map<number, number>();
		for (const span of spans) {
			const l = Number.parseInt(span.getAttribute("data-l") ?? "", 10);
			const c = Number.parseInt(span.getAttribute("data-c") ?? "", 10);
			lineLengths.set(l, Math.max(lineLengths.get(l) ?? 0, c + 1));
		}

		let hasChanges = false;

		for (const span of spans) {
			const l = Number.parseInt(span.getAttribute("data-l") ?? "", 10);
			const c = Number.parseInt(span.getAttribute("data-c") ?? "", 10);

			const oldChar = span.textContent || " ";
			const targetLine = animatingTo[l] ?? "";
			const targetChar = c < targetLine.length ? targetLine[c] : " ";

			if (oldChar !== targetChar) {
				hasChanges = true;
				const isRemoving = targetChar === " ";
				const lineLen = lineLengths.get(l) ?? 1;
				const delay = isRemoving ? (lineLen - 1 - c) * 15 : c * 15;
				const scrambleDuration = 300 + Math.random() * 200;
				const resolveDuration = 200 + Math.random() * 200;

				animData.set(`${l}-${c}`, {
					span,
					targetChar,
					oldChar,
					delay,
					scrambleEnd: delay + scrambleDuration,
					resolveEnd: delay + scrambleDuration + resolveDuration,
					lastUpdate: 0,
				});
			}
		}

		if (!hasChanges) {
			setAnimatingTo(null);
			setDisplayGrid(animatingTo.map((l: string) => l.split("")));
			return;
		}

		let animationFrame: number;

		const tick = (now: number) => {
			const elapsed = now - startTime;
			let allDone = true;

			for (const data of animData.values()) {
				if (elapsed < data.delay) {
					allDone = false;
					continue;
				}

				if (elapsed < data.scrambleEnd) {
					allDone = false;
					if (now - data.lastUpdate > 40) {
						data.span.textContent =
							GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
						data.lastUpdate = now;
					}
				} else if (elapsed < data.resolveEnd) {
					allDone = false;
					if (data.span.textContent !== data.targetChar) {
						data.span.textContent = data.targetChar;
					}
				} else {
					if (data.span.textContent !== data.targetChar) {
						data.span.textContent = data.targetChar;
					}
				}
			}

			if (!allDone) {
				animationFrame = requestAnimationFrame(tick);
			} else {
				setAnimatingTo(null);
				setDisplayGrid(animatingTo.map((l: string) => l.split("")));
			}
		};

		animationFrame = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(animationFrame);
	}, [animatingTo]);

	return { containerRef, displayGrid };
}
