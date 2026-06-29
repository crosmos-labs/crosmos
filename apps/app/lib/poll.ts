import { unstable_rethrow } from "next/navigation";

// NEEDS HEAVY TESTING: drives async webhook-activation polling (checkout/cancel).
// Verify abort-on-unmount, budget/timeout, and transient-error tolerance.

export interface PollOptions<T> {
	fn: () => Promise<T>;
	done: (value: T) => boolean;
	signal?: AbortSignal;
	budgetMs?: number;
	intervalMs?: number;
}

export type PollResult<T> =
	| { status: "done"; value: T }
	| { status: "timeout"; value: T | null };

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve) => {
		const timer = setTimeout(resolve, ms);
		signal?.addEventListener(
			"abort",
			() => {
				clearTimeout(timer);
				resolve();
			},
			{ once: true },
		);
	});
}

export async function pollUntil<T>({
	fn,
	done,
	signal,
	budgetMs = 30_000,
	intervalMs = 2_000,
}: PollOptions<T>): Promise<PollResult<T>> {
	const deadline = Date.now() + budgetMs;
	let last: T | null = null;

	while (!signal?.aborted && Date.now() < deadline) {
		try {
			last = await fn();
			if (done(last)) return { status: "done", value: last };
		} catch (err) {
			unstable_rethrow(err);
		}
		if (Date.now() + intervalMs >= deadline) break;
		await sleep(intervalMs, signal);
	}

	return { status: "timeout", value: last };
}
