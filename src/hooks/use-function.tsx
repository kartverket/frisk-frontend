import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BackendFunction, createFunction, deleteFunction, getChildren, getFunction } from "../services/backend"


type UseFunctionOpts = {
  ignoreThis?: boolean
  ignoreChildren?: boolean
}

export function useFunction(functionId: number, opts?: UseFunctionOpts) {
  const queryClient = useQueryClient()

  const func = useQuery({
    queryKey: ['functions', functionId],
    queryFn: async () => {
      const functionData = await getFunction(functionId)
      return functionData
    },
    enabled: !opts?.ignoreThis,
  })



  const children = useQuery({
    queryKey: ['functions', functionId, 'children'],
    queryFn: async () => {
      const children = await getChildren(functionId)
      return children
    },
    enabled: !opts?.ignoreChildren,
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
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['functions', functionId, 'children'],
      })
    },
  })


  return {
    func,
    children,
    addChild,
    removeChild,
  }
}
