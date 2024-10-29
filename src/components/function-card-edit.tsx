import { Flex, Input, Text, Button, Skeleton, Select } from "@kvib/react";
import { SchemaButton } from "./schema-button";
import { useUser } from "@/hooks/use-user";
import { useRef } from "react";
import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { useTeam } from "@/hooks/use-team";

export function FunctionCardEdit({ functionId }: { functionId: number }) {
	const {
		func,
		updateFunction,
		removeFunction,
		metadata,
		addMetadata,
		removeMetadata,
	} = useFunction(functionId);
	const { teams } = useUser();
	const nameInputRef = useRef<HTMLInputElement>(null);
	const navigate = Route.useNavigate();
	const search = Route.useSearch();

	const currentTeamId = metadata.data?.find((m) => m.key === "team");
	const { team: currentTeam } = useTeam(currentTeamId?.value);

	async function save() {
		const newName = nameInputRef.current?.value;
		const newTeam = document.getElementById("team-value") as HTMLInputElement;

		if (newName && func.data && newName !== func.data?.name) {
			await updateFunction.mutateAsync({
				...func.data,
				name: newName,
			});
		}

		if (currentTeamId?.id) {
			await removeMetadata.mutateAsync({
				id: currentTeamId.id,
				functionId: functionId,
			});
		}

		if (newTeam && newTeam.value !== "no-team") {
			await addMetadata.mutateAsync({
				functionId: functionId,
				key: "team",
				value: newTeam.value,
			});
		}

		navigate({ search: { ...search, edit: undefined } });
	}

	return (
		<Flex flexDirection="column" paddingLeft="10px" p="2">
			<Text fontSize="xs" fontWeight="700" mb="4px">
				Funksjonsnavn*
			</Text>
			<Input
				autoFocus
				type="text"
				required
				ref={nameInputRef}
				name="name"
				defaultValue={func.data?.name}
				size="sm"
				borderRadius="5px"
				marginBottom="32px"
				onClick={(e) => {
					e.preventDefault();
				}}
			/>
			<Text fontSize="xs" fontWeight="700" mb="4px">
				Ansvarlig team for denne funksjonen?
			</Text>
			<Skeleton isLoaded={!!teams.data} fitContent>
				<Select
					id="team-value"
					name="team-value"
					mb="30px"
					size="sm"
					borderRadius="5px"
					defaultValue={currentTeam.data?.id}
				>
					<option value="no-team">Ingen team</option>
					{teams.data?.map((team) => (
						<option key={team.id} value={team.id}>
							{team.displayName}
						</option>
					))}
				</Select>
			</Skeleton>
			<Text fontSize="xs" fontWeight="700" mb="10px">
				Svar på sikkerhetsspørsmål som er relevant for denne funksjonen
			</Text>
			<SchemaButton functionId={functionId} />
			<Flex gap="12px" mt="32px">
				<Button
					aria-label="decline"
					variant="secondary"
					colorScheme="blue"
					size="sm"
					onClick={(e) => {
						e.preventDefault();
						navigate({ search: { ...search, edit: undefined } });
					}}
				>
					Avbryt
				</Button>
				<Button
					aria-label="check"
					colorScheme="blue"
					size="sm"
					onClick={(e) => {
						e.preventDefault();
						save();
					}}
				>
					Lagre
				</Button>
				<Button
					aria-label="delete"
					variant="tertiary"
					leftIcon="delete"
					size="sm"
					colorScheme="blue"
					onClick={(e) => {
						e.preventDefault();
						if (!func.data) return;
						const deletedFunctionParentPath = func.data.path
							.split(".")
							.slice(0, -1)
							.join(".");

						removeFunction.mutate(func.data.id);
						navigate({
							search: {
								path: deletedFunctionParentPath ?? "1",
							},
						});
					}}
				>
					Slett funksjon
				</Button>
			</Flex>
		</Flex>
	);
}
