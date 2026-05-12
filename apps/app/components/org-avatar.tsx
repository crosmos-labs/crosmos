import { cn } from "@crosmos/ui/lib/utils";
import { generateColours } from "@/lib/avatar-gradient";

export function OrgAvatar({
	slug,
	className,
}: {
	slug: string;
	className?: string;
}) {
	const [c1, c2] = generateColours(slug);
	const safeSlug =
		slug
			.toLowerCase()
			.replace(/[^a-z0-9_-]/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "") || "fallback";
	const gradId = `org-grad-${safeSlug}`;

	return (
		<div
			className={cn(
				"flex size-8 items-center justify-center shrink-0",
				className,
			)}
		>
			<svg
				viewBox="0 0 32 32"
				fill="none"
				role="img"
				aria-label={`${slug} avatar`}
				className="size-full rounded-md"
			>
				<rect width="32" height="32" rx="6" fill={`url(#${gradId})`} />
				<defs>
					<linearGradient
						id={gradId}
						x1="0"
						y1="0"
						x2="32"
						y2="32"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor={c1} />
						<stop offset="1" stopColor={c2} />
					</linearGradient>
				</defs>
			</svg>
		</div>
	);
}
