export function getIdsFromPath(path: string) {
	return path.split(".").map((part) => Number.parseInt(part));
}

export function isURL(url: string) {
	return URL.canParse(url);
}
