import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.tsx"],
	format: ["esm", "cjs"],
	dts: true,
	splitting: true,
	clean: true,
	external: ["react", "react-dom", "d3-force"],
	sourcemap: true,
	minify: false,
	treeshake: true,
});
