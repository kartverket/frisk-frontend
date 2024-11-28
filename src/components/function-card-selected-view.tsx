import { Flex, Text, Skeleton, Stack } from "@kvib/react";
import { SchemaButton } from "./schema-button";
import { useFunction } from "@/hooks/use-function";
import { EditAndSelectButtons } from "./edit-and-select-buttons";
import { config } from "../../frisk.config";
import { MetadataView } from "./metadata/metadata-view";

export function FunctionCardSelectedView({
	functionId,
}: { functionId: number }) {
	const { func } = useFunction(functionId);

	return (
		<Stack paddingLeft="10px" w="100%">
			<Flex alignItems="center" w="100%">
				<Skeleton isLoaded={!func.isLoading} fitContent w="100%">
					<Text fontWeight="bold" as="span" display="flex" w="100%">
						{func.data?.name ?? "<Det skjedde en feil>"}
					</Text>
				</Skeleton>
				<EditAndSelectButtons functionId={functionId} selected />
			</Flex>
			{config.metadata?.map((meta) => (
				<MetadataView key={meta.key} metadata={meta} functionId={functionId} />
			))}
			<SchemaButton my="16px" functionId={functionId} />
		</Stack>
	);
}
