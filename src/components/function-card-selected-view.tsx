import { Flex, Text, Skeleton, Stack } from "@kvib/react";
import { useFunction } from "@/hooks/use-function";
import { EditAndSelectButtons } from "./edit-and-select-buttons";
import { MetadataView } from "./metadata/metadata-view";
import { useMetadata } from "@/hooks/use-metadata";
import { Route } from "@/routes";
import { OboFlowFeature } from "../../frisk.config";

export function FunctionCardSelectedView({
	functionId,
}: { functionId: number }) {
	const { func } = useFunction(functionId);
	const { metadata } = useMetadata(functionId);
	const { config } = Route.useLoaderData();
	const { flags } = Route.useSearch();

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
			{flags?.includes("oboflow") ? (
				<OboFlowFeature func={func} metadata={metadata} />
			) : (
				config.functionCardComponents.map((Component) => (
					<Component
						key={Component.toString()}
						func={func}
						metadata={metadata}
					/>
				))
			)}
		</Stack>
	);
}
