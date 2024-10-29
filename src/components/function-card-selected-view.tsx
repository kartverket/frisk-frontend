import { Flex, Text, Icon, IconButton } from "@kvib/react";
import { SchemaButton } from "./schema-button";
import { RegelrettLink } from "./metadata/regelrett-link";
import { Route } from "@/routes";
import { useFunction } from "@/hooks/use-function";
import { useTeam } from "@/hooks/use-team";

export function FunctionCardSelectedView({
	functionId,
}: { functionId: number }) {
	const { func, metadata } = useFunction(functionId, { includeMetadata: true });
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const teamId = metadata.data?.find((m) => m.key === "team")?.value;
	const { team } = useTeam(teamId);
	const schemaMetadata = metadata.data?.filter((m) => m.key.startsWith("rr-"));

	return (
		<Flex flexDirection="column" paddingLeft="10px" w="100%">
			<Flex alignItems="center" w="100%">
				<Text fontWeight="bold" as="span" display="flex" w="100%">
					{func.data?.name}
				</Text>
				<IconButton
					type="button"
					colorScheme="gray"
					variant="ghost"
					aria-label="edit"
					icon="edit"
					onClick={(e) => {
						e.preventDefault();
						navigate({ search: { ...search, edit: functionId } });
					}}
				/>
				<Icon icon={"arrow_back_ios"} />
			</Flex>
			{team && <Text>{team.data?.displayName.replace(/.* - /, "")}</Text>}
			<SchemaButton my="16px" functionId={functionId} />
			{schemaMetadata &&
				schemaMetadata.length > 0 &&
				schemaMetadata.map((item) => (
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