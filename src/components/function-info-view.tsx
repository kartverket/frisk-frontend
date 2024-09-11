import { useFunction } from "../hooks/use-function";

type FunctionInfoViewProps = {
  functionId: number
}

export function FunctionInfoView({ functionId }: FunctionInfoViewProps) {
  const { func } = useFunction(functionId, {
    ignoreChildren: true,
  });
  return (
    <div className="p-2">
      {func.data ? <p>Function id: {func.data.id}</p> : <div className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm"></div>}
      {func.data ? <p>Function name: {func.data.name}</p> : <div className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm"></div>}
      {func.data ? <p>Parent id: {func.data.parentId}</p> : <div className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm"></div>}
    </div>
  )
}
