import { type FAQItem, FaqAccordion } from "./faq-accordion";

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

const faqJsonLd = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: FAQ_DATA.map((item) => ({
		"@type": "Question",
		name: item.question,
		acceptedAnswer: {
			"@type": "Answer",
			text: item.answer,
		},
	})),
};

export function Faq() {
	return (
		<section
			id="faq"
			className="relative bg-background text-foreground border-0 px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
			/>
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
					<div className="flex flex-col gap-6">
						<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
							Frequently Asked Questions
						</h2>
					</div>
					<div className="lg:col-span-2">
						<FaqAccordion items={FAQ_DATA} />
					</div>
				</div>
			</div>
		</section>
	);
}
