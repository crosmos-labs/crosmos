import { IconBrandX } from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllBlogSlugs, getBlogBySlug } from "@/lib/blog";

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

	return {
		title: blog.title,
		description: `${blog.title} - ${blog.author.name}`,
		openGraph: {
			title: blog.title,
			images: [blog.thumbnail],
		},
	};
}

export default async function BlogPage({ params }: BlogPageProps) {
	const { slug } = await params;
	const blog = getBlogBySlug(slug);

	if (!blog) notFound();

	return (
		<article className="min-h-screen px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24">
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
					<MDXRemote source={blog.content} />
				</div>
			</div>
		</article>
	);
}
