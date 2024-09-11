import { useMemo } from "react";
import { BackendFunction } from "../services/backend";
import { FunctionFolder } from "./function-folder";

type FunctionColumnViewProps = {
  selectedFunctionPath: string
  handleDeletedFunction: (deletedFunction: BackendFunction) => void
}

export function FunctionColumnView({ selectedFunctionPath, handleDeletedFunction }: FunctionColumnViewProps) {
  const selectedFunctionIds = useMemo(() => selectedFunctionPath.split('.').map((part) => parseInt(part)), [selectedFunctionPath]);

  return (
    <div className="flex gap-2">
      {selectedFunctionIds?.map((id) => (
        <FunctionFolder key={id} functionId={id} selectedFunctionIds={selectedFunctionIds} handleDeletedFunction={handleDeletedFunction} />
      ))}
    </div>
  );
}
