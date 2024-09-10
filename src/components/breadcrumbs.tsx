import { useFunction } from "../hooks/use-function";
import { Link } from "@tanstack/react-router"


type BreadcrumbsProps = {
  path: string
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  const parts = path.split('.').map((part) => parseInt(part));

  return (
    <div className="flex gap-2 font-bold">
      {parts.map((part) => (
        <BredcrumbItem key={part} functionId={part} />
      ))}
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
    <Link to="/" search={{ id: func.data.id }}>{func.data?.name}</Link>
  );
}
