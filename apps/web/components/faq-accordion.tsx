"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@crosmos/ui/components/accordion";

export type FAQItem = {
	question: string;
	answer: string;
};

export function FaqAccordion({ items }: { items: FAQItem[] }) {
	return (
		<Accordion type="multiple" defaultValue={[]}>
			{items.map((item) => (
				<AccordionItem
					key={item.question}
					value={item.question}
					className="last:mb-0"
				>
					<AccordionTrigger className="text-base font-medium py-4 hover:no-underline">
						{item.question}
					</AccordionTrigger>
					<AccordionContent className="pb-4 text-foreground/80">
						{item.answer}
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
