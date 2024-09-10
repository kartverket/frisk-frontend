import { createFileRoute } from '@tanstack/react-router'
import { FunctionColumnView } from '../components/function-column-view'
import { useCallback } from 'react';
import { FunctionInfoView } from '../components/function-info-view';
import { useFunction } from '../hooks/use-function';
import { BackendFunction } from '../services/backend';
import { Breadcrumbs } from '../components/breadcrumbs';
import { number, object } from 'zod';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

const functionSearchSchema = object({
  id: number().default(1),
});

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: zodSearchValidator(functionSearchSchema),
})

function Index() {
  const { id } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { func } = useFunction(id, {
    ignoreChildren: true,
  });

  const handleDeletedFunction = useCallback((deletedFunction: BackendFunction) => {
    if (!func.data) return;
    if (func.data.path.split('.').map((part) => parseInt(part)).includes(deletedFunction.id)) {
      navigate({
        search: {
          id: deletedFunction.parentId ?? 1,
        },
      })
      return;
    }
  }, [func.data, navigate]);

  return (
    <div className="flex flex-col gap-2">
      {func.data && <Breadcrumbs path={func.data.path} />}
      {func.data && <FunctionInfoView func={func.data} />}
      {func.data && <FunctionColumnView selectedFunction={func.data} handleDeletedFunction={handleDeletedFunction} />}
    </div>
  )
}
