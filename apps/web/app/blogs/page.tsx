import type { Metadata } from "next";
import { BlogCard } from "@/components/blog-card";
import { getAllBlogs } from "@/lib/blog";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const DESCRIPTION =
	"Deep dives on memory systems, context engineering, and building with Crosmos.";

export const metadata: Metadata = {
	title: "Blogs",
	description: DESCRIPTION,
	alternates: {
		canonical: "/blogs",
	},
	openGraph: {
		title: "Blogs - Crosmos",
		description: DESCRIPTION,
		type: "website",
		url: "/blogs",
		images: [OG_IMAGE],
	},
	twitter: {
		card: "summary_large_image",
		title: "Blogs - Crosmos",
		description: DESCRIPTION,
		images: [OG_IMAGE.url],
	},
};

export default function BlogsPage() {
	const canonicalUrl = `${SITE_URL}/blogs`;
	const collectionPageJsonLd = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: "Blogs",
		description: DESCRIPTION,
		url: canonicalUrl,
		isPartOf: {
			"@type": "WebSite",
			name: SITE_NAME,
			url: SITE_URL,
		},
	};
	const breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
			{
				"@type": "ListItem",
				position: 2,
				name: "Blogs",
				item: canonicalUrl,
			},
		],
	};
	const blogs = getAllBlogs()
		.slice()
		.sort(
			(a, b) =>
				new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
		);

	return (
		<section className="px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(collectionPageJsonLd),
				}}
			/>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
			/>
			<div className="max-w-7xl mx-auto">
				<div className="text-center max-w-2xl mx-auto">
					<h1 className="mt-3 text-3xl sm:text-4xl font-bold">All Blogs</h1>
					<p className="mt-4 text-base text-muted-foreground">
						Deep dives on memory systems, context engineering, and building with
						Crosmos.
					</p>
				</div>

				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{blogs.map((blog) => (
						<BlogCard
							key={blog.slug}
							slug={blog.slug}
							title={blog.title}
							author={blog.author}
							readTime={blog.readTime}
							thumbnail={blog.thumbnail}
							thumbnailWidth={blog.thumbnailWidth}
							thumbnailHeight={blog.thumbnailHeight}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
