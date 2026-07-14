"use client";

import { Badge } from "@crosmos/ui/components/badge";
import { Button } from "@crosmos/ui/components/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@crosmos/ui/components/pagination";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { cn } from "@crosmos/ui/lib/utils";
import { IconDownload, IconReceipt } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { getPaymentInvoice } from "@/actions/billing";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { usePayments } from "@/hooks/use-billing";
import { toastBillingError } from "@/lib/billing-errors";
import { capitalize, formatDate, formatMoney } from "@/lib/format";
import type { Payment, PaymentStatus } from "@/lib/types/billing";

const STATUS_BADGES: Record<
	PaymentStatus,
	{ label: string; variant: "secondary" | "outline"; className?: string }
> = {
	paid: { label: "Paid", variant: "secondary" },
	pending: { label: "Pending", variant: "outline" },
	refunded: {
		label: "Refunded",
		variant: "outline",
		className: "text-amber-500",
	},
	partially_refunded: {
		label: "Partially refunded",
		variant: "outline",
		className: "text-amber-500",
	},
	void: {
		label: "Void",
		variant: "outline",
		className: "text-muted-foreground",
	},
	draft: {
		label: "Draft",
		variant: "outline",
		className: "text-muted-foreground",
	},
};

function paymentTitle(p: Payment): string {
	if (p.product_name) return p.product_name;
	if (p.plan) return `${capitalize(p.plan)} plan`;
	return "Payment";
}

function InvoiceButton({ paymentId }: { paymentId: string }) {
	const { runAction, state } = useActionLoader();

	async function onDownload() {
		try {
			await runAction(async () => {
				// Polar generates invoice PDFs lazily: 202 means generation just
				// started, so poll a couple of times before telling the user to retry.
				for (let attempt = 0; attempt < 3; attempt++) {
					const res = await getPaymentInvoice(paymentId);
					if (!res.ok) throw new Error(res.message);
					if ("invoice_url" in res.data) {
						const url = res.data.invoice_url;
						// Popup blockers kill window.open this long after the click.
						if (!window.open(url, "_blank")) {
							toast("Invoice ready", {
								action: {
									label: "Open",
									onClick: () => window.open(url, "_blank"),
								},
							});
						}
						return;
					}
					if (attempt < 2) await new Promise((r) => setTimeout(r, 3000));
				}
				toast.info("Invoice is still being generated. Try again in a moment.");
			});
		} catch (err) {
			toastBillingError(err, "Couldn't get the invoice.");
		}
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label="Download invoice"
			disabled={state.activeCount > 0}
			onClick={onDownload}
		>
			<IconDownload />
		</Button>
	);
}

export function PaymentHistory() {
	const [page, setPage] = useState(1);
	const { data, isLoading, error, mutate: reloadPayments } = usePayments(page);

	const showError = error && !data;
	const showLoading = isLoading && !data;

	const payments = data?.payments;
	const hasPrev = page > 1;
	const hasMore = data ? page < data.pagination.max_page : false;

	return (
		<section className="flex flex-col gap-3">
			<h2 className="text-lg font-semibold tracking-tight">Payment history</h2>
			{showError ? (
				<div className="flex flex-col items-start gap-2 py-2">
					<p className="text-sm text-muted-foreground">
						Couldn't load payments.
					</p>
					<Button variant="outline" size="sm" onClick={() => reloadPayments()}>
						Try again
					</Button>
				</div>
			) : showLoading ? (
				<div className="flex flex-col gap-2">
					<Skeleton className="h-16 w-full rounded-lg" />
					<Skeleton className="h-16 w-full rounded-lg" />
					<Skeleton className="h-16 w-full rounded-lg" />
				</div>
			) : !payments || payments.length === 0 ? (
				<EmptyState
					icon={IconReceipt}
					title="No payments yet"
					description="Invoices will appear here after your first payment."
				/>
			) : (
				<>
					<ItemGroup>
						{payments.map((p) => {
							const badge = STATUS_BADGES[p.status];
							return (
								<Item key={p.id} variant="outline" className="px-4 py-3.5">
									<ItemContent>
										<ItemTitle>
											{paymentTitle(p)}
											{badge && (
												<Badge
													variant={badge.variant}
													className={badge.className}
												>
													{badge.label}
												</Badge>
											)}
										</ItemTitle>
										<ItemDescription>
											{formatDate(p.created_at)}
											{p.invoice_number && (
												<>
													{" · "}
													<span className="font-mono">{p.invoice_number}</span>
												</>
											)}
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<div className="flex flex-col items-end">
											<span className="text-sm font-medium tabular-nums">
												{formatMoney(p.total_amount, p.currency)}
											</span>
											{p.refunded_amount > 0 && (
												<span className="text-xs text-amber-500 tabular-nums">
													−{formatMoney(p.refunded_amount, p.currency)} refunded
												</span>
											)}
										</div>
										{(p.paid || p.invoice_available) && (
											<InvoiceButton paymentId={p.id} />
										)}
									</ItemActions>
								</Item>
							);
						})}
					</ItemGroup>
					{(hasPrev || hasMore) && (
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (hasPrev) setPage(page - 1);
										}}
										className={cn(!hasPrev && "pointer-events-none opacity-50")}
									/>
								</PaginationItem>
								<PaginationItem>
									<PaginationNext
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (hasMore) setPage(page + 1);
										}}
										className={cn(!hasMore && "pointer-events-none opacity-50")}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					)}
				</>
			)}
		</section>
	);
}
