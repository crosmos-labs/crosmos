export function getRedirectUri() {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	if (baseUrl) return `${baseUrl}/auth/callback`;

    const previewUrl = process.env.VERCEL_BRANCH_URL;
    if (previewUrl) return `https://${previewUrl}/auth/callback`

	return "http://localhost:3000/auth/callback";
}
