import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type BackendFunction,
	createFunction,
	deleteFunction,
	getChildren,
	getFunction,
	putFunction,
} from "@/services/backend";

type UseFunctionOpts = {
	includeChildren?: boolean;
};

export function useFunction(functionId: number, opts?: UseFunctionOpts) {
	const queryClient = useQueryClient();

	const func = useQuery({
		refetchOnMount: false,
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

	const addFunction = useMutation({
		mutationFn: createFunction,
		onMutate: async (_newFunction) => {
			const randomNegativeNumber = -Math.floor(Math.random() * 1000);
			const newFunction: BackendFunction = {
				..._newFunction.function,
				id: randomNegativeNumber,
				path: `${func.data?.path}.${randomNegativeNumber}`,
				orderIndex: 999,
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
				["functions", newFunction.function.parentId, "children"],
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
						previousUpdatedParentChildren.find(
							(child) => child.id === updatedFunction.id,
						)
							? previousUpdatedParentChildren.map((child) => {
									if (child.id === updatedFunction.id) {
										return updatedFunction;
									}
									return child;
								})
							: [...previousUpdatedParentChildren, updatedFunction],
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
		onError: (_, deletedFunctionId, context) => {
			queryClient.setQueryData<BackendFunction[]>(
				["functions", deletedFunctionId, "children"],
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

	return {
		func,
		children,
		addFunction,
		updateFunction,
		removeFunction,
	};
}
