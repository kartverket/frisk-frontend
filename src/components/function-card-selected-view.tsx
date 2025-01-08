import { Flex, Text, Skeleton, Stack } from "@kvib/react";
import { componentsMap, SchemaButton } from "./schema-button";
import { useFunction } from "@/hooks/use-function";
import { EditAndSelectButtons } from "./edit-and-select-buttons";
import { config } from "../../frisk.config";
import { MetadataView } from "./metadata/metadata-view";

export function FunctionCardSelectedView({
	functionId,
}: { functionId: number }) {
	const { func } = useFunction(functionId);

	const Component = componentsMap[config.functionCardComponents.type];

	return (
		<Stack paddingLeft="10px" w="100%">
			<Flex alignItems="center" w="100%" flex-wrap="wrap">
				<Skeleton isLoaded={!func.isLoading} flex={1} minWidth={0}>
					<Text
						fontWeight="bold"
						as="span"
						display="flex"
						w="100%"
						overflow="hidden"
					>
						{func.data?.name ?? "<Det skjedde en feil>"}
					</Text>
				</Skeleton>
				<EditAndSelectButtons functionId={functionId} selected />
			</Flex>
			{config.metadata?.map((meta) => (
				<MetadataView key={meta.key} metadata={meta} functionId={functionId} />
			))}
			<Component {...config.functionCardComponents.props(functionId)} />

			{/* <SchemaButton my="16px" functionId={functionId} /> */}
		</Stack>
	);
}
