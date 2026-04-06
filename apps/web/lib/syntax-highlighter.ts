import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";

const TOKEN_COLOR_MAP: Record<string, string> = {
	comment: "text-[#5c6370]",
	string: "text-[#98c379]",
	keyword: "text-[#c678dd]",
	boolean: "text-[#d19a66]",
	number: "text-[#d19a66]",
	function: "text-[#61afef]",
	"class-name": "text-[#e5c07b]",
	operator: "text-[#abb2bf]",
	punctuation: "text-[#abb2bf]",
	property: "text-[#e5c07b]",
	builtin: "text-[#61afef]",
	variable: "text-[#e5c07b]",
};

export function getHighlightedChars(
	codeLines: string[],
	language: string,
): string[][] {
	const code = codeLines.join("\n");
	const grammar = Prism.languages[language] || Prism.languages.javascript;
	const tokens = Prism.tokenize(code, grammar as Prism.Grammar);

	const charColors: string[] = [];

	function walk(token: string | Prism.Token, parentType?: string) {
		if (typeof token === "string") {
			const colorClass =
				parentType && TOKEN_COLOR_MAP[parentType]
					? TOKEN_COLOR_MAP[parentType]
					: "text-[#abb2bf]";
			for (let i = 0; i < token.length; i++) {
				charColors.push(colorClass);
			}
		} else {
			const type = token.type;
			if (typeof token.content === "string") {
				const colorClass =
					TOKEN_COLOR_MAP[type] ||
					(parentType && TOKEN_COLOR_MAP[parentType]) ||
					"text-[#abb2bf]";
				for (let i = 0; i < token.content.length; i++) {
					charColors.push(colorClass);
				}
			} else if (Array.isArray(token.content)) {
				for (const t of token.content) {
					walk(t, type);
				}
			} else {
				walk(token.content as Prism.Token, type);
			}
		}
	}

	for (const token of tokens) {
		walk(token);
	}

	const lines: string[][] = [];
	let currentLine: string[] = [];

	for (let i = 0; i < code.length; i++) {
		if (code[i] === "\n") {
			lines.push(currentLine);
			currentLine = [];
		} else {
			currentLine.push(charColors[i] || "text-[#abb2bf]");
		}
	}
	lines.push(currentLine);

	return lines;
}
