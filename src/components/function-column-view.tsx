import { useMemo } from "react";
import { FunctionFolder } from "./function-folder";

type FunctionColumnViewProps = {
  path: string
}

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
  const selectedFunctionIds = useMemo(() => path.split('.').map((part) => parseInt(part)), [path]);

  return (
    <div className="flex gap-2 w-full overflow-scroll">
      {selectedFunctionIds?.map((id) => (
        <FunctionFolder key={id} functionId={id} selectedFunctionIds={selectedFunctionIds} />
      ))}
    </div>
  );
}
