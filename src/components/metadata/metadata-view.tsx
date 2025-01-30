import { Button, Flex, Text } from "@kvib/react";
import type { Metadata } from "frisk.config";
import { MetadataValue } from "./metadata-value";
import { Route } from "@/routes";
import { useFunction } from "@/hooks/use-function";
import { useIndicators } from "@/hooks/use-indicators";
import { useMetadata } from "@/hooks/use-metadata";

export function MetadataView({
	metadata,
	functionId,
}: {
	metadata: Metadata;
	functionId: number;
}) {
	const search = Route.useSearch();
	const indicator = search.indicators?.metadata.find(
		(m) => m.key === metadata.key,
	);
	const metadataQuery = useMetadata(functionId);
	const indicators = useIndicators(
		indicator
			? {
					functionId,
					key: indicator.key,
					value: indicator.value as string,
				}
			: undefined,
	);

	const hasMetadata =
		metadataQuery.metadata.data?.find((m) => m.key === metadata.key) !==
		undefined;
	const hasIndicators =
		indicator !== undefined && (indicators.data?.length ?? 0) > 0;

	const shouldRender = hasMetadata || hasIndicators;

	if (!shouldRender) return null;

	return (
		<Flex key={metadata.key} flexDirection="column">
			{metadata.title && (
				<Text fontSize="sm" fontWeight="700">
					{metadata.title}:
				</Text>
			)}
			<MetadataValue metadata={metadata} functionId={functionId} />
			{indicator ? (
				<Indicators
					functionId={functionId}
					metaKey={metadata.key}
					metaValue={indicator.value as string}
				/>
			) : null}
		</Flex>
	);
}

function Indicators(props: {
	functionId: number;
	metaKey: string;
	metaValue?: string; // TODO: For å tillate avhengigheter, så må vi ta hensyn til at dette kan være array
}) {
	const { config } = Route.useLoaderData();
	const { func } = useFunction(props.functionId);
	const { functionId, metaKey: key, metaValue: value } = props;
	const indicators = useIndicators({
		functionId,
		key,
		value,
	});
	const navigate = Route.useNavigate();
	const search = Route.useSearch();

	return indicators.data
		?.filter((indicator) => indicator.id !== func.data?.id)
		?.map((indicator) => {
			const metadata = config.metadata?.find((m) => m.key === key);
			if (!metadata) return null;

			const indicatorPosition =
				indicator.path.split(".").length -
				(func.data?.path.split(".").length ?? 0);

			return (
				<Button
					key={indicator.id}
					variant="secondary"
					size="xs"
					colorScheme="blue"
					backgroundColor="white"
					mb="5px"
					onClick={(e) => {
						e.stopPropagation();
						const updatedSearch = {
							...search,
							highlighted: indicator.id,
						};

						if (
							indicatorPosition > 0 &&
							!search.path.some((p) =>
								p.split(".").includes(indicator.id.toString()),
							)
						) {
							const oldPaths = search.path;
							const newPaths = oldPaths.filter(
								(p) => !indicator.path.includes(p),
							);
							updatedSearch.path = [...newPaths, indicator.path];
						}

						navigate({ search: updatedSearch });
					}}
					maxW="fit-content"
					px="20px"
					overflow="hidden"
					justifyContent="left"
				>
					<Flex alignItems="center" gap="10px">
						{indicatorPosition < 0
							? "<".repeat(Math.abs(indicatorPosition))
							: ">".repeat(indicatorPosition)}

						<MetadataValue
							functionId={indicator.id}
							metadata={metadata}
							isIndicator
						/>
					</Flex>
				</Button>
			);
		});
}
