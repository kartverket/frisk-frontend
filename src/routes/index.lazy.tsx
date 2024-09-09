import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import { createFunction, getFunctions } from '../services/backend'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const queryClient = useQueryClient()

  const { data: functions } = useQuery({
    queryKey: ['functions'],
    queryFn: getFunctions,
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
      <h3>Welcome Home!</h3>
      <p>Here are your functions:</p>
      <ul>
        {functions?.map((f) => (
          <li key={f.path}>{f.name}: {f.path} <button onClick={() => mutate({ name: f.name + "child" + (Math.random() * 100).toFixed(0), parentId: f.id })}>Create child function</button></li>

        ))}
      </ul>
    </div>
  )
}
