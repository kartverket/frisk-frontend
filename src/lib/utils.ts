export function getIdsFromPath(path: string) {
	return path.split(".").map((part) => Number.parseInt(part));
}
