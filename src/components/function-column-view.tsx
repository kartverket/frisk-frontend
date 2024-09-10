import { useState } from "react";
import { FunctionFolder } from "./function-folder";


export function FunctionColumnView() {
  const [selectedFunctionIds, setSelectedFunctionIds] = useState<number[]>([1]);

  const createSetSelectedFunctionId = (index: number) => {
    const start = selectedFunctionIds.slice(0, index + 1)
    return (id: number) => {
      if (id in start) {
        return
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
