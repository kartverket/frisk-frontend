export function getIdsFromPath(path: string) {
	return path.split(".").map((part) => Number.parseInt(part));
}

export function getIdFromPath(path: string) {
	return getIdsFromPath(path).at(-1);
}

export function isURL(url: string) {
	return URL.canParse(url);
}
