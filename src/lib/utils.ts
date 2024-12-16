export function getIdsFromPath(paths: string[]) {
	const nestedPaths = paths.map((path) => path.split(".").map(Number));

	let max = 0;
	let indexOfLongestPath = -1;
	nestedPaths.forEach((pathArray, i) => {
		if (pathArray.length > max) {
			max = pathArray.length;
			indexOfLongestPath = i;
		}
	});

	return nestedPaths[indexOfLongestPath].map((_, i) =>
		nestedPaths
			.map((functionId: number[]) => functionId[i])
			.filter(
				(value, idx, self) =>
					value !== undefined && self.indexOf(value) === idx,
			),
	);
}

export function isURL(url: string) {
	return URL.canParse(url);
}
