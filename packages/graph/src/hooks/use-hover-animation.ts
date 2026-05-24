"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface HoverAnimationApi {
	getNodeProgress: () => number;
	getEdgeProgress: () => number;
	animateNodeTo: (target: 0 | 1, onComplete?: () => void) => void;
	animateEdgeTo: (target: 0 | 1, onComplete?: () => void) => void;
	jumpNodeTo: (value: 0 | 1) => void;
	jumpEdgeTo: (value: 0 | 1) => void;
	isAnimating: boolean;
}

export interface HoverAnimationOptions {
	durationMs: number;
	reducedMotion: boolean;
}

interface Channel {
	progressRef: { current: number };
	frameRef: { current: number };
	inFlightRef: { current: boolean };
	flushRef: { current: number };
}

export function useHoverAnimation(
	opts: HoverAnimationOptions,
): HoverAnimationApi {
	const nodeProgressRef = useRef(0);
	const edgeProgressRef = useRef(0);
	const nodeFrameRef = useRef(0);
	const edgeFrameRef = useRef(0);
	const nodeInFlightRef = useRef(false);
	const edgeInFlightRef = useRef(false);
	const nodeFlushRef = useRef(0);
	const edgeFlushRef = useRef(0);
	const activeCountRef = useRef(0);
	const [isAnimating, setIsAnimating] = useState(false);

	const durationMs = opts.durationMs;
	const reducedMotion = opts.reducedMotion;

	const incActive = useCallback(() => {
		activeCountRef.current += 1;
		if (activeCountRef.current === 1) setIsAnimating(true);
	}, []);
	const decActive = useCallback(() => {
		activeCountRef.current = Math.max(0, activeCountRef.current - 1);
		if (activeCountRef.current === 0) setIsAnimating(false);
	}, []);

	const cancelChannel = useCallback(
		(channel: Channel) => {
			if (channel.inFlightRef.current) {
				cancelAnimationFrame(channel.frameRef.current);
				channel.inFlightRef.current = false;
				decActive();
			}
			if (channel.flushRef.current) {
				cancelAnimationFrame(channel.flushRef.current);
				channel.flushRef.current = 0;
			}
		},
		[decActive],
	);

	// Force one paint frame after a synchronous progress jump — without this,
	// autoPauseRedraw freezes the canvas before the new value renders.
	const scheduleFlush = useCallback(
		(channel: Channel, onComplete?: () => void) => {
			incActive();
			channel.flushRef.current = requestAnimationFrame(() => {
				onComplete?.();
				channel.flushRef.current = requestAnimationFrame(() => {
					channel.flushRef.current = 0;
					decActive();
				});
			});
		},
		[incActive, decActive],
	);

	const runAnim = useCallback(
		(channel: Channel, target: 0 | 1, onComplete?: () => void) => {
			const startValue = channel.progressRef.current;
			const diff = target - startValue;

			cancelChannel(channel);

			if (Math.abs(diff) < 0.001) {
				channel.progressRef.current = target;
				onComplete?.();
				return;
			}

			if (reducedMotion) {
				channel.progressRef.current = target;
				scheduleFlush(channel, onComplete);
				return;
			}

			incActive();
			channel.inFlightRef.current = true;
			const start = performance.now();

			const step = (now: number) => {
				const t = Math.min((now - start) / durationMs, 1);
				const eased = 1 - (1 - t) ** 3;
				channel.progressRef.current = startValue + diff * eased;
				if (t < 1) {
					channel.frameRef.current = requestAnimationFrame(step);
					return;
				}
				// Run cleanup then hold isAnimating for one more frame so the
				// cleared state paints before autoPauseRedraw freezes the canvas.
				onComplete?.();
				channel.frameRef.current = requestAnimationFrame(() => {
					channel.inFlightRef.current = false;
					decActive();
				});
			};
			channel.frameRef.current = requestAnimationFrame(step);
		},
		[
			durationMs,
			reducedMotion,
			incActive,
			decActive,
			scheduleFlush,
			cancelChannel,
		],
	);

	const nodeChannel = useRef<Channel>({
		progressRef: nodeProgressRef,
		frameRef: nodeFrameRef,
		inFlightRef: nodeInFlightRef,
		flushRef: nodeFlushRef,
	});
	const edgeChannel = useRef<Channel>({
		progressRef: edgeProgressRef,
		frameRef: edgeFrameRef,
		inFlightRef: edgeInFlightRef,
		flushRef: edgeFlushRef,
	});

	const animateNodeTo = useCallback(
		(target: 0 | 1, onComplete?: () => void) =>
			runAnim(nodeChannel.current, target, onComplete),
		[runAnim],
	);
	const animateEdgeTo = useCallback(
		(target: 0 | 1, onComplete?: () => void) =>
			runAnim(edgeChannel.current, target, onComplete),
		[runAnim],
	);

	const jumpNodeTo = useCallback(
		(value: 0 | 1) => {
			const channel = nodeChannel.current;
			cancelChannel(channel);
			channel.progressRef.current = value;
			scheduleFlush(channel);
		},
		[cancelChannel, scheduleFlush],
	);
	const jumpEdgeTo = useCallback(
		(value: 0 | 1) => {
			const channel = edgeChannel.current;
			cancelChannel(channel);
			channel.progressRef.current = value;
			scheduleFlush(channel);
		},
		[cancelChannel, scheduleFlush],
	);

	useEffect(() => {
		return () => {
			cancelChannel(nodeChannel.current);
			cancelChannel(edgeChannel.current);
		};
	}, [cancelChannel]);

	return {
		getNodeProgress: () => nodeProgressRef.current,
		getEdgeProgress: () => edgeProgressRef.current,
		animateNodeTo,
		animateEdgeTo,
		jumpNodeTo,
		jumpEdgeTo,
		isAnimating,
	};
}
