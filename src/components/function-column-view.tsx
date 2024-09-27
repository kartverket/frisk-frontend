import { Flex } from "@kvib/react";
import { FunctionColumn } from "./function-column";
import { getIdsFromPath } from "@/lib/utils";

type FunctionColumnViewProps = {
	path: string;
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
	const selectedFunctionIds = getIdsFromPath(path);

	return (
		<Flex w="100%" gap={2}>
			{selectedFunctionIds?.map((id) => (
				<FunctionColumn key={id} functionId={id} />
			))}
		</Flex>
	);
}
