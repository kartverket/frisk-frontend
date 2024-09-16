import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type BackendFunction,
	createDependency,
	createFunction,
	deleteDependency,
	deleteFunction,
	getChildren,
	getDependencies,
	getDependents,
	getFunction,
} from "@/services/backend";

type UseFunctionOpts = {
	includeChildren?: boolean;
	includeDependencies?: boolean;
	includeDependents?: boolean;
};

export function useFunction(functionId: number, opts?: UseFunctionOpts) {
	const queryClient = useQueryClient();

	const func = useQuery({
		queryKey: ["functions", functionId],
		queryFn: async () => {
			const functionData = await getFunction(functionId);
			return functionData;
		},
	});

	const children = useQuery({
		queryKey: ["functions", functionId, "children"],
		queryFn: async () => {
			const children = await getChildren(functionId);

			// Set all children in the query cache
			for (const child of children) {
				queryClient.setQueryData<BackendFunction>(
					["functions", child.id],
					child,
				);
			}
			return children;
		},
		enabled: opts?.includeChildren,
	});

	const dependencies = useQuery({
		queryKey: ["functions", functionId, "dependencies"],
		queryFn: async () => {
			const dependencyIds = await getDependencies(functionId);
			const dependencies = await Promise.all(
				dependencyIds.map(
					async (dependencyId) => await getFunction(dependencyId),
				),
			);
			// Set all dependencies in the query cache
			for (const dependency of dependencies) {
				queryClient.setQueryData<BackendFunction>(
					["functions", dependency.id],
					dependency,
				);
			}
			return dependencies;
		},
		enabled: opts?.includeDependencies,
	});

	const dependents = useQuery({
		queryKey: ["functions", functionId, "dependents"],
		queryFn: async () => {
			const dependentIds = await getDependents(functionId);
			const dependents = await Promise.all(
				dependentIds.map(async (dependentId) => await getFunction(dependentId)),
			);
			// Set all dependents in the query cache
			for (const dependent of dependents) {
				queryClient.setQueryData<BackendFunction>(
					["functions", dependent.id],
					dependent,
				);
			}
			return dependents;
		},
		enabled: opts?.includeDependents,
	});

	const addChild = useMutation({
		mutationFn: createFunction,
		onMutate: async (_newFunction) => {
			await queryClient.cancelQueries({
				queryKey: ["functions", functionId, "children"],
			});

			const previousChildren = queryClient.getQueryData<BackendFunction[]>([
				"functions",
				functionId,
				"children",
			]);

			const randomNegativeNumber = -Math.floor(Math.random() * 1000);
			const newFunction: BackendFunction = {
				..._newFunction,
				id: randomNegativeNumber,
				path: `${func.data?.path}.${randomNegativeNumber}`,
			};
			if (previousChildren) {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", functionId, "children"],
					[...previousChildren, newFunction],
				);
			} else {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", functionId, "children"],
					[newFunction],
				);
			}

			return { previousChildren };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData<BackendFunction[]>(
				["functions", functionId, "children"],
				context?.previousChildren,
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["functions", functionId, "children"],
			});
		},
	});

	const removeChild = useMutation({
		mutationFn: deleteFunction,
		onMutate: async (childId) => {
			await queryClient.cancelQueries({
				queryKey: ["functions", functionId, "children"],
			});

			const previousChildren = queryClient.getQueryData<BackendFunction[]>([
				"functions",
				functionId,
				"children",
			]);

			if (previousChildren) {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", functionId, "children"],
					previousChildren.filter((child) => child.id !== childId),
				);
			} else {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", functionId, "children"],
					[],
				);
			}

			return { previousChildren };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData<BackendFunction[]>(
				["functions", functionId, "children"],
				context?.previousChildren,
			);
		},
		onSettled: (_, __, childId) => {
			queryClient.invalidateQueries({
				queryKey: ["functions", functionId, "children"],
			});
			queryClient.invalidateQueries({
				queryKey: ["functions", childId],
			});
		},
	});

	const addDependency = useMutation({
		mutationFn: createDependency,
		onMutate: async (_newDependency) => {
			await queryClient.cancelQueries({
				queryKey: ["functions", functionId, "dependencies"],
			});
			await queryClient.cancelQueries({
				queryKey: [
					"functions",
					_newDependency.dependencyFunctionId,
					"dependents",
				],
			});

			const previousDependencies = queryClient.getQueryData<BackendFunction[]>([
				"functions",
				functionId,
				"dependencies",
			]);

			const previousDependents = queryClient.getQueryData<BackendFunction[]>([
				"functions",
				_newDependency.dependencyFunctionId,
				"dependents",
			]);

			let newDependency = queryClient.getQueryData<BackendFunction>([
				"functions",
				_newDependency.dependencyFunctionId,
			]);
			if (!newDependency) {
				newDependency = await queryClient.fetchQuery<BackendFunction>({
					queryKey: ["functions", _newDependency.dependencyFunctionId],
					queryFn: async () => {
						const functionData = await getFunction(
							_newDependency.dependencyFunctionId,
						);
						return functionData;
					},
				});
			}

			if (previousDependencies) {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", functionId, "dependencies"],
					[...previousDependencies, newDependency],
				);
			} else {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", functionId, "dependencies"],
					[newDependency],
				);
			}

			if (func.data) {
				if (previousDependents) {
					queryClient.setQueryData<BackendFunction[]>(
						["functions", _newDependency.dependencyFunctionId, "dependents"],
						[...previousDependents, func.data],
					);
				} else {
					queryClient.setQueryData<BackendFunction[]>(
						["functions", _newDependency.dependencyFunctionId, "dependents"],
						[func.data],
					);
				}
			}

			return { previousDependencies, previousDependents };
		},
		onError: (_, vars, context) => {
			queryClient.setQueryData<BackendFunction[]>(
				["functions", functionId, "dependencies"],
				context?.previousDependencies,
			);
			queryClient.setQueryData<BackendFunction[]>(
				["functions", vars.dependencyFunctionId, "dependents"],
				context?.previousDependents,
			);
		},
		onSettled: (_, __, functionDep) => {
			queryClient.invalidateQueries({
				queryKey: ["functions", functionId, "dependencies"],
			});
			queryClient.invalidateQueries({
				queryKey: ["functions", functionDep.dependencyFunctionId, "dependents"],
			});
		},
	});

	const removeDependency = useMutation({
		mutationFn: deleteDependency,
		onMutate: async (dependencyToDelete) => {
			await queryClient.cancelQueries({
				queryKey: ["functions", functionId, "dependencies"],
			});
			await queryClient.cancelQueries({
				queryKey: [
					"functions",
					dependencyToDelete.dependencyFunctionId,
					"dependents",
				],
			});

			const previousDependencies = queryClient.getQueryData<BackendFunction[]>([
				"functions",
				functionId,
				"dependencies",
			]);

			const previousDependents = queryClient.getQueryData<BackendFunction[]>([
				"functions",
				dependencyToDelete.dependencyFunctionId,
				"dependents",
			]);

			if (previousDependencies) {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", functionId, "dependencies"],
					previousDependencies.filter(
						(dependency) =>
							dependency.id !== dependencyToDelete.dependencyFunctionId,
					),
				);
			} else {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", functionId, "dependencies"],
					[],
				);
			}

			if (previousDependents) {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", dependencyToDelete.dependencyFunctionId, "dependents"],
					previousDependents.filter(
						(dependent) => dependent.id !== dependencyToDelete.functionId,
					),
				);
			} else {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", dependencyToDelete.dependencyFunctionId, "dependents"],
					[],
				);
			}

			return { previousDependencies, previousDependents };
		},
		onError: (_, vars, context) => {
			queryClient.setQueryData<BackendFunction[]>(
				["functions", functionId, "dependencies"],
				context?.previousDependencies,
			);
			queryClient.setQueryData<BackendFunction[]>(
				["functions", vars.dependencyFunctionId, "dependents"],
				context?.previousDependents,
			);
		},
		onSettled: (_, __, functionDep) => {
			queryClient.invalidateQueries({
				queryKey: ["functions", functionId, "dependencies"],
			});
			queryClient.invalidateQueries({
				queryKey: ["functions", functionDep.dependencyFunctionId, "dependents"],
			});
		},
	});

	return {
		func,
		children,
		addChild,
		removeChild,
		dependencies,
		addDependency,
		removeDependency,
		dependents,
	};
}
