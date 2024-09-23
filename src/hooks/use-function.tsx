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
	putFunction,
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
		enabled: opts?.includeChildren === true,
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
		enabled: opts?.includeDependencies === true,
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
		enabled: opts?.includeDependents === true,
	});

	const addFunction = useMutation({
		mutationFn: createFunction,
		onMutate: async (_newFunction) => {
			const randomNegativeNumber = -Math.floor(Math.random() * 1000);
			const newFunction: BackendFunction = {
				..._newFunction,
				id: randomNegativeNumber,
				path: `${func.data?.path}.${randomNegativeNumber}`,
			};
			await queryClient.cancelQueries({
				queryKey: ["functions", newFunction.parentId, "children"],
			});

			const previousChildren = queryClient.getQueryData<BackendFunction[]>([
				"functions",
				newFunction.parentId,
				"children",
			]);

			if (previousChildren) {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", newFunction.parentId, "children"],
					[...previousChildren, newFunction],
				);
			} else {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", newFunction.parentId, "children"],
					[newFunction],
				);
			}

			return { previousChildren };
		},
		onError: (_, newFunction, context) => {
			queryClient.setQueryData<BackendFunction[]>(
				["functions", newFunction.parentId, "children"],
				context?.previousChildren ?? [],
			);
		},
		onSettled: (newFunction) => {
			queryClient.invalidateQueries({
				queryKey: ["functions", newFunction?.parentId, "children"],
			});
		},
	});

	const updateFunction = useMutation({
		mutationFn: putFunction,
		onMutate: async (_updatedFunction) => {
			const oldFunction = queryClient.getQueryData<BackendFunction>([
				"functions",
				_updatedFunction.id,
			]);
			if (!oldFunction) return;

			queryClient.cancelQueries({
				queryKey: ["functions", _updatedFunction.id],
			});

			const updatedFunction = structuredClone(_updatedFunction);

			let previousOldParentChildren: BackendFunction[] | undefined;
			let previousUpdatedParentChildren: BackendFunction[] | undefined;
			if (
				oldFunction.parentId &&
				oldFunction.parentId !== _updatedFunction.parentId
			) {
				const newParent = queryClient.getQueryData<BackendFunction>([
					"functions",
					_updatedFunction.parentId,
				]);
				if (newParent) {
					updatedFunction.path = `${newParent.path}.${updatedFunction.id}`;
				}
				previousOldParentChildren = queryClient.getQueryData<BackendFunction[]>(
					["functions", oldFunction.parentId, "children"],
				);
				if (previousOldParentChildren) {
					queryClient.setQueryData<BackendFunction[]>(
						["functions", oldFunction.parentId, "children"],
						previousOldParentChildren.filter(
							(child) => child.id !== oldFunction.id,
						),
					);
				} else {
					queryClient.setQueryData<BackendFunction[]>(
						["functions", oldFunction.parentId, "children"],
						[],
					);
				}
			}
			if (updatedFunction.parentId) {
				previousUpdatedParentChildren = queryClient.getQueryData<
					BackendFunction[]
				>(["functions", updatedFunction.parentId, "children"]);
				if (previousUpdatedParentChildren) {
					queryClient.setQueryData<BackendFunction[]>(
						["functions", updatedFunction.parentId, "children"],
						[...previousUpdatedParentChildren, updatedFunction],
					);
				} else {
					queryClient.setQueryData<BackendFunction[]>(
						["functions", updatedFunction.parentId, "children"],
						[updatedFunction],
					);
				}
			}

			queryClient.setQueryData<BackendFunction>(
				["functions", _updatedFunction.id],
				updatedFunction,
			);

			return {
				oldFunction,
				previousOldParentChildren,
				previousUpdatedParentChildren,
			};
		},
		onError: (_, vars, context) => {
			if (
				context?.oldFunction &&
				context.oldFunction.parentId !== vars.parentId
			) {
				queryClient.setQueryData<BackendFunction[]>(
					["functions", context.oldFunction.parentId, "children"],
					context?.previousOldParentChildren,
				);
			}
			queryClient.setQueryData<BackendFunction[]>(
				["functions", vars.parentId, "children"],
				context?.previousUpdatedParentChildren,
			);
			queryClient.setQueryData<BackendFunction>(
				["functions", vars.id],
				context?.oldFunction,
			);
		},
		onSettled: (_, __, req, context) => {
			if (
				context?.oldFunction &&
				context.oldFunction.parentId !== req.parentId
			) {
				queryClient.invalidateQueries({
					queryKey: ["functions", context.oldFunction.parentId, "children"],
				});
			}
			queryClient.invalidateQueries({
				queryKey: ["functions", req.parentId, "children"],
			});
			queryClient.invalidateQueries({
				queryKey: ["functions", req.id],
			});
		},
	});

	const removeFunction = useMutation({
		mutationFn: deleteFunction,
		onMutate: async (deletedFunctionId) => {
			const deletedFunction = queryClient.getQueryData<BackendFunction>([
				"functions",
				deletedFunctionId,
			]);

			let previousChildren: BackendFunction[] | undefined;
			if (deletedFunction) {
				await queryClient.cancelQueries({
					queryKey: ["functions", deletedFunction.parentId, "children"],
				});
				await queryClient.cancelQueries({
					queryKey: ["functions", deletedFunctionId],
				});

				previousChildren = queryClient.getQueryData<BackendFunction[]>([
					"functions",
					deletedFunction.parentId,
					"children",
				]);

				if (previousChildren) {
					queryClient.setQueryData<BackendFunction[]>(
						["functions", deletedFunction.parentId, "children"],
						previousChildren.filter((child) => child.id !== deletedFunctionId),
					);
				} else {
					queryClient.setQueryData<BackendFunction[]>(
						["functions", deletedFunction.parentId, "children"],
						[],
					);
				}
			}

			return { previousChildren };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData<BackendFunction[]>(
				["functions", functionId, "children"],
				context?.previousChildren ?? [],
			);
		},
		onSettled: (_, __, deletedFunctionId) => {
			const deletedFunction = queryClient.getQueryData<BackendFunction>([
				"functions",
				deletedFunctionId,
			]);

			if (deletedFunction) {
				queryClient.invalidateQueries({
					queryKey: ["functions", deletedFunction.parentId, "children"],
				});
			}
			queryClient.invalidateQueries({
				queryKey: ["functions", deletedFunctionId],
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
		addFunction,
		updateFunction,
		removeFunction,
		dependencies,
		addDependency,
		removeDependency,
		dependents,
	};
}
