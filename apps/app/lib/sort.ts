export function byCreatedAtDesc<T extends { created_at: string }>(
	items: T[],
): T[] {
	return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
