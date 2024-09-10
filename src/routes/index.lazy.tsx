import { createLazyFileRoute } from '@tanstack/react-router'
import { FunctionColumnView } from '../components/function-column-view'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <FunctionColumnView />
  )
}
