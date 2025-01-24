import { useFunction } from "@/hooks/use-function";
import { MetadataView } from "./metadata/metadata-view";
import { useMetadata } from "@/hooks/use-metadata";
import { Route } from "@/routes";
import { Flex, Skeleton, Stack, Text } from "@kvib/react";
import { EditAndSelectButtons } from "./edit-and-select-buttons";

export function FunctionCardSelectedView({
	functionId,
}: { functionId: number }) {
	const { func } = useFunction(functionId);
	const { metadata, addMetadata } = useMetadata(functionId);
	const { config } = Route.useLoaderData();

	return (
		<Stack pl="10px" w="100%" overflow="hidden">
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
				<MetadataView
					key={meta.key}
					metadata={meta}
					functionId={functionId}
					metadataId={metadata.data?.find((m) => m.key === meta.key)?.id}
				/>
			))}
			{config.functionCardComponents.map((Component) => (
				<Component
					key={Component.toString()}
					func={func}
					metadata={metadata}
					addMetadata={addMetadata}
				/>
			))}
		</Stack>
	);
}
