import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BackendFunction, createFunction, deleteFunction, getChildren, getDependencies, getDependents, getFunction } from "../services/backend"


type UseFunctionOpts = {
  includeChildren?: boolean
  includeDependencies?: boolean
  includeDependents?: boolean
}

export function useFunction(functionId: number, opts?: UseFunctionOpts) {
  const queryClient = useQueryClient()

  const func = useQuery({
    queryKey: ['functions', functionId],
    queryFn: async () => {
      const functionData = await getFunction(functionId)
      return functionData
    },
  })

  const children = useQuery({
    queryKey: ['functions', functionId, 'children'],
    queryFn: async () => {
      const children = await getChildren(functionId)

      // Set all children in the query cache
      for (const child of children) {
        queryClient.setQueryData<BackendFunction>(['functions', child.id], child);
      }
      return children
    },
    enabled: opts?.includeChildren,
  })

  const dependencies = useQuery({
    queryKey: ['functions', functionId, 'dependencies'],
    queryFn: async () => {
      const dependencyIds = await getDependencies(functionId)
      const dependencies = await Promise.all(dependencyIds.map(async (dependencyId) => await getFunction(dependencyId)))
      // Set all dependencies in the query cache
      for (const dependency of dependencies) {
        queryClient.setQueryData<BackendFunction>(['functions', dependency.id], dependency);
      }
      return dependencies
    },
    enabled: opts?.includeDependencies,
  })

  const dependents = useQuery({
    queryKey: ['functions', functionId, 'dependents'],
    queryFn: async () => {
      const dependentIds = await getDependents(functionId)
      const dependents = await Promise.all(dependentIds.map(async (dependentId) => await getFunction(dependentId)))
      // Set all dependents in the query cache
      for (const dependent of dependents) {
        queryClient.setQueryData<BackendFunction>(['functions', dependent.id], dependent);
      }
      return dependents
    },
    enabled: opts?.includeDependents,
  })

  const addChild = useMutation({
    mutationFn: createFunction,
    onMutate: async (_newFunction) => {

      await queryClient.cancelQueries({
        queryKey: ['functions', functionId, 'children'],
      });

      const previousChildren = queryClient.getQueryData<BackendFunction[]>(['functions', functionId, 'children']);

      const randomNegativeNumber = -Math.floor(Math.random() * 1000);
      const newFunction: BackendFunction = {
        ..._newFunction,
        id: randomNegativeNumber,
        path: `${func.data?.path}.${randomNegativeNumber}`,
      }
      if (previousChildren) {
        queryClient.setQueryData<BackendFunction[]>(['functions', functionId, 'children'], [...previousChildren, newFunction]);
      } else {
        queryClient.setQueryData<BackendFunction[]>(['functions', functionId, 'children'], [newFunction]);
      }

      return { previousChildren };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData<BackendFunction[]>(['functions', functionId, 'children'], context?.previousChildren);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['functions', functionId, 'children'],
      })
    },
  })

  const removeChild = useMutation({
    mutationFn: deleteFunction,
    onMutate: async (childId) => {
      await queryClient.cancelQueries({
        queryKey: ['functions', functionId, 'children'],
      });

      const previousChildren = queryClient.getQueryData<BackendFunction[]>(['functions', functionId, 'children']);

      if (previousChildren) {
        queryClient.setQueryData<BackendFunction[]>(['functions', functionId, 'children'], previousChildren.filter((child) => child.id !== childId));
      } else {
        queryClient.setQueryData<BackendFunction[]>(['functions', functionId, 'children'], []);
      }

      return { previousChildren };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData<BackendFunction[]>(['functions', functionId, 'children'], context?.previousChildren);
    },
    onSettled: (_, __, childId) => {
      queryClient.invalidateQueries({
        queryKey: ['functions', functionId, 'children'],
      })
      queryClient.invalidateQueries({
        queryKey: ['functions', childId],
      })
    },
  })


  return {
    func,
    children,
    addChild,
    removeChild,
    dependencies,
    dependents,
  }
}
