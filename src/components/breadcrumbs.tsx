import { useFunction } from "../hooks/use-function";
import { Link } from "@tanstack/react-router"
import { Route } from "../routes";


type BreadcrumbsProps = {
  functionId: number
}

export function Breadcrumbs({ functionId }: BreadcrumbsProps) {
  const { func } = useFunction(functionId, {
    ignoreChildren: true,
  });
  const ids = func.data?.path.split('.').map((id) => parseInt(id));

  return (
    <div className="flex gap-2 font-bold">
      {ids?.map((id) => (
        <BredcrumbItem key={id} functionId={id} />
      )) ?? <div className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm"></div>}
    </div>
  );
}

type BreadcrumbItemProps = {
  functionId: number;
}
function BredcrumbItem({ functionId }: BreadcrumbItemProps) {
  const { func } = useFunction(functionId, {
    ignoreChildren: true,
  });

  if (!func.data) return null;

  return (
    <Link to={Route.to} search={{ path: func.data.path }}>{func.data?.name}</Link>
  );
}
