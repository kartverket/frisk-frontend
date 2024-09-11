import { createFileRoute } from '@tanstack/react-router'
import { FunctionColumnView } from '../components/function-column-view'
import { useCallback } from 'react';
import { FunctionInfoView } from '../components/function-info-view';
import { BackendFunction } from '../services/backend';
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
  const navigate = Route.useNavigate();

  const handleDeletedFunction = useCallback((deletedFunction: BackendFunction) => {
    if (path.split('.').map((part) => parseInt(part)).includes(deletedFunction.id)) {
      const deletedFunctionParentPath = deletedFunction.path.split('.').slice(0, -1).join('.');
      navigate({
        search: {
          path: deletedFunctionParentPath ?? "1",
        },
      })
      return;
    }
  }, [path, navigate]);

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs functionId={id} />
      <FunctionInfoView functionId={id} />
      <FunctionColumnView selectedFunctionPath={path} handleDeletedFunction={handleDeletedFunction} />
    </div>
  )
}
