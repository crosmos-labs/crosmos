import { type SVGProps, useId } from "react";

/** OpenAI mark. */
export function OpenAI(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			aria-hidden="true"
			preserveAspectRatio="xMidYMid"
			viewBox="0 0 256 260"
		>
			<path
				fill="currentColor"
				d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
			/>
		</svg>
	);
}

/** Anthropic Claude mark. */
export function ClaudeAI(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			aria-hidden="true"
			preserveAspectRatio="xMidYMid"
			viewBox="0 0 256 257"
		>
			<path
				fill="#D97757"
				d="m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z"
			/>
		</svg>
	);
}

/** OpenAI Codex mark. */
export function Codex(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			aria-hidden="true"
			preserveAspectRatio="xMidYMid"
			viewBox="0 0 24 24"
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M8.086.457a6.105 6.105 0 013.046-.415c1.333.153 2.521.72 3.564 1.7a.117.117 0 00.107.029c1.408-.346 2.762-.224 4.061.366l.063.03.154.076c1.357.703 2.33 1.77 2.918 3.198.278.679.418 1.388.421 2.126a5.655 5.655 0 01-.18 1.631.167.167 0 00.04.155 5.982 5.982 0 011.578 2.891c.385 1.901-.01 3.615-1.183 5.14l-.182.22a6.063 6.063 0 01-2.934 1.851.162.162 0 00-.108.102c-.255.736-.511 1.364-.987 1.992-1.199 1.582-2.962 2.462-4.948 2.451-1.583-.008-2.986-.587-4.21-1.736a.145.145 0 00-.14-.032c-.518.167-1.04.191-1.604.185a5.924 5.924 0 01-2.595-.622 6.058 6.058 0 01-2.146-1.781c-.203-.269-.404-.522-.551-.821a7.74 7.74 0 01-.495-1.283 6.11 6.11 0 01-.017-3.064.166.166 0 00.008-.074.115.115 0 00-.037-.064 5.958 5.958 0 01-1.38-2.202 5.196 5.196 0 01-.333-1.589 6.915 6.915 0 01.188-2.132c.45-1.484 1.309-2.648 2.577-3.493.282-.188.55-.334.802-.438.286-.12.573-.22.861-.304a.129.129 0 00.087-.087A6.016 6.016 0 015.635 2.31C6.315 1.464 7.132.846 8.086.457zm-.804 7.85a.848.848 0 00-1.473.842l1.694 2.965-1.688 2.848a.849.849 0 001.46.864l1.94-3.272a.849.849 0 00.007-.854l-1.94-3.393zm5.446 6.24a.849.849 0 000 1.695h4.848a.849.849 0 000-1.696h-4.848z"
			/>
		</svg>
	);
}

/** opencode mark. */
export function OpenCode(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			aria-hidden="true"
			preserveAspectRatio="xMidYMid"
			viewBox="84 84 344 344"
		>
			<path fill="currentColor" opacity={0.3} d="M320 224V352H192V224H320Z" />
			<path
				fill="currentColor"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M384 416H128V96H384V416ZM320 160H192V352H320V160Z"
			/>
		</svg>
	);
}

/** Model Context Protocol mark. */
export function ModelContextProtocol(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			aria-hidden="true"
			preserveAspectRatio="xMidYMid"
			viewBox="0 0 24 24"
		>
			<path
				fill="currentColor"
				d="M13.85 0a4.16 4.16 0 0 0-2.95 1.217L1.456 10.66a.835.835 0 0 0 0 1.18.835.835 0 0 0 1.18 0l9.442-9.442a2.49 2.49 0 0 1 3.541 0 2.49 2.49 0 0 1 0 3.541L8.59 12.97l-.1.1a.835.835 0 0 0 0 1.18.835.835 0 0 0 1.18 0l.1-.098 7.03-7.034a2.49 2.49 0 0 1 3.542 0l.049.05a2.49 2.49 0 0 1 0 3.54l-8.54 8.54a1.96 1.96 0 0 0 0 2.755l1.753 1.753a.835.835 0 0 0 1.18 0 .835.835 0 0 0 0-1.18l-1.753-1.753a.266.266 0 0 1 0-.394l8.54-8.54a4.185 4.185 0 0 0 0-5.9l-.05-.05a4.16 4.16 0 0 0-2.95-1.218c-.2 0-.401.02-.6.048a4.17 4.17 0 0 0-1.17-3.552A4.16 4.16 0 0 0 13.85 0m0 3.333a.84.84 0 0 0-.59.245L6.275 10.56a4.186 4.186 0 0 0 0 5.902 4.186 4.186 0 0 0 5.902 0L19.16 9.48a.835.835 0 0 0 0-1.18.835.835 0 0 0-1.18 0l-6.985 6.984a2.49 2.49 0 0 1-3.54 0 2.49 2.49 0 0 1 0-3.54l6.983-6.985a.835.835 0 0 0 0-1.18.84.84 0 0 0-.59-.245"
			/>
		</svg>
	);
}

