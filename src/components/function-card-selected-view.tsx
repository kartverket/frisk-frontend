import { Flex, Text, Skeleton, List, ListItem, Box } from "@kvib/react";
import { SchemaButton } from "./schema-button";
import { RegelrettLink } from "./metadata/regelrett-link";
import { useFunction } from "@/hooks/use-function";
import { useTeam } from "@/hooks/use-team";
import { BackstageLink } from "./metadata/backstage-link";
import { EditAndSelectButtons } from "./edit-and-select-buttons";

export function FunctionCardSelectedView({
	functionId,
}: { functionId: number }) {
	const { func, metadata, dependencies } = useFunction(functionId, {
		includeMetadata: true,
		includeDependencies: true,
	});
	const teamId = metadata.data?.find((m) => m.key === "team")?.value;
	const { team } = useTeam(teamId);
	const schemaMetadata =
		metadata.data?.filter((m) => m.key.startsWith("rr-")) ?? [];
	const backstageMetadata =
		metadata.data?.filter((m) => m.key.startsWith("backstage-url")) ?? [];
	const teamDisplayName = team.data?.displayName.replace(/.* - /, "");
	const teamLoaded = !metadata.isLoading && !team.isLoading;

	return (
		<Flex flexDirection="column" paddingLeft="10px" w="100%">
			<Flex alignItems="center" w="100%">
				<Skeleton isLoaded={!func.isLoading} fitContent w="100%">
					<Text fontWeight="bold" as="span" display="flex" w="100%">
						{func.data?.name ?? "<Det skjedde en feil>"}
					</Text>
				</Skeleton>
				<EditAndSelectButtons functionId={functionId} selected />
			</Flex>
			<Skeleton isLoaded={teamLoaded} fitContent>
				<Text>{teamDisplayName ?? "<Ingen team>"}</Text>
			</Skeleton>
			{backstageMetadata.map((item) => (
				<BackstageLink url={item.value} key={item.key} />
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
			{schemaMetadata.map((item) => (
				<RegelrettLink
					key={item.key}
					metadata={{
						key: item.key,
						contextId: item.value,
					}}
				/>
			))}
		</Flex>
	);
}
