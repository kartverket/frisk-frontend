// export function getIdsFromPath(urlPaths: string) {
// 	const paths = urlPaths.split("-").map((path) => path.split(".").map(Number));

// 	const maxLength = Math.max(...paths.map((path) => path.length));

// 	return Array.from({ length: maxLength }, (_, i) =>
// 		paths
// 			.map((path) => path[i])
// 			.filter(
// 				(value, idx, self) =>
// 					value !== undefined && self.indexOf(value) === idx,
// 			),
// 	);
// }

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

	return nestedPaths[indexOfLongestPath].map((pathArray, i) =>
		nestedPaths
			.map((functionId: number[]) => functionId[i])
			.filter(
				(value, idx, self) =>
					value !== undefined && self.indexOf(value) === idx,
			),
	);
}

// TODO: fix

export function getIdFromPath(path: string) {
	return getIdsFromPath(path).at(-1);
}

// TODO: fix

export function isURL(url: string) {
	return URL.canParse(url);
}
