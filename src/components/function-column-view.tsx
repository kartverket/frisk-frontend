import { Flex } from "@kvib/react";
import { FunctionFolder } from "./function-folder";
import { getIdsFromPath } from "@/lib/utils";

type FunctionColumnViewProps = {
	path: string;
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
	const selectedFunctionIds = getIdsFromPath(path);

	return (
		<Flex w="100%" gap={2}>
			{selectedFunctionIds?.map((id) => (
				<FunctionFolder key={id} functionId={id} />
			))}
		</Flex>
	);
}
