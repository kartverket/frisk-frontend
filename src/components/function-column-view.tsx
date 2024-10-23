import { Flex, Text } from "@kvib/react";
import { FunctionColumn } from "./function-column";
import { getIdsFromPath } from "@/lib/utils";

type FunctionColumnViewProps = {
	path: string;
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
	const selectedFunctionIds = getIdsFromPath(path);

	return (
		<Flex flexDirection="column" paddingY="38" paddingX="100" marginBottom="76">
			<Text fontSize="2xl" fontWeight="700" marginBottom="3">
				Funksjonsregisteret
			</Text>
			<Text fontSize="xs" marginBottom="38">
				Smell opp noen bra funksjoner og få den oversikten du fortjener
			</Text>
			<Flex>
				{selectedFunctionIds?.map((id) => (
					<FunctionColumn key={id} functionId={id} />
				))}
			</Flex>
		</Flex>
	);
}
