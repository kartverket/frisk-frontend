import { FunctionFolder } from "./function-folder";

type FunctionColumnViewProps = {
  selectedFunctionIds: number[]
  setSelectedFunctionIds: (ids: number[]) => void
}

export function FunctionColumnView({ selectedFunctionIds, setSelectedFunctionIds }: FunctionColumnViewProps) {

  const createSetSelectedFunctionId = (index: number) => {
    const start = selectedFunctionIds.slice(0, index + 1)
    return (id?: number) => {

      // this means that the user deleted the selected function
      // thus no function is selected at current index
      if (id === undefined) {
        return setSelectedFunctionIds(start)

        // this means that the user selected a function that is already selected
        // if this is up the tree, we remove the children
      } else if (id in start) {
        return setSelectedFunctionIds(start.slice(0, start.indexOf(id)))
      }

      setSelectedFunctionIds([...start, id])
    }
  }

  return (
    <div className="flex gap-2">
      {selectedFunctionIds.map((id, index) => (
        <FunctionFolder key={id} functionId={id} selectedFunctionId={selectedFunctionIds[index + 1]} setSelectedFunctionId={createSetSelectedFunctionId(index)} />
      ))}
    </div>
  );
}
