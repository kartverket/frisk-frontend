import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import { BackendFunction, createFunction, deleteFunction, getChildren, getFunction } from '../services/backend'
import { useState } from 'react'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const queryClient = useQueryClient()

  const [selectedFunctionId, setSelectedFunctionId] = useState<number>(1)

  const { data: func } = useQuery({
    queryKey: ['functions', selectedFunctionId],
    queryFn: async () => {
      const functionData = await getFunction(selectedFunctionId)
      return functionData
    },
  })

  const { data: children } = useQuery({
    queryKey: ['functions', selectedFunctionId, 'children'],
    queryFn: async () => {
      const children = await getChildren(selectedFunctionId)
      return children
    },
  })

  const { mutate: addChild } = useMutation({
    mutationFn: createFunction,
    onMutate: async (_newFunction) => {

      await queryClient.cancelQueries({
        queryKey: ['functions', selectedFunctionId, 'children'],
      });

      const previousChildren = queryClient.getQueryData<BackendFunction[]>(['functions', selectedFunctionId, 'children']);

      const randomNegativeNumber = -Math.floor(Math.random() * 1000);
      const newFunction: BackendFunction = {
        ..._newFunction,
        id: randomNegativeNumber,
        path: func?.path + `.${randomNegativeNumber}`,
      }
      if (previousChildren) {
        queryClient.setQueryData<BackendFunction[]>(['functions', selectedFunctionId, 'children'], [...previousChildren, newFunction]);
      } else {
        queryClient.setQueryData<BackendFunction[]>(['functions', selectedFunctionId, 'children'], [newFunction]);
      }

      return { previousChildren };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData<BackendFunction[]>(['functions', selectedFunctionId, 'children'], context?.previousChildren);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['functions', selectedFunctionId, 'children'],
      })
    },
  })

  const { mutate: removeFunction } = useMutation({
    mutationFn: deleteFunction,
    onMutate: async (functionId) => {
      await queryClient.cancelQueries({
        queryKey: ['functions', selectedFunctionId, 'children'],
      });

      const previousChildren = queryClient.getQueryData<BackendFunction[]>(['functions', selectedFunctionId, 'children']);

      if (previousChildren) {
        queryClient.setQueryData<BackendFunction[]>(['functions', selectedFunctionId, 'children'], previousChildren.filter((child) => child.id !== functionId));
      } else {
        queryClient.setQueryData<BackendFunction[]>(['functions', selectedFunctionId, 'children'], []);
      }

      return { previousChildren };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData<BackendFunction[]>(['functions', selectedFunctionId, 'children'], context?.previousChildren);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['functions', selectedFunctionId, 'children'],
      })
    },
  })

  return (
    <div className="p-2">
      <p>Function: {func?.name}: {func?.path}</p>
      <button disabled={!func?.parentId} onClick={() => func?.parentId && setSelectedFunctionId(func.parentId)}>
        Go to parent
      </button>
      <form onSubmit={(e) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement;
        const nameElement = form.elements.namedItem('name') as HTMLInputElement | null;
        if (!nameElement) return;
        addChild({
          name: nameElement.value,
          parentId: selectedFunctionId,
        })
        // clear form
        nameElement.value = ''
      }}>
        <input type="text" name="name" required />
        <button type="submit">Create child function</button>
      </form>
      <p>Children:</p>
      <ul>
        {/* TODO: fix type error */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {children?.map((child: any) => (
          <li key={child.id + child.name + child.parentId + child.path}>
            <button onClick={() => setSelectedFunctionId(child.id)}>
              {child.name} (click to select)
            </button>
            <button className='disabled:opacity-50' disabled={child.id < 0} onClick={() => removeFunction(child.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
