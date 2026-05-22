import type { MetadataRoute } from "next";
import { getAllBlogs } from "@/lib/blog";

const BASE_URL = "https://crosmos.dev";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: `${BASE_URL}/`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/blogs`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.8,
		},
	];

	const blogRoutes: MetadataRoute.Sitemap = getAllBlogs().map((post) => ({
		url: `${BASE_URL}/blogs/${post.slug}`,
		lastModified: new Date(post.publishedAt),
		changeFrequency: "monthly",
		priority: 0.6,
	}));

	return [...staticRoutes, ...blogRoutes];
}
