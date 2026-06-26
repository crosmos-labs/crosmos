"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@crosmos/ui/components/avatar";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@crosmos/ui/components/hover-card";
import { cn } from "@crosmos/ui/lib/utils";
import { IconBrandLinkedin, IconBrandX, IconClock } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { Author } from "@/lib/blog";

type BlogCardProps = {
	slug: string;
	title: string;
	author: Author;
	readTime: number;
	thumbnail: string;
	thumbnailWidth: number;
	thumbnailHeight: number;
	className?: string;
};

export function BlogCard({
	slug,
	title,
	author,
	readTime,
	thumbnail,
	thumbnailWidth,
	thumbnailHeight,
	className,
}: BlogCardProps) {
	return (
		<div
			className={cn(
				"group relative flex w-full flex-col overflow-hidden border border-foreground/10 hover:border-foreground/30 transition-all duration-300",
				className,
			)}
		>
			<Link href={`/blogs/${slug}`} className="flex flex-col flex-1">
				<div className="relative w-full overflow-hidden">
					<Image
						src={thumbnail}
						alt={title}
						width={thumbnailWidth}
						height={thumbnailHeight}
						sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
						className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
					/>
				</div>
				<div className="flex flex-col shrink-0 px-4 pt-4 pb-0">
					<h3 className="font-semibold text-sm sm:text-base leading-snug line-clamp-2">
						{title}
					</h3>
				</div>
			</Link>
			<div className="flex items-center justify-between shrink-0 px-4 pb-4 pt-3">
				<HoverCard>
					<HoverCardTrigger asChild>
						<button
							type="button"
							className="outline-none"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									e.stopPropagation();
								}
							}}
						>
							<Avatar size="sm">
								<AvatarImage src={author.avatar} alt={author.name} />
								<AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
							</Avatar>
						</button>
					</HoverCardTrigger>
					<HoverCardContent className="flex flex-col gap-2">
						<div className="flex items-center gap-3">
							<Avatar>
								<AvatarImage src={author.avatar} alt={author.name} />
								<AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<span className="font-semibold text-sm">{author.name}</span>
								<span className="text-xs text-muted-foreground">
									{author.role}
								</span>
							</div>
						</div>
						<div className="flex items-center gap-2 pt-1">
							{author.socials.x && (
								<a
									href={author.socials.x}
									target="_blank"
									rel="noopener noreferrer"
									onClick={(e) => e.stopPropagation()}
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									<IconBrandX className="size-4" />
								</a>
							)}
							{author.socials.linkedin && (
								<a
									href={author.socials.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									onClick={(e) => e.stopPropagation()}
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									<IconBrandLinkedin className="size-4" />
								</a>
							)}
						</div>
					</HoverCardContent>
				</HoverCard>
				<span className="text-xs text-muted-foreground flex items-center gap-1">
					<IconClock className="size-3" />
					{readTime} min read
				</span>
			</div>
		</div>
	);
}
