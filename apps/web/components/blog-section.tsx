import Link from "next/link";
import { getAllBlogs } from "@/lib/blog";
import { BlogCarousel } from "./blog-carousel";

export function BlogSection() {
	const blogs = getAllBlogs()
		.slice()
		.sort(
			(a, b) =>
				new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
		)
		.slice(0, 2);

	return (
		<section id="blog" className="py-16 sm:py-20 lg:py-24">
			<div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-0">
				<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
					Blogs
				</h2>
			</div>
			<BlogCarousel blogs={blogs} />
			<div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-0 mt-6 flex justify-end">
				<Link
					href="/blogs"
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					More blogs →
				</Link>
			</div>
		</section>
	);
}
