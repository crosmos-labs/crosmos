/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
	},
	poweredByHeader: false,
	async headers() {
		return [
			{
				source: "/:path*.{png,jpg,jpeg,gif,svg,webp,avif,woff2,ico}",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
};

export default nextConfig;
