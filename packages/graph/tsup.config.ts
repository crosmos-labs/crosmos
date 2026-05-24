import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"adapters/crosmos/index": "src/adapters/crosmos/index.ts",
		"mock/index": "src/mock/index.ts",
	},
	format: ["esm", "cjs"],
	dts: true,
	splitting: true,
	clean: true,
	external: [
		"react",
		"react-dom",
		"react-force-graph-2d",
		"d3-force",
	],
	loader: {
		".css": "copy",
	},
	publicDir: "src/public",
	sourcemap: true,
	minify: false,
	treeshake: true,
});
