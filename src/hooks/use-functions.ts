import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
	type BackendFunction,
	getChildren,
	getFunction,
} from "@/services/backend";

type UseFunctionOpts = {
	includeChildren?: boolean;
	// includeGrandchildren?: boolean;
};

export function useFunctions(functionIds: number[], opts?: UseFunctionOpts) {
	const queryClient = useQueryClient();

	const functions = useQueries({
		queries: functionIds.map((id) => ({
			refetchOnMount: false,
			queryKey: ["functions", id],
			queryFn: async () => {
				const functionData = await getFunction(id);
				return functionData;
			},
		})),
	});

	const children = useQueries({
		queries: functionIds.map((id) => ({
			refetchOnMount: false,
			queryKey: ["functions", id, "children"],
			queryFn: async () => {
				const children = await getChildren(id);
				// Set all children in the query cache
				for (const child of children) {
					queryClient.setQueryData<BackendFunction>(
						["functions", child.id],
						child,
					);
				}
				return children;
			},
			enabled: opts?.includeChildren === true,
		})),
	});

	// const grandChildren = useQueries({
	// 	queries: children.map((functionsChildren) => ({
	// 		refetchOnMount: false,
	// 		queryKey: ["functions", child, "children"],
	// 		queryFn: async () => {

	// 			for (const child of functionsChildren) {
	// 				const children = await getChildren(child.data?.id);
	// 			}

	// 			// Set all children in the query cache
	// 			for (const child of children) {
	// 				queryClient.setQueryData<BackendFunction>(
	// 					["functions", child.id],
	// 					child,
	// 				);
	// 			}
	// 			return children;
	// 		},
	// 		enabled: opts?.includeGrandchildren === true,
	// 	})),
	// });

	return {
		functions,
		children,
		// grandChildren,
	};
}
