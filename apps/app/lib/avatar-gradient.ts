import ColorHash from "color-hash";

const colorHash = new ColorHash({ saturation: 1.0 });

export function generateColours(s: string): [string, string] {
	const mid = Math.ceil(s.length / 2);
	const c1 = colorHash.hex(s.substring(0, mid));
	const c2 = colorHash.hex(s.substring(mid));
	return [c1, c2];
}
