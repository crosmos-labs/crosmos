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
	author: Author;
	readTime: number;
	thumbnail: string;
	thumbnailWidth: number;
	thumbnailHeight: number;
	publishedAt: string;
	tweetUrl: string;
	content: string;
};

export function getAllBlogs(): BlogPost[] {
	const files = fs.readdirSync(BLOGS_DIR).filter((f) => f.endsWith(".mdx"));

	const blogs = files.map((file) => {
		const raw = fs.readFileSync(path.join(BLOGS_DIR, file), "utf-8");
		const { data, content } = matter(raw);
		const slug = data.slug || file.replace(/\.mdx$/, "");
		return {
			slug,
			title: data.title,
			author: (AUTHORS[data.author] ?? AUTHORS.rachit) as Author,
			readTime: data.readTime,
			thumbnail: data.thumbnail,
			thumbnailWidth: data.imageWidth ?? 1200,
			thumbnailHeight: data.imageHeight ?? 480,
			publishedAt: data.publishedAt,
			tweetUrl: data.tweetUrl,
			content,
		};
	});

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
