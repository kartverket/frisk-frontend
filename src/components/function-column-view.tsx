import { FunctionFolder } from "./function-folder";
import { getIdsFromPath } from "@/lib/utils";

type FunctionColumnViewProps = {
	path: string;
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
	const selectedFunctionIds = getIdsFromPath(path);

	return (
		<div className="flex gap-2 w-full">
			{selectedFunctionIds?.map((id) => (
				<FunctionFolder key={id} functionId={id} />
			))}
		</div>
	);
}
