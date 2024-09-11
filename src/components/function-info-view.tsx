import { useFunction } from "../hooks/use-function";
import { Link } from "@tanstack/react-router"
import { Route } from "../routes";

type FunctionInfoViewProps = {
  functionId: number
}

export function FunctionInfoView({ functionId }: FunctionInfoViewProps) {
  const { func, dependencies, dependents } = useFunction(functionId, {
    includeDependencies: true,
    includeDependents: true,
  });
  return (
    <div className="p-2">
      {func.data ? <p>Funksjonsnavn: {func.data.name}</p> : <div className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm"></div>}
      <p className="font-bold">Bruker</p>
      {dependencies.data?.map((dependency) => (
        <div key={dependency.id}>
          <Link to={Route.to} search={{ path: dependency.path }}>{dependency.name}</Link>
        </div>
      ))}
      <p className="font-bold">Brukes av</p>
      {dependents.data?.map((dependent) => (
        <div key={dependent.id}>
          <Link to={Route.to} search={{ path: dependent.path }}>{dependent.name}</Link>
        </div>
      ))}
    </div>
  )
}
