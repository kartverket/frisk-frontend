import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import { createFunction, deleteFunction, getChildren, getFunction } from '../services/backend'
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['functions'],
      })
    },
  })

  const { mutate: removeFunction } = useMutation({
    mutationFn: deleteFunction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['functions'],
      })
    },
  })

  return (
    <div className="p-2">
      <p>Function: {func?.name}: {func?.path}</p>
      <button disabled={!func?.parentId} onClick={() => setSelectedFunctionId(func.parentId)}>
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
          <li key={child.id}>
            <button onClick={() => setSelectedFunctionId(child.id)}>
              {child.name} (click to select)
            </button>
            <button onClick={() => removeFunction(child.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
