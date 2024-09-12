import { Header } from '@/components/header'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div className='font-mulish'>
        <Header />
        <Outlet />
      </div>
    </QueryClientProvider>
  ),
});
