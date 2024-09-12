import { useFunction } from "@/hooks/use-function";
import { Link } from "@tanstack/react-router"
import { Route } from "@/routes";


type BreadcrumbsProps = {
  path: string
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  const ids = path.split('.').map((id) => parseInt(id));

  return (
    <div className="flex gap-2 font-bold p-2">
      {ids?.map((id) => (
        <div key={id} className="flex gap-2">
          <BreadcrumbItem functionId={id} />
          <span className="text-gray-400 text-sm">/</span>
        </div>
      ))}
    </div>
  );
}

type BreadcrumbItemProps = {
  functionId: number;
}
function BreadcrumbItem({ functionId }: BreadcrumbItemProps) {
  const { func } = useFunction(functionId);

  if (!func.data) return <div className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm"></div>;

  return (
    <Link to={Route.to} search={{ path: func.data.path }}>{func.data?.name}</Link>
  );
}
