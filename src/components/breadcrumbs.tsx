import { useFunction } from "../hooks/use-function";

type BreadcrumbsProps = {
  path: string
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  const parts = path.split('.').map((part) => parseInt(part));

  return (
    <div className="flex gap-2">
      {parts.map((part) => (
        <BredcrumbItem key={part} functionId={part} />
      ))}
    </div>
  );
}

type BreadcrumbItemProps = {
  functionId: number
}
function BredcrumbItem({ functionId }: BreadcrumbItemProps) {
  const { func } = useFunction(functionId, {
    ignoreChildren: true,
  });

  return (
    <span>{func.data?.name}</span>
  );
}
