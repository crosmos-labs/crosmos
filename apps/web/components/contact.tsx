"use client";

import { Button } from "@crosmos/ui/components/button";
import { IconCalendar, IconMail } from "@tabler/icons-react";
import { useCalApi } from "@/hooks/use-cal-api";
import { CornerPlus } from "./ui/corner-plus";

export function Contact() {
	const initCal = useCalApi();

	return (
		<section
			id="contact"
			className="dark relative bg-background text-foreground border-0 px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<div className="max-w-7xl mx-auto">
				<div className="relative border border-foreground/20 p-8 md:p-12 lg:p-16 text-center">
					<CornerPlus className="top-0 left-0 hidden -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] lg:block stroke-3" />
					<CornerPlus className="top-0 right-0 hidden translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] lg:block stroke-3" />
					<CornerPlus className="bottom-0 left-0 hidden -translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] lg:block stroke-3" />
					<CornerPlus className="bottom-0 right-0 hidden translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] lg:block stroke-3" />
					<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
						Let&apos;s Talk
					</h2>
					<p className="text-muted-foreground mt-4 text-base md:text-lg max-w-xl mx-auto">
						Reach out to schedule a call or drop us an email.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
						<Button
							size="lg"
							className="inline-flex items-center gap-2 cursor-pointer"
							data-cal-namespace="15min"
							data-cal-link="crosmos/15min"
							data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
							onPointerEnter={initCal}
							onFocus={initCal}
						>
							<IconCalendar size={18} strokeWidth={1.5} />
							Schedule a Meet
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="border-foreground/20 hover:bg-foreground/5"
							asChild
						>
							<a
								href="mailto:support@crosmos.dev"
								className="inline-flex items-center gap-2"
							>
								<IconMail size={18} strokeWidth={1.5} />
								Email Us
							</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
