"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@crosmos/ui/components/accordion";

type FAQItem = {
	question: string;
	answer: string;
};

const FAQ_DATA: FAQItem[] = [
	{
		question: "What is Crosmos?",
		answer:
			"An AI memory layer that stores, retrieves, and acts on structured long-term memory. Agents go beyond stateless responses by maintaining context across sessions, users, and workflows.",
	},
	{
		question: "How is Crosmos different from a vector database?",
		answer:
			"Vector databases store embeddings and retrieve by similarity. Crosmos structures memory into an episodic substrate (facts, preferences, events), supports temporal and contextual retrieval, and reduces noise from irrelevant semantic matches.",
	},
	{
		question: "How easy is it to integrate?",
		answer:
			"Three endpoints: ingest, search, forget. Most teams integrate within a few hours. Our plugins auto-ingests conversations and auto-recalls context with zero configuration beyond an API key.",
	},
	{
		question: "Is user data secure?",
		answer:
			"Data isolation per memory space, encryption in transit and at rest, and configurable retention policies. No cross-space leakage.",
	},
];

export function Faq() {
	return (
		<section
			id="faq"
			className="dark relative bg-background text-foreground px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
					<div className="flex flex-col gap-6">
						<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
							Frequently Asked Questions
						</h2>
					</div>
					<div className="lg:col-span-2">
						<Accordion type="multiple" defaultValue={[]}>
							{FAQ_DATA.map((item, index) => (
								<AccordionItem
									key={index}
									value={`item-${index}`}
									className="last:mb-0"
								>
									<AccordionTrigger className="text-base font-medium py-4 hover:no-underline">
										{item.question}
									</AccordionTrigger>
									<AccordionContent className="text-muted-foreground pb-4">
										{item.answer}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				</div>
			</div>
		</section>
	);
}
