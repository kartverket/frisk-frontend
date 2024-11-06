import { Flex, Input, Text, Button, useDisclosure } from "@kvib/react";
import { SchemaButton } from "./schema-button";
import { useRef } from "react";
import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { DeleteFunctionModal } from "@/components/delete-function-modal.tsx";
import { TeamSelect } from "./team-select";

export function FunctionCardEdit({ functionId }: { functionId: number }) {
	const { func, updateFunction, metadata, updateMetadataValue } =
		useFunction(functionId);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const navigate = Route.useNavigate();
	const search = Route.useSearch();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const currentTeamId = metadata.data?.find((m) => m.key === "team");

	async function save() {
		const newName = nameInputRef.current?.value;
		const newTeam = document.getElementById("team-value") as HTMLInputElement;

		if (newName && func.data && newName !== func.data?.name) {
			await updateFunction.mutateAsync({
				...func.data,
				name: newName,
			});
		}

		if (currentTeamId?.id && newTeam) {
			await updateMetadataValue.mutateAsync({
				id: currentTeamId.id,
				value: newTeam.value,
			});
		}

		navigate({ search: { ...search, edit: undefined } });
	}

	return (
		<Flex flexDirection="column" paddingLeft="10px" p="2" bgColor="white">
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
			<TeamSelect functionId={functionId} />
			<Text fontSize="xs" fontWeight="700" mb="10px">
				Svar på sikkerhetsspørsmål som er relevant for denne funksjonen
			</Text>
			<SchemaButton functionId={functionId} />
			<Flex gap="10px" mt="32px">
				<Button
					aria-label="decline"
					variant="secondary"
					colorScheme="blue"
					size="sm"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();

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
						e.stopPropagation();

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
					ml="auto"
					onClick={onOpen}
				>
					Slett funksjon
				</Button>
			</Flex>
			<DeleteFunctionModal
				onOpen={onOpen}
				onClose={() => {
					navigate({ search: { ...search, edit: undefined } });
					onClose();
				}}
				isOpen={isOpen}
				functionId={functionId}
			/>
		</Flex>
	);
}