/** Google Gemini mark. */
export function Gemini(props: SVGProps<SVGSVGElement>) {
	const uid = useId();
	const id = (name: string) => `${uid}-${name}`;
	return (
		<svg {...props} aria-hidden="true" viewBox="0 0 296 298" fill="none">
			<mask
				id={id("a")}
				width="296"
				height="298"
				x="0"
				y="0"
				maskUnits="userSpaceOnUse"
				style={{ maskType: "alpha" }}
			>
				<path
					fill="#3186FF"
					d="M141.201 4.886c2.282-6.17 11.042-6.071 13.184.148l5.985 17.37a184.004 184.004 0 0 0 111.257 113.049l19.304 6.997c6.143 2.227 6.156 10.91.02 13.155l-19.35 7.082a184.001 184.001 0 0 0-109.495 109.385l-7.573 20.629c-2.241 6.105-10.869 6.121-13.133.025l-7.908-21.296a184 184 0 0 0-109.02-108.658l-19.698-7.239c-6.102-2.243-6.118-10.867-.025-13.132l20.083-7.467A183.998 183.998 0 0 0 133.291 26.28l7.91-21.394Z"
				/>
			</mask>
			<g mask={`url(#${id("a")})`}>
				<g filter={`url(#${id("b")})`}>
					<ellipse cx="163" cy="149" fill="#3689FF" rx="196" ry="159" />
				</g>
				<g filter={`url(#${id("c")})`}>
					<ellipse cx="33.5" cy="142.5" fill="#F6C013" rx="68.5" ry="72.5" />
				</g>
				<g filter={`url(#${id("d")})`}>
					<ellipse cx="19.5" cy="148.5" fill="#F6C013" rx="68.5" ry="72.5" />
				</g>
				<g filter={`url(#${id("e")})`}>
					<path
						fill="#FA4340"
						d="M194 10.5C172 82.5 65.5 134.333 22.5 135L144-66l50 76.5Z"
					/>
				</g>
				<g filter={`url(#${id("f")})`}>
					<path
						fill="#FA4340"
						d="M190.5-12.5C168.5 59.5 62 111.333 19 112L140.5-89l50 76.5Z"
					/>
				</g>
				<g filter={`url(#${id("g")})`}>
					<path
						fill="#14BB69"
						d="M194.5 279.5C172.5 207.5 66 155.667 23 155l121.5 201 50-76.5Z"
					/>
				</g>
				<g filter={`url(#${id("h")})`}>
					<path
						fill="#14BB69"
						d="M196.5 320.5C174.5 248.5 68 196.667 25 196l121.5 201 50-76.5Z"
					/>
				</g>
			</g>
			<defs>
				<filter
					id={id("b")}
					width="464"
					height="390"
					x="-69"
					y="-46"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="18"
					/>
				</filter>
				<filter
					id={id("c")}
					width="265"
					height="273"
					x="-99"
					y="6"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
				<filter
					id={id("d")}
					width="265"
					height="273"
					x="-113"
					y="12"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
				<filter
					id={id("e")}
					width="299.5"
					height="329"
					x="-41.5"
					y="-130"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
				<filter
					id={id("f")}
					width="299.5"
					height="329"
					x="-45"
					y="-153"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
				<filter
					id={id("g")}
					width="299.5"
					height="329"
					x="-41"
					y="91"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
				<filter
					id={id("h")}
					width="299.5"
					height="329"
					x="-39"
					y="132"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
			</defs>
		</svg>
	);
}
