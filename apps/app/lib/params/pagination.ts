import { parseAsInteger } from "nuqs";

export const paginationParsers = {
	page: parseAsInteger.withDefault(1),
};
