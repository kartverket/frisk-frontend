import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
	type BackendFunction,
	getChildren,
	getFunction,
} from "@/services/backend";

type UseFunctionOpts = {
	includeChildren?: boolean;
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

	return {
		functions,
		children,
	};
}
