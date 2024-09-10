import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BackendFunction, createFunction, deleteFunction, getChildren, getFunction } from "../services/backend"


export function useFunction(functionId: number) {
  const queryClient = useQueryClient()

  const { data: func } = useQuery({
    queryKey: ['functions', functionId],
    queryFn: async () => {
      const functionData = await getFunction(functionId)
      return functionData
    },
  })



  const { data: children } = useQuery({
    queryKey: ['functions', functionId, 'children'],
    queryFn: async () => {
      const children = await getChildren(functionId)
      return children
    },
  })

  const { mutate: addChild } = useMutation({
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
        path: func?.path + `.${randomNegativeNumber}`,
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

  const { mutate: removeChild } = useMutation({
    mutationFn: deleteFunction,
    onMutate: async (functionId) => {
      await queryClient.cancelQueries({
        queryKey: ['functions', functionId, 'children'],
      });

      const previousChildren = queryClient.getQueryData<BackendFunction[]>(['functions', functionId, 'children']);

      if (previousChildren) {
        queryClient.setQueryData<BackendFunction[]>(['functions', functionId, 'children'], previousChildren.filter((child) => child.id !== functionId));
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
