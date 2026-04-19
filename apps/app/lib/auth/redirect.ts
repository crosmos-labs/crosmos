export function getRedirectUri() {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    console.log("VERCEL_URL: ", process.env.VERCEL_URL);
    console.log("BASE_URL: ", process.env.NEXT_PUBLIC_BASE_URL);
	if (baseUrl) return `${baseUrl}/auth/callback`;

	return "http://localhost:3000/auth/callback";
}
