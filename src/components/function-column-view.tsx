import { Flex, Text } from "@kvib/react";
import { FunctionColumn } from "./function-column";
import { getIdsFromPath } from "@/lib/utils";

type FunctionColumnViewProps = {
	path: string;
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
	const selectedFunctionIds = getIdsFromPath(path);

	return (
		<Flex gap="38" flexDirection="column" paddingY="38" paddingX="100">
			<Text fontSize="2xl" fontWeight="700">
				Funksjonsregisteret
			</Text>
			<Flex gap="4">
				{selectedFunctionIds?.map((id) => (
					<FunctionColumn key={id} functionId={id} />
				))}
			</Flex>
		</Flex>
	);
}
