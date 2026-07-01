import { IconLink } from "@tabler/icons-react";
import { Children, type ComponentProps, type ReactNode } from "react";
import { slugifyHeading } from "@/lib/toc";

export function childrenToText(children: ReactNode): string {
	let out = "";
	Children.forEach(children, (child) => {
		if (typeof child === "string" || typeof child === "number") {
			out += String(child);
		} else if (
			child &&
			typeof child === "object" &&
			"props" in child &&
			(child as { props?: { children?: ReactNode } }).props?.children
		) {
			out += childrenToText(
				(child as { props: { children: ReactNode } }).props.children,
			);
		}
	});
	return out;
}

export function wrapQuotedText(children: ReactNode): ReactNode {
	return Children.map(children, (child, idx) => {
		if (typeof child !== "string") return child;
		const parts = child.split(/("[^"\n]+")/g);
		if (parts.length === 1) return child;
		return parts.map((part, i) => {
			const key = `${idx}-${i}`;
			if (part.length > 2 && part.startsWith('"') && part.endsWith('"')) {
				return (
					<span key={key} className="font-medium text-foreground">
						{part}
					</span>
				);
			}
			return <span key={key}>{part}</span>;
		});
	});
}

export function linkifyText(text: string): ReactNode {
	const parts = text.split(/(https?:\/\/[^\s]+)/g);
	if (parts.length === 1) return text;
	return parts.map((part, i) =>
		/^https?:\/\//.test(part) ? (
			<a key={`${i}`} href={part}>
				{part}
			</a>
		) : (
			part
		),
	);
}

export function AnchorHeading({
	tag: Tag,
	children,
	...rest
}: ComponentProps<"h2"> & { tag: "h2" | "h3" }) {
	const text = childrenToText(children);
	const id = slugifyHeading(text);
	return (
		<Tag id={id} className="group/heading scroll-mt-24" {...rest}>
			{children}
			<a
				href={`#${id}`}
				aria-label={`Link to section: ${text}`}
				className="no-underline opacity-0 group-hover/heading:opacity-100 transition-opacity ml-2 inline-flex align-middle text-muted-foreground hover:text-foreground"
			>
				<IconLink className="size-4 inline-block -mt-0.5" />
			</a>
		</Tag>
	);
}

export const proseMdxComponents = {
	h2: (props: ComponentProps<"h2">) => <AnchorHeading tag="h2" {...props} />,
	h3: (props: ComponentProps<"h3">) => <AnchorHeading tag="h3" {...props} />,
	p: ({ children, ...rest }: ComponentProps<"p">) => (
		<p {...rest}>{wrapQuotedText(children)}</p>
	),
	li: ({ children, ...rest }: ComponentProps<"li">) => (
		<li {...rest}>{wrapQuotedText(children)}</li>
	),
};
