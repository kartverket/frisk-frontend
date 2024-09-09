import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import { createFunction, getChildren, getFunction } from '../services/backend'
import { useState } from 'react'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const queryClient = useQueryClient()

  const [selectedFunctionId, setSelectedFunctionId] = useState<number>(1)

  const { data: func } = useQuery({
    queryKey: ['functions', selectedFunctionId] as const,
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey
      if (!id) return
      const functionData = await getFunction(id)
      return functionData
    },
  })

  const { data: children } = useQuery({
    queryKey: ['functions', selectedFunctionId, 'children'] as const,
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey
      if (!id) return
      const children = await getChildren(id)
      return children
    },
  })

  const { mutate } = useMutation({
    mutationFn: createFunction,
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
        mutate({
          name: e.target.elements.name.value,
          parentId: selectedFunctionId,
        })
        // clear form
        e.target.elements.name.value = ''
      }}>
        <input type="text" name="name" required />
        <button type="submit">Create child function</button>
      </form>
      <p>Children:</p>
      <ul>
        {children?.map((child) => (
          <li key={child.id}>
            <button onClick={() => setSelectedFunctionId(child.id)}>
              {child.name} (click to select)
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
