import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOGS_DIR = path.join(process.cwd(), "content/blogs");

export type Author = {
	name: string;
	avatar: string;
	role: string;
	socials: {
		linkedin?: string;
		x?: string;
	};
};

export const AUTHORS: Record<string, Author> = {
	aditya: {
		name: "Aditya",
		avatar: "/blogs/aditya.jpg",
		role: "Building Crosmos",
		socials: {
			linkedin: "https://www.linkedin.com/in/ryadi/",
			x: "https://x.com/ryadi_os",
		},
	},
	rachit: {
		name: "Rachit Srivastava",
		avatar: "/blogs/rachit.jpg",
		role: "Building Crosmos",
		socials: {
			linkedin: "https://www.linkedin.com/in/rachit032004/",
			x: "https://x.com/rachitcodes/",
		},
	},
	divyansh: {
		name: "Divyansh Verma",
		avatar: "/blogs/divyansh.jpg",
		role: "Engineering at Crosmos",
		socials: {
			linkedin: "https://www.linkedin.com/in/divyansh-verma-aa001b308/",
			x: "https://x.com/iiviieee",
		},
	},
};

export type BlogPost = {
	slug: string;
	title: string;
	description: string;
	author: Author;
	readTime: number;
	thumbnail: string;
	thumbnailWidth: number;
	thumbnailHeight: number;
	publishedAt: string;
	tweetUrl: string;
	content: string;
};

/**
 * Derive a plain-text excerpt (~155 chars) from MDX content for use as a meta
 * description when a post has no explicit `description` in its frontmatter.
 * Strips common markdown/MDX syntax so search engines get clean prose.
 */
function deriveExcerpt(content: string, maxLength = 155): string {
	const text = content
		.replace(/<[^>]+>/g, " ") // JSX/HTML tags
		.replace(/```[\s\S]*?```/g, " ") // fenced code blocks
		.replace(/`[^`]*`/g, " ") // inline code
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
		.replace(/^#{1,6}\s+/gm, "") // headings
		.replace(/[*_>#-]/g, " ") // residual markdown symbols
		.replace(/\s+/g, " ")
		.trim();

	if (text.length <= maxLength) return text;
	const truncated = text.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");
	return `${(lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
}

export type BlogPostPreview = Pick<
	BlogPost,
	| "slug"
	| "title"
	| "author"
	| "readTime"
	| "thumbnail"
	| "thumbnailWidth"
	| "thumbnailHeight"
>;

export function toBlogPreview(post: BlogPost): BlogPostPreview {
	return {
		slug: post.slug,
		title: post.title,
		author: post.author,
		readTime: post.readTime,
		thumbnail: post.thumbnail,
		thumbnailWidth: post.thumbnailWidth,
		thumbnailHeight: post.thumbnailHeight,
	};
}

export function getAllBlogs(): BlogPost[] {
	const files = fs.readdirSync(BLOGS_DIR).filter((f) => f.endsWith(".mdx"));
	const seenSlugs = new Set<string>();

	const blogs: BlogPost[] = [];

	for (const file of files) {
		const raw = fs.readFileSync(path.join(BLOGS_DIR, file), "utf-8");
		const { data, content } = matter(raw);

		const slug = data.slug || file.replace(/\.mdx$/, "");

		if (seenSlugs.has(slug)) {
			throw new Error(`Duplicate blog slug: "${slug}" (from file: ${file})`);
		}
		seenSlugs.add(slug);

		if (typeof data.title !== "string" || !data.title) {
			throw new Error(`Missing or invalid "title" in ${file}`);
		}
		if (typeof data.publishedAt !== "string" || !data.publishedAt) {
			throw new Error(`Missing or invalid "publishedAt" in ${file}`);
		}
		if (Number.isNaN(new Date(data.publishedAt).getTime())) {
			throw new Error(
				`Invalid "publishedAt" date in ${file}: "${data.publishedAt}"`,
			);
		}

		if (typeof data.readTime !== "number") {
			throw new Error(`Missing or invalid "readTime" in ${file}`);
		}
		if (typeof data.thumbnail !== "string" || !data.thumbnail) {
			throw new Error(`Missing or invalid "thumbnail" in ${file}`);
		}
		if (typeof data.tweetUrl !== "string" || !data.tweetUrl) {
			throw new Error(`Missing or invalid "tweetUrl" in ${file}`);
		}

		const author = AUTHORS[data.author];
		if (!author) {
			throw new Error(
				`Unknown author key "${data.author}" in ${file}. Valid keys: ${Object.keys(AUTHORS).join(", ")}`,
			);
		}

		const thumbnailWidth =
			typeof data.imageWidth === "number" ? data.imageWidth : 1200;
		const thumbnailHeight =
			typeof data.imageHeight === "number" ? data.imageHeight : 480;

		blogs.push({
			slug,
			title: data.title,
			description:
				typeof data.description === "string" && data.description
					? data.description
					: deriveExcerpt(content),
			author,
			readTime: data.readTime,
			thumbnail: data.thumbnail,
			thumbnailWidth,
			thumbnailHeight,
			publishedAt: data.publishedAt,
			tweetUrl: data.tweetUrl,
			content,
		});
	}

	return blogs.sort(
		(a, b) =>
			new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
	);
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
	const blogs = getAllBlogs();
	return blogs.find((b) => b.slug === slug);
}

export function getAllBlogSlugs(): string[] {
	return getAllBlogs().map((b) => b.slug);
}
