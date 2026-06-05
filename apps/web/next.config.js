/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
	},
	experimental: {
		optimizePackageImports: ["@tabler/icons-react", "motion"],
	},
	poweredByHeader: false,
	async headers() {
		const extensions = [
			"png",
			"jpg",
			"jpeg",
			"gif",
			"svg",
			"webp",
			"avif",
			"woff2",
			"ico",
		];
		return extensions.map((ext) => ({
			source: `/:path*.${ext}`,
			headers: [
				{
					key: "Cache-Control",
					value: "public, max-age=604800, stale-while-revalidate=31536000",
				},
			],
		}));
	},
};

export default nextConfig;
