interface ConversationTurn {
	role: string;
	text: string;
}

const ROLE = "[A-Za-z][\\w-]{0,49}";
const TURN_BOUNDARY = new RegExp(`^(${ROLE}): (.*)$`);
const ROLE_PREFIX = new RegExp(`^${ROLE}:(?: |$)`);

export function stripRolePrefix(line: string): string {
	return line.replace(ROLE_PREFIX, "");
}

export function parseConversationTurns(
	content: string,
): ConversationTurn[] | null {
	const turns: { role: string; lines: string[] }[] = [];

	for (const line of content.split("\n")) {
		const match = line.match(TURN_BOUNDARY);
		const role = match?.[1];
		if (match && role) {
			turns.push({ role, lines: [match[2] ?? ""] });
		} else if (turns.length > 0) {
			turns[turns.length - 1]?.lines.push(line);
		} else if (line.trim()) {
			return null;
		}
	}

	if (turns.length === 0) return null;
	return turns.map((turn) => ({
		role: turn.role,
		text: turn.lines.join("\n").trim(),
	}));
}
