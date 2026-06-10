type Transformation = {
	before: string;
	after: string;
	description: string;
};

const TRANSFORMATIONS: Transformation[] = [
	{
		before: "Scattered context",
		after: "Unified memory",
		description:
			"Context across Slack, docs, and tickets becomes a single queryable layer.",
	},
	{
		before: "Stateless sessions",
		after: "Persistent context",
		description:
			"Every interaction builds on the last. No more starting from zero.",
	},
	{
		before: "Guesswork",
		after: "Structured facts",
		description:
			"Agents get precise facts, not document chunks to parse through.",
	},
	{
		before: "Knowledge decay",
		after: "Compounding intelligence",
		description:
			"Organizational knowledge strengthens over time instead of degrading.",
	},
];

export function Problem() {
	return (
		<section
			id="problem"
			className="relative px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
					{/* Content column — 60% on lg+ */}
					<div className="lg:col-span-3">
						<p className="text-primary font-mono font-bold uppercase mb-4">
							[ The Problem ]
						</p>
						<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
							Scattered context. Stateless agents.
						</h2>
						<p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
							Context lives in Slack, docs, tickets, and meetings. Agents see
							fragments, not the picture. Crosmos builds structured
							organizational memory — queryable, persistent, and self-improving.
						</p>

						<div className="mt-10 sm:mt-12">
							{TRANSFORMATIONS.map((t, i) => (
								<div
									key={t.before}
									className={
										i === 0 ? "py-5" : "py-5 border-t border-foreground/10"
									}
								>
									<div className="flex flex-wrap items-baseline gap-x-3 text-base sm:text-lg">
										<span className="text-muted-foreground line-through decoration-foreground/30">
											{t.before}
										</span>
										<span className="text-foreground/40" aria-hidden="true">
											→
										</span>
										<span className="text-foreground font-semibold">
											{t.after}
										</span>
									</div>
									<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
										{t.description}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Asset column — 40% on lg+ */}
					<div className="lg:col-span-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 200 315"
							className="w-full h-auto rounded"
							aria-label="Technology integration diagram showing data sources flowing into Crosmos memory"
						>
							<style type="text/css">{`.cls-1{fill:none;stroke:#000;stroke-width:.4;stroke-linecap:round;stroke-miterlimit:10}.cls-2{fill:#242424}.cls-3{fill:#fff}.cls-4{fill:#326DE6}.cls-6{fill:#f1f1f1}.cls-7{fill:#757575}.cls-14{fill:#D17048}.cls-15{fill:#4757FF}.cls-26{fill:none;stroke:#ddd;stroke-width:.25;stroke-miterlimit:10}`}</style>
							<defs>
								{/* Arrowhead — points right in marker space; orient="auto" rotates it to follow each line */}
								<marker
									id="arr"
									markerWidth="2.5"
									markerHeight="4"
									refX="2.5"
									refY="2"
									orient="auto"
									markerUnits="userSpaceOnUse"
								>
									<path d="M0,0 L2.5,2 L0,4 Z" fill="#000000" />
								</marker>
								<linearGradient
									id="g1"
									x1="117.3"
									x2="120.4"
									y1="20.67"
									y2="12.51"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#C7204B" offset="0" />
									<stop stopColor="#C73148" offset="1" />
								</linearGradient>
								<linearGradient
									id="g2"
									x1="116.9"
									x2="120.6"
									y1="11.41"
									y2="10.38"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#E0203D" offset="0" />
									<stop stopColor="#C7204B" offset="1" />
								</linearGradient>
								<linearGradient
									id="g3"
									x1="124.9"
									x2="128"
									y1="16.77"
									y2="13.66"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#D6AB3C" offset="0" />
									<stop stopColor="#C5A630" offset="1" />
								</linearGradient>
								<linearGradient
									id="g4"
									x1="117.3"
									x2="123.8"
									y1="5.734"
									y2="8.265"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#19C7E9" offset="0" />
									<stop stopColor="#19B5DD" offset="1" />
								</linearGradient>
								<linearGradient
									id="g5"
									x1="120.9"
									x2="124"
									y1="2.336"
									y2="5.452"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#24D2E9" offset="0" />
									<stop stopColor="#19C7E9" offset="1" />
								</linearGradient>
								<linearGradient
									id="g6"
									x1="125.9"
									x2="125.9"
									y1="2.181"
									y2="8.89"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#28B463" offset="0" />
									<stop stopColor="#289C57" offset="1" />
								</linearGradient>
								<linearGradient
									id="g7"
									x1="128.6"
									x2="132.1"
									y1="7.098"
									y2="7.098"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#28AC60" offset="0" />
									<stop stopColor="#28AB56" offset="1" />
								</linearGradient>
								<linearGradient
									id="g8"
									x1="124.9"
									x2="132.1"
									y1="11.45"
									y2="11.45"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#D6AB3C" offset="0" />
									<stop stopColor="#C5A42E" offset="1" />
								</linearGradient>
								<linearGradient
									id="g9"
									x1="185.6"
									x2="197.9"
									y1="4.807"
									y2="13.38"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#8990E5" offset="0" />
									<stop stopColor="#5059DF" offset="1" />
								</linearGradient>
								<linearGradient
									id="g10"
									x1="102.4"
									x2="102.4"
									y1="218.2"
									y2="198.7"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopOpacity="0" offset="0" />
									<stop stopColor="#4D4D4D" offset="1" />
								</linearGradient>
								<linearGradient
									id="g11"
									x1="102.4"
									x2="102.4"
									y1="217"
									y2="198.5"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#999" stopOpacity="0" offset="0" />
									<stop stopColor="#666" offset="1" />
								</linearGradient>
								<linearGradient
									id="g12"
									x1="102.4"
									x2="102.4"
									y1="216.6"
									y2="198.7"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#ccc" stopOpacity="0" offset="0" />
									<stop stopColor="#999" offset="1" />
								</linearGradient>
								<linearGradient
									id="g13"
									x1="102.4"
									x2="102.4"
									y1="216.3"
									y2="198.5"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopOpacity="0" offset="0" />
									<stop stopColor="#333" offset="1" />
								</linearGradient>
								<linearGradient
									id="g14"
									x1="102.4"
									x2="102.4"
									y1="209"
									y2="198.8"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#999" offset="0" />
									<stop stopColor="#4D4D4D" offset="1" />
								</linearGradient>
								<linearGradient
									id="g15"
									x1="81.2"
									x2="124"
									y1="195"
									y2="195"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#1A1A1A" offset="0" />
									<stop stopColor="#262626" offset="1" />
								</linearGradient>
								<linearGradient
									id="g16"
									x1="102.4"
									x2="102.4"
									y1="201.6"
									y2="178.1"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#333" offset="0" />
									<stop stopColor="#2B2B2B" offset="1" />
								</linearGradient>
							</defs>

							{/* Service icons — fixed at top */}
							<path d="m36.1 7.6c1-1.8-0.3-4.2-2.6-4.2-0.4 0-0.7 0-0.9 0.1-1.6-1.7-5.1-1.4-6 1.1-2.1 0.4-3.2 2.8-2 4.7-0.7 2.3 1.3 5.3 3.9 4.8 1.4 1.8 5 1.8 6.1-0.9 2.3-0.1 3.5-3.1 1.8-5.3l-0.3-0.3zm-2.7-3.3c1.3 0 2.4 1.3 2.1 2.6l-2.3-1.3c-0.2-0.2-0.5-0.2-0.8 0l-2.9 1.6v-1.3l2.6-1.4c0.5-0.2 0.9-0.2 1.3-0.2zm-4.3-1c0.6-0.2 1.5-0.2 2.3 0.4l-2.5 1.3c-0.3 0.1-0.4 0.4-0.4 0.7v2.2l-1-0.5v-2.1c0-1 0.7-1.8 1.6-2zm-3.6 5.6c-0.7-1-0.3-2.7 1-3.1v2.1c0 0.3 0.1 0.6 0.4 0.7l2.7 1.6-1 0.6-2.4-1.4c-0.3 0-0.6-0.3-0.7-0.5zm0.6 4.1c-0.7-0.6-1-1.6-0.7-2.4l2.8 1.5c0.3 0.1 0.6 0.1 0.8 0l2.6-1.5v1.2l-2.4 1.2c-1 0.6-2.3 0.6-3.1 0zm7.5-0.4c-0.2 1.5-2.5 2.5-4 1.3l2.5-1.3c0.3-0.1 0.4-0.5 0.4-0.7v-2.5l1 0.6v2.1l0.1 0.5zm1-0.4v-2.8c0-0.3-0.1-0.5-0.4-0.7l-2.7-1.6 1.1-0.6 2.4 1.4c1.5 0.7 1.5 3.7-0.4 4.3z" />
							<path
								className="cls-4"
								d="m58.5 4.9v9.7c0 0.5-0.4 1-0.9 1h-8.8c-0.5 0-1-0.4-1-1v-12c0-0.5 0.4-0.8 1-0.8h5.8l3.9 3.1z"
							/>
							<path
								d="m54.5 1.8v2.6c0 0.2 0.4 0.6 0.7 0.6h3.3l-4-3.2z"
								fill="#4285F4"
							/>
							<path
								className="cls-3"
								d="m56.1 8.9h-6v-0.9h6v0.9zm-1.9 2.7h-4.1v-0.8h4.1v0.8zm1.9-3.6h-6v-0.9h6v0.9z"
							/>
							<path
								d="m88.6 5.6v9.4c0 0.5-0.4 0.9-0.9 0.9h-9.2c-0.5 0-0.9-0.4-0.9-0.9v-12.1c0-0.5 0.4-0.9 0.9-0.9h5.9l4.2 3.6z"
								fill="#34A853"
							/>
							<path
								d="m84.4 2 0.1 3.4c0 0.2 0.4 0.6 0.7 0.6h3.4l-4.2-4z"
								fill="#188038"
							/>
							<path
								className="cls-3"
								d="m79.7 7.5v4.9h6.7v-4.9h-6.7zm2.8 3.9h-1.9v-1.2h1.9v1.2zm0-1.9h-1.9v-1h1.9v1zm3.1 1.9h-2.2v-1.2h2.2v1.2zm0-1.9h-2.2v-1h2.2v1z"
							/>
							<path className="cls-6" d="m98.4 4.5h7.5v9.4h-7.5v-9.4z" />
							<path
								d="m96.5 3.4v12.1c0 0.3 0.1 0.5 0.4 0.5h10.6c0.4 0 0.5-0.1 0.5-0.5v-12.1c0-0.3-0.1-0.5-0.5-0.5h-10.6c-0.1 0-0.4 0.1-0.4 0.5zm2.1 1.6h7v8.6h-7v-8.6z"
								fill="#20211E"
							/>
							<path className="cls-7" d="m100.6 6.6h3.4v5.4h-3.4v-5.4z" />
							<path d="m100.6 6.6h3.4v1.3h-3.4v-1.3z" fill="#595959" />
							<path
								d="m120.9 11.1v4.1c0.5 2 3.1 1.4 3.1-0.2v-3.9c0-1.9-3.1-2-3.1 0z"
								fill="url(#g1)"
							/>
							<path
								d="m118.8 9.6c-2.2 0-2.2 3.4 0 3.4 2.1 0 2.3-3.4 0-3.4z"
								fill="url(#g2)"
							/>
							<path
								d="m126.1 13.5c-2 0-1.2 0-1.2 1.9 0.5 2.2 3.2 1.5 3.2 0 0-0.9-0.7-1.9-2-1.9z"
								fill="url(#g3)"
							/>
							<path
								d="m122.6 5.6c-3.5 0-5.2-0.4-5.5 1.3 0 1 0.7 1.6 1.7 1.6h3.8c1.9 0 1.9-2.9 0-2.9z"
								fill="url(#g4)"
							/>
							<path
								d="m122.5 2c-1.7 0-1.7 3.1 0.1 3.1h1.4c0-2.1 0.5-2.7-1.5-3.1z"
								fill="url(#g5)"
							/>
							<path
								d="m126.4 2.2c-0.8 0-1.5 0.7-1.5 1.7v3.5c0 2 3.1 2.1 3.1 0v-3.9c0-0.8-0.6-1.3-1.6-1.3z"
								fill="url(#g6)"
							/>
							<path
								d="m130.4 5.6c-2.2 0-2 3.4 0 3.4 2.2 0 2.2-3.4 0-3.4z"
								fill="url(#g7)"
							/>
							<path
								d="m130.5 9.9h-4.1c-2 0-2 3.1 0 3.1h4.1c2.1 0.1 2.4-3.1 0-3.1z"
								fill="url(#g8)"
							/>
							<path
								className="cls-14"
								d="m163.1 1.8h9.5c1.8 0 3.4 1.2 3.5 3.2v8.6c0 1.9-1.5 3.2-3.5 3.2h-9.7c-1.7 0-3.5-1.2-3.5-3.2v-8.6c0.1-1.9 1.5-3.2 3.7-3.2z"
							/>
							<path
								className="cls-3"
								d="m173.1 9.4-3.6-0.3 3-0.6-0.1-0.9-3.3 0.6 2.4-2.6-0.9-0.6-2 2.5v-3.1h-0.7l0.1 3.2-2.4-3.6-1 0.4 2.2 3.5-3.4-2.3-0.5 0.8 3.6 2.6h-4.3v0.6h4.4l-3.5 2.3 0.4 0.7 3.6-2.1-1.9 3.1 0.7 0.4 1.7-3-0.4 3.5h0.7l0.5-3.6 1.8 3 0.9-0.5-1.7-2.8 2.4 2 0.3-0.5-2.6-2.2 3.6 0.5v-1z"
							/>
							<path
								d="m187.1 4.6c1-1.1 2.5-2 4.8-2 6.5-0.2 8.7 7.5 5 11.3l-9.8-9.3zm-0.5 0.8c-0.1 0.2-0.2 0.5-0.4 0.7l8.9 8.9c0.3-0.1 0.5-0.4 0.8-0.5l-9.3-9.1zm-0.7 1.5c-0.3 0.5-0.3 1.1-0.3 1.6l7 7.4c0.5 0 1-0.3 1.5-0.4l-8.2-8.6zm0.1 3.9c0.6 2.3 2.5 4.6 5 4.8l-5-4.8z"
								fill="url(#g9)"
							/>
							<path
								className="cls-15"
								d="m14.2 4.4c-1.3-0.8-3.1-1-3.1-1l-0.5 1c-1.7-0.3-3.4 0-3.4 0l-0.7-1c-1.6 0.2-3.1 1-3.1 1-2 4.2-2.3 6-1.9 9l3.4 1.7 0.7-0.1 0.8-1.4-1.3-1c3 2 6.3 1 6.8 0.8l0.7 1.5 0.6 0.2 3-1.6c0.7-4.3-1.1-7.4-2-9.1zm-8.1 6.7c-0.9-0.1-1.5-0.7-1.2-1.7 0.1-0.9 0.7-1.5 1.5-1.4s1.4 1 1.2 1.9c-0.1 0.6-0.7 1.2-1.5 1.2zm5 0c-0.7 0-1.2-0.7-1.1-1.7 0-0.9 0.8-1.5 1.5-1.4s1.4 1 1.3 1.9c-0.2 0.6-0.9 1.2-1.7 1.2z"
							/>

							{/* Arrows: icons → avatars
							    Identical geometry for all 3 columns: top spread ±20 from avatar centre,
							    converges to ±5 at avatar top — left/right are perfect mirrors. */}
							{/* Left avatar (centre x=30.4) */}
							<line
								className="cls-1"
								x1="10.4"
								y1="17"
								x2="25.4"
								y2="75"
								markerEnd="url(#arr)"
							/>
							<line
								className="cls-1"
								x1="30.4"
								y1="17"
								x2="30.4"
								y2="75"
								markerEnd="url(#arr)"
							/>
							<line
								className="cls-1"
								x1="50.4"
								y1="17"
								x2="35.4"
								y2="75"
								markerEnd="url(#arr)"
							/>
							{/* Centre avatar (centre x=102.2) */}
							<line
								className="cls-1"
								x1="82.2"
								y1="17"
								x2="97.2"
								y2="75"
								markerEnd="url(#arr)"
							/>
							<line
								className="cls-1"
								x1="102.2"
								y1="17"
								x2="102.2"
								y2="75"
								markerEnd="url(#arr)"
							/>
							<line
								className="cls-1"
								x1="122.2"
								y1="17"
								x2="107.2"
								y2="75"
								markerEnd="url(#arr)"
							/>
							{/* Right avatar (centre x=180.4) — x at icon centres, y just below icons */}
							<line
								className="cls-1"
								x1="170"
								y1="17"
								x2="175.4"
								y2="75"
								markerEnd="url(#arr)"
							/>
							<line
								className="cls-1"
								x1="192"
								y1="17"
								x2="185.4"
								y2="75"
								markerEnd="url(#arr)"
							/>

							{/* User avatars — shifted down 30 */}
							<g transform="translate(0, 30)">
								<path
									className="cls-2"
									d="m30.2 49.1c-2.6 0-4.8 2.2-4.8 4.9 0 2.6 2.2 4.8 4.8 4.8s4.8-2.2 4.8-4.8-2.1-4.9-4.8-4.9zm2.9 11.3h-5.7c-2.9 0-5.7 2.2-5.8 5.1v1.5c0 0.4 0.3 0.9 0.8 0.9h15.5c0.4 0 0.7-0.4 0.7-0.9v-1.5c0-2.9-2.7-5.1-5.5-5.1z"
								/>
								<path
									className="cls-2"
									d="m102.2 49.1c-2.6 0-4.7 2.2-4.7 4.9 0 2.6 2.1 4.8 4.7 4.8s4.6-2.2 4.6-4.8-2-4.9-4.6-4.9zm3.3 11h-6.6c-2.3 0-4.6 1.6-4.6 4.3v2.8c0 0.4 0.3 0.7 0.6 0.7h14.5c0.4 0 0.7-0.3 0.7-0.7v-2.8c0-2.5-2-4.3-4.6-4.3z"
								/>
								<path
									className="cls-2"
									d="m180.4 49.3c-2.6 0-4.8 2.2-4.8 4.9 0 2.6 2.2 4.8 4.8 4.8s4.8-2.2 4.8-4.8-2.1-4.9-4.8-4.9zm3 11h-6.4c-2.6 0-5.2 1.7-5.2 4.6v2.3c0 0.3 0.3 0.7 0.6 0.7h14.8c0.4 0 0.6-0.3 0.6-0.7v-2.8c0-2.2-1.9-4.1-4.4-4.1z"
								/>
							</g>

							{/* Arrows: avatars → hub */}
							<line
								className="cls-1"
								x1="37.3"
								y1="103"
								x2="84"
								y2="176"
								markerEnd="url(#arr)"
							/>
							<line
								className="cls-1"
								x1="102.2"
								y1="104"
								x2="102.2"
								y2="176"
								markerEnd="url(#arr)"
							/>
							<line
								className="cls-1"
								x1="172.9"
								y1="103"
								x2="121"
								y2="176"
								markerEnd="url(#arr)"
							/>

							{/* Central hub — shifted down 60 */}
							<g transform="translate(0, 60)">
								<path
									className="cls-2"
									d="m92.6 116.2h20.2c4.4 0 7.8 3.2 7.8 7.8v20c0 4.1-3.2 8.2-7.8 8.2h-20.3c-4.4 0-7.9-3.2-7.9-8.6v-19.5c0-3.7 2.9-7.9 8-7.9z"
								/>
								<path
									className="cls-3"
									d="m103 127.4c4.2-1 10.6 3.2 10.5 9-0.4 6.8-7 11-11.6 10.2 4.6-0.6 9.2-4 9.3-10.2-0.1-5.3-4.2-8.4-7.8-9h-0.4zm0.2-6.5c-4.8 0.3-9.1 4.6-9.1 10.1 0 5.9 5.3 8.6 7.5 8.9-3.7 0.5-9.5-2.8-9.6-8.4 0-6.1 5.6-11.1 11.2-10.6zm5.4 13.7c1.2 5.4-4 10-9.2 9.6-6.8-0.6-10.5-6-9.8-11.3 0.9 5 4.8 9.1 9.8 9.2 4.8 0.1 8.5-3 9.2-7.5zm-12.6-1.2c-0.8-5.5 3.8-10 9-10 5.5 0 11.5 4.5 11.2 11.1-1.3-5.3-4.8-9.1-11.1-9.1-4.1 0.1-8.5 3.2-9.1 8zm6.5-3.8c2.4 0 4.1 1.8 4.1 4 0 2.3-1.7 4.3-4.1 4.3s-4.3-1.7-4.3-4 1.9-4.3 4.3-4.3zm0.1 1c-1.7 0-3.2 1.4-3.2 3.3 0 1.6 1.6 3.2 3.6 3.1 1.6 0 3-1.4 3-3.1 0-1.9-1.6-3.3-3.4-3.3z"
								/>
							</g>

							{/* Arrow: hub → cube */}
							<line
								className="cls-1"
								x1="102.2"
								y1="214"
								x2="102.2"
								y2="254"
								markerEnd="url(#arr)"
							/>

							{/* 3D data cube — shifted down 80 */}
							<g transform="translate(0, 80)">
								<path
									d="m124 211c0-0.6-0.4-1.5-0.9-1.6l-18.2-9.4c-1.3-0.6-3.3-22-4.9-21.4l-17.8 28.5c-0.6 0.3-1 0.9-1 1.8v9.3h42.8v-7.2z"
									fill="url(#g10)"
								/>
								<path
									d="m123.1 209.5-18.2 9.1h-5.3l-17.4-8c-0.6-0.2-1-1.1-1-1.1 0-0.6 0.4-0.5 1-0.9l17.8-9.6c1.6-0.6 3.6-0.6 4.9 0l18.2 9.9c0.5 0.1 0.9 0.1 0.9 0.6h-0.9z"
									fill="url(#g11)"
								/>
								<path
									d="m123.1 212.5-18.2 9.1h-5.3l-17.4-8.6c-0.6-0.4-1-0.8-1-1.4s0.4-1.1 1-1.2l17.8-9.4c1.6-0.6 3.6-0.6 4.9 0l18.2 9.4c0.5 0.1 0.9 0.6 0.9 1.2 0 0.5-0.4 0.8-0.9 0.9z"
									fill="url(#g12)"
								/>
								<path
									d="m124 201c0-0.6-0.4-2-0.9-2.4l-18.2-6c-1.3-0.6-3.3-0.6-4.9 0l-17.8 7c-0.6 0.3-1 0.8-1 1.5v6.4c0 0.6 0.4 1.5 1 1.6l17.4 8.8h5.3l18.2-8.8c0.5-0.1 0.9-0.9 0.9-1.6v-6.5z"
									fill="url(#g13)"
								/>
								<path
									d="m123.1 202-18.2 9.4c-1.3 0.6-3.3 0.6-4.9 0l-17.8-9c-0.6-0.4-1-0.8-1-1.4 0-0.5 0.4-1.6 1-2l17.8-6.4c1.6-0.6 3.6-0.6 4.9 0l18.2 6.4c0.5 0.4 0.9 1.5 0.9 2 0 0.6-0.4 1-0.9 1z"
									fill="url(#g14)"
								/>
								<path
									d="m124 190-0.1 7.4-0.8 1.1-18.2 9.6c-1.3 0.8-3.3 0.8-4.9 0l-17.8-9.1c-0.6-0.4-1-1-1-1.8v-7.2h42.8z"
									fill="url(#g15)"
								/>
								<path
									d="m123.1 191.6-18.2 9.5c-1.3 0.9-3.3 0.9-4.9 0l-17.8-9.5c-0.6-0.5-1.1-1-1.1-1.6s0.5-1.5 1.1-1.6l17.8-9.8c1.6-0.7 3.6-0.7 4.9 0l18.2 9.5c0.5 0.3 0.9 1 0.9 1.9 0 0.5-0.4 1.4-0.9 1.6z"
									fill="url(#g16)"
								/>
								<path
									className="cls-26"
									d="m123 191.5-18.1 9.5c-1.3 0.6-3.3 0.6-4.9 0l-17.5-9.4c-0.6-0.5-1.4-1-1.3-1.6"
								/>
							</g>
						</svg>
					</div>
				</div>
			</div>
		</section>
	);
}
