import { BlogCard } from "@/components/blog-card";
import type { BlogPostPreview } from "@/lib/blog";

type BlogCarouselProps = {
	blogs: BlogPostPreview[];
};

export function BlogCarousel({ blogs }: BlogCarouselProps) {
	return (
		<div className="mt-10 sm:mt-16 lg:mt-20">
			<div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-0">
				<div className="grid items-start gap-6 sm:grid-cols-2">
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
		</div>
	);
}
