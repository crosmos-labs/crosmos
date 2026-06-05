import type { MetadataRoute } from "next";
import { getAllBlogs } from "@/lib/blog";
import { getLegalDoc } from "@/lib/legal";
import { SITE_URL as BASE_URL } from "@/lib/site";

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
		{
			url: `${BASE_URL}/terms`,
			lastModified: new Date(getLegalDoc("terms").updatedAt),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${BASE_URL}/privacy`,
			lastModified: new Date(getLegalDoc("privacy").updatedAt),
			changeFrequency: "yearly",
			priority: 0.3,
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
