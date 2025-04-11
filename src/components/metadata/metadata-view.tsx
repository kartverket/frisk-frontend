import { Flex, Text } from "@kvib/react";
import type { Metadata } from "frisk.config";
import { MetadataValue } from "./metadata-value";

export function MetadataView({
	metadataConfig,
	functionId,
}: {
	metadataConfig: Metadata;
	functionId: number;
}) {
	return (
		<Flex key={metadataConfig.key} flexDirection="column">
			{metadataConfig.title && (
				<Text fontSize="sm" fontWeight="700">
					{metadataConfig.title}:
				</Text>
			)}
			<MetadataValue metadata={metadataConfig} functionId={functionId} />
		</Flex>
	);
}
