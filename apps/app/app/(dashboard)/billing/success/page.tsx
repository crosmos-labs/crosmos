"use client";

import { Button } from "@crosmos/ui/components/button";
import { Spinner } from "@crosmos/ui/components/spinner";
import { IconCircleCheck, IconClock } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { getSubscription } from "@/actions/billing";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { plansKey, subscriptionKey } from "@/hooks/use-billing";
import { orgKey } from "@/hooks/use-org";
import { usageKey } from "@/hooks/use-usage";
import { capitalize } from "@/lib/format";
import { pollUntil } from "@/lib/poll";
import type { Plan, PurchasablePlan } from "@/lib/types/billing";

const PENDING_PLAN_KEY = "billing:pending_plan";

type Phase = "finalizing" | "active" | "timeout";

export default function BillingSuccessPage() {
	const router = useRouter();
	const orgId = useActiveOrgId();
	const { mutate } = useSWRConfig();
	const [phase, setPhase] = useState<Phase>("finalizing");
	const [activePlan, setActivePlan] = useState<Plan | null>(null);
	const started = useRef(false);

	useEffect(() => {
		if (process.env.NODE_ENV !== "production") {
			const devPhase = new URLSearchParams(window.location.search).get(
				"dev_phase",
			);
			if (
				devPhase === "finalizing" ||
				devPhase === "active" ||
				devPhase === "timeout"
			) {
				if (devPhase === "active") setActivePlan("pro");
				setPhase(devPhase);
				return;
			}
		}
		if (!orgId || started.current) return;
		started.current = true;
		const controller = new AbortController();

		let expected: PurchasablePlan | null = null;
		try {
			expected = sessionStorage.getItem(
				PENDING_PLAN_KEY,
			) as PurchasablePlan | null;
		} catch {}

		void pollUntil({
			fn: () => getSubscription(),
			done: (s) =>
				s.subscription_status === "active" &&
				s.plan_pending === null &&
				(expected === null || s.plan === expected),
			signal: controller.signal,
		}).then(async (result) => {
			if (controller.signal.aborted) return;
			if (result.status === "done") {
				try {
					sessionStorage.removeItem(PENDING_PLAN_KEY);
				} catch {}
				setActivePlan(result.value.plan);
				await Promise.all([
					mutate(subscriptionKey(orgId), result.value, { revalidate: false }),
					mutate(usageKey(orgId)),
					mutate(plansKey(orgId)),
					mutate(orgKey(orgId)),
					mutate("/auth/me"),
				]);
				router.refresh();
				setPhase("active");
			} else {
				setPhase("timeout");
			}
		});

		return () => controller.abort();
	}, [orgId, mutate, router]);

	return (
		<div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
			{phase === "finalizing" && (
				<>
					<Spinner className="size-8 animation-duration-[0.7s] text-muted-foreground" />
					<div className="flex flex-col gap-1">
						<h1 className="text-xl font-semibold tracking-tight">
							Finalizing your upgrade…
						</h1>
						<p className="text-sm text-muted-foreground">
							Confirming your subscription with the payment provider. This only
							takes a few seconds.
						</p>
					</div>
				</>
			)}

			{phase === "active" && (
				<>
					<IconCircleCheck className="size-10 text-primary" />
					<div className="flex flex-col gap-1">
						<h1 className="text-xl font-semibold tracking-tight">
							You're all set
						</h1>
						<p className="text-sm text-muted-foreground">
							{activePlan
								? `Your ${capitalize(activePlan)} plan is now active.`
								: "Your subscription is now active."}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button asChild>
							<Link href="/billing">View billing</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/">Go to dashboard</Link>
						</Button>
					</div>
				</>
			)}

			{phase === "timeout" && (
				<>
					<IconClock className="size-10 text-muted-foreground" />
					<div className="flex flex-col gap-1">
						<h1 className="text-xl font-semibold tracking-tight">
							Almost there
						</h1>
						<p className="text-sm text-muted-foreground">
							Your payment went through and we're finalizing your upgrade. It
							should appear shortly — no need to pay again.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button asChild>
							<Link href="/billing">Go to billing</Link>
						</Button>
						<Button variant="outline" onClick={() => router.refresh()}>
							Refresh
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
