import { createFileRoute } from '@tanstack/react-router'
import { FunctionColumnView } from '../components/function-column-view'
import { FunctionInfoView } from '../components/function-info-view';
import { Breadcrumbs } from '../components/breadcrumbs';
import { object, string } from 'zod';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

const functionSearchSchema = object({
  path: string().default("1"),
});

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: zodSearchValidator(functionSearchSchema),
})

function Index() {
  const { path } = Route.useSearch();
  const id = path.split('.').map((part) => parseInt(part)).pop() ?? 1;

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs functionId={id} />
      <FunctionInfoView functionId={id} />
      <FunctionColumnView path={path} />
    </div>
  )
}
