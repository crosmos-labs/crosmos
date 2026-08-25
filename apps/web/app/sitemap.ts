import type { MetadataRoute } from "next";
import { getAllBlogs } from "@/lib/blog";
import { getLegalDoc } from "@/lib/legal";
import {
	SITE_URL as BASE_URL,
	CONSOLE_URL,
	DOCS_URL,
	SITE_URL,
} from "@/lib/site";

const SITE_LAST_MODIFIED = new Date("2026-06-07");

export default function sitemap(): MetadataRoute.Sitemap {
	const blogs = getAllBlogs();
	const latestBlogDate = blogs[0]?.publishedAt
		? new Date(blogs[0].publishedAt)
		: SITE_LAST_MODIFIED;

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: `${SITE_URL}/`,
			lastModified: SITE_LAST_MODIFIED,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${DOCS_URL}/`,
			lastModified: SITE_LAST_MODIFIED,
			changeFrequency: "weekly",
			priority: 0.95,
		},
		{
			url: `${CONSOLE_URL}/`,
			lastModified: SITE_LAST_MODIFIED,
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/blogs`,
			lastModified: latestBlogDate,
			changeFrequency: "weekly",
			priority: 0.75,
		},
		{
			url: `${DOCS_URL}/quickstart`,
			lastModified: SITE_LAST_MODIFIED,
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${DOCS_URL}/sdks`,
			lastModified: SITE_LAST_MODIFIED,
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/terms`,
			lastModified: new Date(getLegalDoc("terms").updatedAt),
			changeFrequency: "yearly",
			priority: 0.25,
		},
		{
			url: `${BASE_URL}/privacy`,
			lastModified: new Date(getLegalDoc("privacy").updatedAt),
			changeFrequency: "yearly",
			priority: 0.25,
		},
	];

	const blogRoutes: MetadataRoute.Sitemap = blogs.map((post) => ({
		url: `${BASE_URL}/blogs/${post.slug}`,
		lastModified: new Date(post.updatedAt),
		changeFrequency: "monthly",
		priority: 0.55,
	}));

	return [...staticRoutes, ...blogRoutes];
}
