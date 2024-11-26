import { Flex, Text, Skeleton, List, ListItem, Box, Stack } from "@kvib/react";
import { SchemaButton } from "./schema-button";
import { RegelrettLink } from "./metadata/regelrett-link";
import { useFunction } from "@/hooks/use-function";
import { EditAndSelectButtons } from "./edit-and-select-buttons";
import { config } from "../../frisk.config";
import { MetadataView } from "./metadata/metadata-view";

export function FunctionCardSelectedView({
	functionId,
}: { functionId: number }) {
	const { func, metadata, dependencies } = useFunction(functionId, {
		includeMetadata: true,
		includeDependencies: true,
	});
	const schemaMetadata =
		metadata.data?.filter((m) => m.key.startsWith("rr-")) ?? [];

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
			{dependencies.data && dependencies.data?.length > 0 && (
				<Text fontSize="xs" fontWeight="700" mb="4px">
					Funksjonsavhengigheter
				</Text>
			)}
			<List
				display="flex"
				flexWrap="wrap"
				justifyContent="flex-start"
				gap="6px"
			>
				{dependencies.data?.map((dependency) => (
					<ListItem key={dependency.id} minWidth="max-content">
						<Box
							bg="#BAD7F8"
							paddingRight={1}
							paddingLeft={1}
							borderRadius="md"
						>
							<Text fontSize="xs" fontWeight="500">
								{dependency.name}
							</Text>
						</Box>
					</ListItem>
				))}
			</List>
			<SchemaButton my="16px" functionId={functionId} />
			{/* Keep this for backwards compatibility with old metadata */}
			{schemaMetadata.map((item) => (
				<RegelrettLink
					key={`legacy-${item.key}-${item.value}`}
					metadata={{
						key: item.key,
						contextId: item.value,
					}}
				/>
			))}
		</Stack>
	);
}
