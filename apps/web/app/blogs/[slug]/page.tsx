import { IconBrandX } from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { getAllBlogSlugs, getBlogBySlug } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type BlogPageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
	return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: BlogPageProps): Promise<Metadata> {
	const { slug } = await params;
	const blog = getBlogBySlug(slug);
	if (!blog) return {};

	const url = `/blogs/${slug}`;

	return {
		title: {
			absolute: blog.title,
		},
		description: blog.description,
		alternates: {
			canonical: url,
		},
		openGraph: {
			type: "article",
			url,
			title: blog.title,
			description: blog.description,
			images: [blog.thumbnail],
			publishedTime: blog.publishedAt,
			authors: [blog.author.name],
		},
		twitter: {
			card: "summary_large_image",
			title: blog.title,
			description: blog.description,
			images: [blog.thumbnail],
		},
	};
}

export default async function BlogPage({ params }: BlogPageProps) {
	const { slug } = await params;
	const blog = getBlogBySlug(slug);

	if (!blog) notFound();

	const canonicalUrl = `${SITE_URL}/blogs/${slug}`;
	const imageUrl = blog.thumbnail.startsWith("http")
		? blog.thumbnail
		: `${SITE_URL}${blog.thumbnail}`;
	const authorUrl = blog.author.socials.x ?? blog.author.socials.linkedin;

	const blogPostingJsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: blog.title,
		description: blog.description,
		image: imageUrl,
		datePublished: blog.publishedAt,
		dateModified: blog.publishedAt,
		author: {
			"@type": "Person",
			name: blog.author.name,
			...(authorUrl ? { url: authorUrl } : {}),
		},
		publisher: {
			"@type": "Organization",
			name: "Crosmos Labs",
			url: SITE_URL,
			logo: {
				"@type": "ImageObject",
				url: `${SITE_URL}/opengraph-image.png`,
			},
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": canonicalUrl,
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
				name: "Blog",
				item: `${SITE_URL}/blogs`,
			},
			{
				"@type": "ListItem",
				position: 3,
				name: blog.title,
				item: canonicalUrl,
			},
		],
	};

	return (
		<article className="min-h-screen px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
				dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
			/>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
			/>
			<div className="max-w-3xl mx-auto">
				<a
					href="/blogs"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
				>
					&larr; Back to blogs
				</a>

				<div className="relative w-full mb-8 overflow-hidden rounded">
					<Image
						src={blog.thumbnail}
						alt={blog.title}
						width={blog.thumbnailWidth}
						height={blog.thumbnailHeight}
						sizes="(max-width: 768px) 100vw, 768px"
						className="w-full h-auto object-cover object-top"
					/>
				</div>

				<div className="flex items-center justify-between gap-3 mb-6">
					<div className="flex items-center gap-3">
						<Image
							src={blog.author.avatar}
							alt={blog.author.name}
							width={40}
							height={40}
							className="size-10 rounded-full object-cover"
						/>
						<div className="flex flex-col">
							<span className="font-medium text-sm">{blog.author.name}</span>
							<span className="text-xs text-muted-foreground">
								{blog.readTime} min read
							</span>
						</div>
					</div>
					<a
						href={blog.tweetUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
					>
						<IconBrandX className="size-4" />
						View original post
					</a>
				</div>

				<h1 className="text-3xl sm:text-4xl font-bold mb-8 leading-tight">
					{blog.title}
				</h1>

				<div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-code:text-sm">
					<Markdown source={blog.content} />
				</div>
			</div>
		</article>
	);
}
