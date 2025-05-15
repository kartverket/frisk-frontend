import { Flex, Text } from "@kvib/react";
import type { Metadata } from "frisk.config";
import { MetadataValue } from "./metadata-value";
import { Route } from "@/routes";

export function MetadataView({
	metadataConfig,
	functionId,
}: {
	metadataConfig: Metadata;
	functionId: number;
}) {
	const { config } = Route.useLoaderData();
	const ducplicateTitleAlreadyDisplayed = config.metadata
		?.slice(
			0,
			config.metadata.findIndex((meta) => meta === metadataConfig),
		)
		.some((meta) => meta.title === metadataConfig.title);

	return (
		<Flex key={metadataConfig.key} flexDirection="column">
			{metadataConfig.title && !ducplicateTitleAlreadyDisplayed && (
				<Text fontSize="sm" fontWeight="700">
					{metadataConfig.title}:
				</Text>
			)}
			<MetadataValue metadata={metadataConfig} functionId={functionId} />
		</Flex>
	);
}
