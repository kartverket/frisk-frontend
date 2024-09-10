import { useMemo } from "react";
import { BackendFunction } from "../services/backend";
import { FunctionFolder } from "./function-folder";

type FunctionColumnViewProps = {
  selectedFunction: BackendFunction
  handleDeletedFunction: (deletedFunction: BackendFunction) => void
}

export function FunctionColumnView({ selectedFunction, handleDeletedFunction }: FunctionColumnViewProps) {

  const selectedFunctionIds = useMemo(() => selectedFunction.path.split('.').map((part) => parseInt(part)), [selectedFunction]);

  return (
    <div className="flex gap-2">
      {selectedFunctionIds.map((id) => (
        <FunctionFolder key={id} functionId={id} selectedFunction={selectedFunction} handleDeletedFunction={handleDeletedFunction} />
      ))}
    </div>
  );
}
