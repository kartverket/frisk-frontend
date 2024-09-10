import { useFunction } from "../hooks/use-function"
import { Breadcrumbs } from "./breadcrumbs"


type FunctionInfoViewProps = {
  functionId: number
}

export function FunctionInfoView({ functionId }: FunctionInfoViewProps) {
  const { func } = useFunction(functionId, {
    ignoreChildren: true,
  })
  return (
    <div className="p-2">
      {func.data?.path && <Breadcrumbs path={func.data.path} />}
      <p>Function id: {func.data?.id}</p>
      <p>Function name: {func.data?.name}</p>
      <p>Parent id: {func.data?.parentId}</p>
    </div>
  )
}
