import { BlogCard } from "@/components/blog-card";
import { getAllBlogs } from "@/lib/blog";

export default function BlogsPage() {
	const blogs = getAllBlogs()
		.slice()
		.sort(
			(a, b) =>
				new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
		);

	return (
		<section className="px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24">
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
							fullWidth
						/>
					))}
				</div>
			</div>
		</section>
	);
}
