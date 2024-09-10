import { BackendFunction } from "../services/backend"


type FunctionInfoViewProps = {
  func: BackendFunction
}

export function FunctionInfoView({ func }: FunctionInfoViewProps) {
  return (
    <div className="p-2">
      <p>Function id: {func.id}</p>
      <p>Function name: {func.name}</p>
      <p>Parent id: {func.parentId}</p>
    </div>
  )
}
