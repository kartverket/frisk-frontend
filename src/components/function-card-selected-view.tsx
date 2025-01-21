import { useFunction } from "@/hooks/use-function";
import { MetadataView } from "./metadata/metadata-view";
import { useMetadata } from "@/hooks/use-metadata";
import { Route } from "@/routes";
import { OboFlowFeature } from "../../frisk.config";
import { Flex, Skeleton, Stack, Text } from "@kvib/react";
import { EditAndSelectButtons } from "./edit-and-select-buttons";
import { useIndicators } from "@/hooks/use-indicators";

export function FunctionCardSelectedView({
	functionId,
}: { functionId: number }) {
	const { func } = useFunction(functionId);
	const { metadata, addMetadata } = useMetadata(functionId);
	const { config } = Route.useLoaderData();
	const search = Route.useSearch();

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
				<>
					{meta.title && (
						<Text key={`${meta.key}-title`} fontSize="sm" fontWeight="700">
							{meta.title}:
						</Text>
					)}
					<MetadataView
						key={meta.key}
						metadata={meta}
						functionId={functionId}
					/>
					{search.indicators?.metadata?.some((m) => m.key === meta.key) ? (
						<Indicator
							key={`${meta.key}-indicator`}
							functionId={functionId}
							metaKey={meta.key}
							metaValue={search.indicators.metadata[0].value as string}
						/>
					) : null}
				</>
			))}
			{search.flags?.includes("oboflow") ? (
				<OboFlowFeature
					func={func}
					metadata={metadata}
					addMetadata={addMetadata}
				/>
			) : (
				config.functionCardComponents.map((Component) => (
					<Component
						key={Component.toString()}
						func={func}
						metadata={metadata}
						addMetadata={addMetadata}
					/>
				))
			)}
		</Stack>
	);
}

function Indicator(props: {
	functionId: number;
	metaKey: string;
	metaValue?: string;
}) {
	const { config } = Route.useLoaderData();
	const { func } = useFunction(props.functionId);
	const { functionId, metaKey: key, metaValue: value } = props;
	const indicators = useIndicators({
		functionId,
		key,
		value,
	});

	return indicators.data
		?.filter((indicator) => indicator.id !== func.data?.id)
		?.map((indicator) => (
			<Flex key={indicator.id}>
				{indicator.path.split(".").length - func.data?.path.split(".").length}
				{"> "}
				<MetadataView
					functionId={indicator.id}
					metadata={config.metadata?.find((m) => m.key === key)}
				/>
			</Flex>
		));
}
