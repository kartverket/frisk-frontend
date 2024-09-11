import { createFileRoute } from '@tanstack/react-router'
import { FunctionColumnView } from '../components/function-column-view'
import { FunctionInfoView } from '../components/function-info-view';
import { Breadcrumbs } from '../components/breadcrumbs';
import { object, string } from 'zod';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useFunction } from '../hooks/use-function';
import { useEffect } from 'react';

const functionSearchSchema = object({
  path: string()
    .refine((arg) => arg.split('.').every((part) => parseInt(part) >= 0))
    .catch('1')
    .default('1'),
});

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: zodSearchValidator(functionSearchSchema),
})

function Index() {
  const { path } = Route.useSearch();
  const navigate = Route.useNavigate();
  const idArray = path.split('.').map((part) => parseInt(part));
  const id = idArray.pop() ?? 1;

  const { func } = useFunction(id, {
    ignoreChildren: true,
  });

  useEffect(() => {
    if (func.error) {
      // if function id is invalid, navigate to parent until it is valid
      const parentPath = idArray.slice().join('.');
      navigate({
        search: {
          path: parentPath,
        },
      })
    }
  }, [func.error, navigate, idArray]);

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs functionId={id} />
      <FunctionInfoView functionId={id} />
      <FunctionColumnView path={path} />
    </div>
  )
}
